// Replit Auth implementation for Mr Bubbles Express
// Reference: javascript_log_in_with_replit blueprint
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
  role?: string,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    role: role as 'customer' | 'driver' | 'shop' | 'admin' | undefined,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify = async (
    req: any,
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    userinfo: any,
    done: passport.AuthenticateCallback
  ) => {
    try {
      const user = {};
      updateUserSession(user, tokens);
      
      // Get requested role from session
      const requestedRole = req?.session?.requestedRole;
      
      // Check if user already exists
      const existingUser = await storage.getUser(tokens.claims()["sub"]);
      
      // Only allow role assignment for new users or if changing from customer/driver
      // Prevent unauthorized admin/shop role assignment
      let finalRole = existingUser?.role;
      if (!existingUser) {
        // New user: only allow customer or driver roles
        if (requestedRole === 'customer' || requestedRole === 'driver') {
          finalRole = requestedRole as 'customer' | 'driver';
        } else {
          finalRole = 'customer'; // Default to customer
        }
      } else if (requestedRole && (requestedRole === 'customer' || requestedRole === 'driver')) {
        // Existing user: allow switching between customer and driver only
        if (existingUser.role === 'customer' || existingUser.role === 'driver') {
          finalRole = requestedRole as 'customer' | 'driver';
        }
      }
      
      await upsertUser(tokens.claims(), finalRole);
      if (req?.session) {
        delete req.session.requestedRole;
      }
      done(null, user);
    } catch (error) {
      console.error('Authentication error:', error);
      done(error as Error);
    }
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
        passReqToCallback: true,
      },
      verify as any,
    );
    passport.use(strategy);
  }

  // Preserve all user session data including isSuperAdmin and role
  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    const role = req.query.role as string;
    if (role && ['customer', 'driver', 'shop', 'admin'].includes(role)) {
      (req.session as any).requestedRole = role;
    }
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, async (err: any, user: any) => {
      if (err) {
        console.error('Callback authentication error:', err);
        return res.redirect("/api/login");
      }
      if (!user) {
        console.error('Callback: No user returned from authentication');
        return res.redirect("/api/login");
      }
      
      req.logIn(user, async (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return res.redirect("/api/login");
        }
        
        try {
          // Get user from database to check role
          const dbUser = await storage.getUser(user.claims.sub);
          
          if (!dbUser) {
            console.error('User not found in database after authentication');
            return res.redirect('/');
          }
          
          // Route based on role
          if (dbUser.role === 'customer') {
            return res.redirect('/customer');
          } else if (dbUser.role === 'driver') {
            return res.redirect('/driver');
          } else if (dbUser.role === 'shop') {
            return res.redirect('/shop');
          } else if (dbUser.role === 'admin') {
            return res.redirect('/admin');
          } else {
            return res.redirect('/');
          }
        } catch (error) {
          console.error('Error getting user role:', error);
          return res.redirect('/');
        }
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Custom email/password auth: no expires_at, always valid session
  if (!user.expires_at) {
    return next();
  }

  // OIDC auth: check token expiration and refresh if needed
  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
