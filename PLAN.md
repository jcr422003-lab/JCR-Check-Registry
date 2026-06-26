# Check Register Rebuild Plan

## Goal
Build a secure, cross-platform check register application that can be used on mobile and desktop/browser, with shared data, offline-friendly behavior, and a low-cost architecture.

## Recommended architecture
- Frontend: React + TypeScript
- Web app hosting: Vercel
- Mobile packaging: Capacitor
- Desktop packaging: Tauri
- Database: Supabase Postgres
- Authentication: Supabase Auth
- Optional storage: Supabase Storage or S3-compatible storage later

## Why this stack
- Shared data across phone and computer
- Works well for mobile-first entry and desktop reconciliation
- Keeps the architecture simpler than building a custom backend from scratch
- Low ongoing cost for a household or small personal finance app

## Core product scope
Phase 1 should include:
- account management
- transaction entry and editing
- viewing balances
- simple search/filtering
- reconciliation workflow
- categories
- import/export backup support

## Implementation phases

### Phase 1 — Product definition and data model
- Review the existing app behavior from the current prototype
- Define the initial data model for:
  - users
  - accounts
  - categories
  - transactions
  - reconciliation state
- Define the first user journeys:
  - see balance
  - add transaction on mobile
  - reconcile later on desktop/browser

### Phase 2 — App foundation
- Create a React + TypeScript + Vite app
- Build a mobile-first UI shell
- Create reusable components for:
  - dashboard
  - account list
  - transaction form
  - transaction list
  - reconciliation view

### Phase 3 — Backend and data platform
- Create a Supabase project
- Provision the database schema
- Add authentication
- Add row-level security and basic access rules
- Create initial seed data for categories and default account types

### Phase 4 — Data access and sync layer
- Build a service layer for reading and writing data
- Cache data locally for speed
- Sync local changes to the shared database and pull remote updates
- Implement conflict handling for edits made on different devices

### Phase 5 — Core finance workflows
- Add/edit/delete transactions
- Calculate balances from transactions
- Support categories and transfers
- Add search and filtering
- Add reconciliation workflow
- Add simple monthly summaries and reports

### Phase 6 — Packaging and deployment
- Package the app for mobile with Capacitor
- Package the app for desktop with Tauri
- Deploy the web app to Vercel
- Validate the experience on mobile and desktop

## Platform breakdown
- Web frontend hosting: Vercel
- Database: Supabase Postgres
- Auth: Supabase Auth
- File storage: Supabase Storage later if needed
- Mobile packaging: Capacitor
- Desktop packaging: Tauri
- Error tracking: Sentry (optional)

## Verification milestones
- The app can sign in and load shared data
- A transaction entered on mobile appears in the browser version
- Reconciliation works from browser or desktop
- The app loads quickly and remains usable offline
- The app can be packaged for mobile and desktop

## Recommended first milestone
Build the first usable version with:
- sign-in
- account list
- transaction entry
- balance view
- transaction history
- basic sync

That first milestone is enough to validate the architecture before expanding the feature set.
