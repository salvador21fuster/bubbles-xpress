# Mr Bubbles Express - On-Demand Laundry Service Platform

## Overview

Mr Bubbles Express is a comprehensive, cross-platform laundry service application ecosystem modeled after UberEats, providing end-to-end order management for laundry collection, processing, and delivery across Ireland. The platform connects customers, drivers, laundry shops, and administrators through multiple interfaces including mobile apps, web portals, and a public booking widget.

The system implements a hierarchical order tracking model (Order → Bag(s) → Item(s)) with QR-based scanning workflows, real-time GPS tracking, revenue split calculations, and anti-fraud mechanisms for complete operational transparency.

## Recent Updates

- **2025-10-11**: 3D Drogheda map visualization - Interactive map showing Mr Bubbles HQ on Bubbles Road with animated van, geofence boundary for pilot area, Uber-style tracking experience
- **2025-10-11**: Pilot area restrictions - Booking form locked to "Drogheda, Louth" only, enforcing service area boundaries for pilot launch
- **2025-10-11**: Camera QR scanning complete - html5-qrcode integration with live camera, auto-stop on scan, photo/signature capture, manual entry fallback
- **2025-10-11**: Live GPS tracking operational - Real-time driver location updates, customer map view, 5-second polling for position updates
- **2025-10-11**: Super admin feature implemented - benbubbles and ronanbubbles can sign into ALL portal types (customer, driver, shop, admin) by selecting the role at login
- **2025-10-10**: Authentication system overhauled - Custom email/password auth with bcrypt, username/phone login support, all 4 roles (customer, driver, shop, admin)
- **2025-10-10**: Admin users created - benbubbles and ronanbubbles admin accounts seeded for Admin Portal access
- **2025-10-10**: Admin Portal enhanced - Complete oversight with Dashboard, Transactions, Invoices, Users, and Policies pages
- **2025-10-10**: SignUp/SignIn pages updated - Phone number required, username/email optional, supports all 4 user roles
- **2025-10-10**: Multi-identifier login - Users can sign in with email, username, or phone number
- **2025-10-10**: Dedicated auth portal pages created - Customer and Driver login/signup portals with branded UI, role-specific messaging
- **2025-10-10**: Landing page hero image optimized - Professional driver/customer photo showing Mr Bubbles bag with perfect framing
- **2025-10-10**: Customer and Driver apps complete - Mobile-first responsive web apps with order booking, tracking, pickup/delivery workflows
- **2025-10-10**: All four user portals operational - Customer App (booking, order history), Driver App (pickups/deliveries, earnings), Shop Portal, Admin Portal
- **2025-10-10**: Mr Bubbles logo integrated throughout application (landing page, shop portal, admin portal)
- **2025-10-10**: Security hardening complete - Comprehensive Zod validation, EUR/VAT pricing (23% Ireland VAT), state machine enforcement, RBAC on all endpoints
- **2025-10-10**: Complete database schema with all 12 tables implemented and seeded with initial data
- **2025-10-10**: Backend fully implemented - PostgreSQL database, custom auth system, all API endpoints, revenue split calculation engine

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Multi-Surface Application Design:**
- **Web Portals (React + Vite + TypeScript):** Shop Portal and Admin Portal built with React, using Vite for bundling and development
- **Mobile-First Web Apps:** Customer and Driver apps implemented as responsive web applications with mobile-optimized UI (no sidebar layout)
- **Public Widget:** Embeddable booking form integrated into the main web application

**UI Framework:**
- Shadcn UI component library with Radix UI primitives for accessible, customizable components
- Material Design 3 principles with custom branding
- Tailwind CSS for styling with custom design tokens
- Light/dark mode theming support
- Responsive design optimized for mobile-first workflows

**State Management:**
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod validation for form handling
- React Context for theme and authentication state

**Routing:**
- Wouter for lightweight client-side routing
- Role-based route protection (customer, driver, shop, admin)

### Backend Architecture

**API Server:**
- Express.js HTTP server with TypeScript
- RESTful API design following the Postman collection structure
- Session-based authentication with PostgreSQL session store
- Middleware for request logging and error handling

**Core API Endpoints:**
- `/api/auth/*` - Authentication (login, user management)
- `/api/orders` - Order CRUD operations
- `/api/customer/orders` - Customer order history
- `/api/driver/orders` - Driver pickup/delivery queue
- `/api/services` - Service catalog (public)
- `/api/scan` - QR scanning workflow management
- `/api/orders/:id/bags` - Bag creation and tracking
- `/api/orders/:id/subcontract` - Shop-to-shop subcontracting
- `/api/splits/calculate` - Revenue split calculations
- `/api/invoices` - Invoice generation and management

**Business Logic:**
- Immutable event trail logging for all state transitions
- QR payload deep-linking schema: `mrbl://o/{order_id}`, `mrbl://b/{bag_id}`, `mrbl://i/{item_id}`
- Anti-fraud validation (scan count matching, duplicate detection, two-party handoffs)
- Policy-driven revenue splits with configurable percentages per service/shop pair
- Automated rounding to HALF_UP for financial accuracy

### Data Storage

**Database:**
- PostgreSQL via Neon serverless
- Drizzle ORM for type-safe database operations
- Schema-driven migrations with drizzle-kit

**Data Model:**
- Users (customers, drivers, shops, admins) with role-based access
- Orders with hierarchical structure (orders → bags → items)
- Services catalog with pricing per unit (kg/item)
- Shops and subcontracting relationships
- Scans with photo/geo/signature evidence
- Split policies and calculated splits
- Invoices for shop/driver reconciliation
- Order state transitions: `created` → `picked_up` → `at_origin_shop` → `processing` → `delivered` → `closed`

**File Storage (Planned):**
- S3-compatible storage (Firebase Storage) for photos, QR labels, and PDF documents
- ZPL/EPL format label generation for Bluetooth thermal printers

### Authentication & Authorization

**Replit Auth Integration:**
- OpenID Connect (OIDC) authentication flow
- Session management with PostgreSQL session store
- 1-week session TTL with secure HTTP-only cookies
- Role-based access control (RBAC) for portal access

**Security Features:**
- MFA and IP whitelisting for admin/owner access
- Encryption for sensitive data
- GDPR compliance considerations
- Request/response logging for audit trails

**Authorization Flow:**
- Public access: Landing page and booking widget
- Authenticated access: Role-specific dashboards (shop, admin)
- Owner-only access: Enhanced admin portal with transaction records

### Real-Time Features (Planned)

- Live GPS tracking for customer order visibility
- Push notifications via Firebase for state changes
- WebSocket connections for real-time dashboard updates
- Offline sync capabilities for driver mobile app

### Integration Points

**Third-Party Services:**
- Google Maps/Mapbox for turn-by-turn navigation
- Stripe for payment processing (`@stripe/stripe-js`, `@stripe/react-stripe-js`)
- Firebase for push notifications and analytics
- BLE printing integration (`react-native-ble-plx`) for label generation

**Monitoring & Analytics:**
- OpenTelemetry logging hooks (planned)
- ClickHouse/BigQuery for event analytics (MVP: Firebase Analytics)
- Grafana integration via Replit (planned)

### Deployment Architecture

**Development:**
- Replit-hosted monorepo with hot module replacement (HMR)
- Vite dev server with middleware mode
- Environment-based configuration (development/production)

**Production (Planned):**
- Docker containerization for backend services
- Expo EAS for mobile app builds (APK/IPA)
- Distribution via Google Play Store and Apple App Store
- CDN for static asset delivery
- Horizontal scaling with Kubernetes (post-MVP)

## External Dependencies

### Core Dependencies

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling and development
- Wouter for routing
- TanStack Query for data fetching
- Shadcn UI + Radix UI for component library
- Tailwind CSS for styling
- React Hook Form + Zod for form validation

**Backend:**
- Express.js for HTTP server
- Drizzle ORM for database operations
- Passport.js with OpenID Client for authentication
- Express Session with connect-pg-simple for session storage
- Zod for runtime validation

**Database:**
- PostgreSQL (Neon serverless `@neondatabase/serverless`)
- WebSocket support for serverless connection pooling

**Payment Processing:**
- Stripe SDK for web (`@stripe/stripe-js`, `@stripe/react-stripe-js`)

**Development Tools:**
- TypeScript for type safety
- ESBuild for production builds
- TSX for development server execution
- Replit-specific plugins (cartographer, dev banner, runtime error overlay)

### Mobile Dependencies (Planned)

- React Native with Expo CLI
- Expo Barcode Scanner for QR code scanning
- react-native-ble-plx for Bluetooth label printer integration
- react-native-maps for GPS tracking visualization
- Expo Location for driver geolocation
- react-native-webview for embedded crash course content

### Build & Deployment

- Drizzle Kit for database migrations
- Vite build system for frontend bundling
- esbuild for backend bundling (ESM format)
- Docker for containerization (production)
- Expo EAS for mobile app deployment

### Font & Asset Delivery

- Google Fonts (Inter for UI, JetBrains Mono for technical data)
- Custom CSS variables for theming
- Responsive image optimization