# Mr Bubbles Express - On-Demand Laundry Service Platform

## Overview

Mr Bubbles Express is a cross-platform laundry service application ecosystem, inspired by UberEats, that manages order collection, processing, and delivery across Ireland. The platform connects customers, drivers, laundry shops, and administrators via mobile apps, web portals, and a public booking widget. It features a hierarchical order tracking model (Order → Bag(s) → Item(s)), QR-based scanning, real-time GPS tracking, revenue split calculations, and anti-fraud mechanisms to ensure operational transparency.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The system employs a multi-surface application design: web portals (Shop and Admin) built with React, Vite, and TypeScript, and mobile-first responsive web apps for customers and drivers. The UI utilizes Shadcn UI with Radix UI, Tailwind CSS, and Material Design 3 principles for a customizable, accessible, and responsive experience with light/dark mode support. State management is handled by TanStack Query for server state and React Hook Form with Zod for forms. Wouter is used for client-side routing with role-based protection.

### Backend Architecture

The backend is an Express.js HTTP server with TypeScript, designed as a RESTful API. It uses session-based authentication with a PostgreSQL session store and includes middleware for logging and error handling. Key API endpoints manage authentication, orders, customer/driver specific order views, services, QR scanning workflows, bag tracking, subcontracting, revenue split calculations, and invoices. Business logic incorporates immutable event trail logging, QR payload deep-linking with security signatures, anti-fraud validation, and policy-driven revenue splits with precise financial rounding.

### Data Storage

The project uses PostgreSQL via Neon serverless and Drizzle ORM for type-safe database operations. The data model includes users (customers, drivers, shops, admins), hierarchical orders, services catalog, shop/subcontracting relationships, scan evidence, split policies, and invoices. Order state transitions are managed through a defined lifecycle. Planned file storage is S3-compatible (Firebase Storage) for assets like photos, QR labels, and PDF documents.

### Authentication & Authorization

Authentication leverages OpenID Connect (OIDC) with Replit Auth and a PostgreSQL session store for 1-week TTL sessions using secure HTTP-only cookies. Role-based access control (RBAC) is implemented across all portals (customer, driver, shop, admin). Security features include planned MFA, IP whitelisting for admin access, encryption for sensitive data, and GDPR compliance.

### Real-Time Features (Planned)

Future enhancements include live GPS tracking for customers, Firebase push notifications for state changes, WebSocket connections for real-time dashboard updates, and offline sync capabilities for the driver mobile app.

### Label Printing Workflow

**IMPORTANT: Web App Bluetooth Limitation**

⚠️ **Browser-based web applications CANNOT directly connect to Bluetooth thermal printers like the Phomemo M220.**

This is a fundamental browser limitation:
- Web Bluetooth API has extremely limited support for printer protocols
- No browser supports the Bluetooth profiles required for thermal printers
- iOS Safari and many mobile browsers completely block Web Bluetooth
- Direct Bluetooth printing REQUIRES a native mobile app (iOS/Android)

**Current Web App Workflow:**
1. Server generates HMAC-signed QR labels via `/api/orders/:id/label-qr`
2. Driver views 70×70mm label preview (203 DPI) with QR code and order details
3. Driver downloads label as PNG image using the download button
4. Driver prints label using one of these methods:
   - Official Phomemo app (connects via Bluetooth to print the downloaded image)
   - Any standard printer via browser print dialog
   - Device's native print system

**Future Native Mobile App:**
Direct Bluetooth printing will be implemented using `react-native-ble-plx` and printer SDKs when building the React Native version.

**Security:**
QR codes are secured with server-side HMAC signatures (`QR_SECRET`) and timestamp validation for 24-hour expiration.

### Deployment Architecture

Development uses a Replit-hosted monorepo with Vite for HMR. Production plans include Docker containerization for backend services, Expo EAS for mobile app builds (APK/IPA) for distribution via app stores, CDN for static assets, and Kubernetes for horizontal scaling post-MVP.

## External Dependencies

### Core Dependencies

**Frontend:**
- React 18, Vite, TypeScript
- Wouter, TanStack Query
- Shadcn UI, Radix UI, Tailwind CSS
- React Hook Form, Zod

**Backend:**
- Express.js, Drizzle ORM
- Passport.js (OpenID Client), Express Session, connect-pg-simple
- Zod

**Database:**
- PostgreSQL (Neon serverless `@neondatabase/serverless`)

**Payment Processing:**
- Stripe SDK (`@stripe/stripe-js`, `@stripe/react-stripe-js`)

### Mobile Dependencies (Planned)

- React Native, Expo CLI, Expo Barcode Scanner
- `react-native-ble-plx`, `react-native-maps`, Expo Location
- `react-native-webview`

### Build & Deployment

- Drizzle Kit, Vite, esbuild
- Docker, Expo EAS

### Other Integrations

- Google Maps/Mapbox (for navigation)
- Firebase (for push notifications and analytics)