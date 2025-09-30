# Tasks for Farm Marketplace MVP Implementation

## Relevant Files

- `src/types/index.ts` - Core TypeScript types for User, Farm, Product, Order models
- `src/types/constants.ts` - Order status constants and all enum-like values with English labels
- `src/types/api.ts` - API request/response type definitions
- `src/api/auth/index.ts` - Extended authentication API functions for farm/consumer registration
- `src/api/auth/` - Complete auth API with React Query Kit hooks and helper functions
- `src/api/farms/index.ts` - Farm management API functions (CRUD operations)
- `src/api/products/index.ts` - Product catalog API functions with search/filter
- `src/api/orders/index.ts` - Order management API functions with status tracking
- `src/api/location/index.ts` - Location services for distance calculation
- `src/lib/hooks/use-location.tsx` - Custom hook for location services
- `src/lib/validation/index.ts` - Form validation schemas for all forms
- `src/components/farm-registration-form.tsx` - Farm registration form component with business info fields
- `src/components/farm-registration-form-utils.ts` - Form utilities and validation helpers
- `src/components/phone-verification.tsx` - Phone number verification component with resend timer
- `src/components/email-verification.tsx` - Email verification component with resend functionality
- `src/components/verification-flow.tsx` - Multi-step verification flow orchestrator
- `src/app/verification.tsx` - Verification screen for post-registration flow
- `src/app/register.tsx` - Registration choice screen for consumer vs farm selection
- `src/app/farms/register.tsx` - Farm registration screen with complete form integration
- `src/app/farms/_layout.tsx` - Layout configuration for farm-related screens
- `src/lib/auth/utils.tsx` - Enhanced auth utilities with farm data types and storage
- `src/lib/auth/index.tsx` - Updated auth store with farm state management
- `src/api/auth/auth-actions.tsx` - Enhanced auth actions for farm registration and login
- `src/lib/auth/enhanced-auth.test.tsx` - Test suite for farm-specific auth functionality
- `src/components/auth/route-guard.tsx` - Generic route protection component with role and permission checking
- `src/components/auth/farm-route-guard.tsx` - Farm-specific route protection component
- `src/components/auth/consumer-route-guard.tsx` - Consumer-specific route protection component
- `src/components/auth/with-auth.tsx` - Higher-order components for route protection
- `src/components/auth/index.tsx` - Auth components export file
- `src/lib/hooks/use-auth-permissions.tsx` - Permission checking hooks for components
- `src/app/(app)/farm-dashboard.tsx` - Example farm dashboard with route protection
- `src/components/auth/route-guard.test.tsx` - Test suite for route protection components
- `src/lib/hooks/use-auth-permissions.test.tsx` - Test suite for permission hooks
- `src/components/farms/farm-card.tsx` - Farm profile display card
- `src/components/farms/farm-profile.tsx` - Detailed farm profile screen component
- `src/components/products/product-card.tsx` - Product listing card component
- `src/components/products/product-form.tsx` - Product creation/edit form
- `src/components/products/product-list.tsx` - Product listing with search/filter
- `src/components/products/product-detail.tsx` - Product detail view
- `src/components/search/search-bar.tsx` - Reusable search input component
- `src/components/search/filter-modal.tsx` - Product filtering modal
- `src/components/cart/cart-item.tsx` - Shopping cart item component
- `src/components/cart/cart-summary.tsx` - Cart total and checkout summary
- `src/components/orders/order-card.tsx` - Order status display component
- `src/components/orders/order-status-timeline.tsx` - Order status progression component
- `src/app/farms/[id].tsx` - Individual farm profile screen
- `src/app/farms/register.tsx` - Farm registration screen
- `src/app/products/[id].tsx` - Product detail screen
- `src/app/cart/index.tsx` - Shopping cart screen
- `src/app/orders/index.tsx` - Order history and tracking screen
- `src/app/orders/[id].tsx` - Individual order detail screen

### Notes

- Follow existing patterns: React Hook Form + Zod validation for forms
- Use React Query Kit pattern for API functions like existing `usePosts`
- Extend existing auth system rather than replacing it
- Leverage existing UI components from `@/components/ui`
- Use Expo Router file-based routing structure
- Follow kebab-case naming convention for all files

## Tasks

- [x] 1.0 Setup Core Data Models & API Foundation

  - [x] 1.1 Create TypeScript interfaces for User, Farm, Product, Order in `src/types/index.ts`
  - [x] 1.2 Define API request/response types in `src/types/api.ts`
  - [x] 1.3 Create order status constants and enums
  - [x] 1.4 Define location and address type definitions
  - [x] 1.5 Setup product category constants (vegetables, fruits, etc.)

- [x] 2.0 Extend Authentication System for Farm/Consumer Registration

  - [x] 2.1 Extend existing auth types to include user roles (consumer/farm)
  - [x] 2.2 Create farm registration API functions in `src/api/auth/index.ts`
  - [x] 2.3 Build farm registration form component with business info fields
  - [x] 2.4 Add phone number verification to existing registration flow
  - [x] 2.5 Create farm registration screen at `src/app/farms/register.tsx`
  - [x] 2.6 Update auth store to handle farm-specific user data
  - [x] 2.7 Create role-based route protection for farm features

- [ ] 3.0 Implement Farm Management System

  - [ ] 3.1 Create farm API functions (create, read, update) in `src/api/farms/index.ts`
  - [ ] 3.2 Build farm profile display card component
  - [ ] 3.3 Create farm profile edit form with location picker
  - [ ] 3.4 Implement farm profile screen at `src/app/farms/[id].tsx`
  - [ ] 3.5 Add farm discovery list for consumers
  - [ ] 3.6 Create farm dashboard for managing products and orders

- [ ] 4.0 Build Product Catalog & Management

  - [ ] 4.1 Create product API functions (CRUD, search, filter) in `src/api/products/index.ts`
  - [ ] 4.2 Build product card component with harvest time display
  - [ ] 4.3 Create product creation/edit form for farms
  - [ ] 4.4 Implement product list component with search functionality
  - [ ] 4.5 Build product detail screen at `src/app/products/[id].tsx`
  - [ ] 4.6 Add image upload functionality for product photos
  - [ ] 4.7 Create product availability status indicators

- [ ] 5.0 Develop Shopping Cart & Order System

  - [ ] 5.1 Create cart state management with Zustand store
  - [ ] 5.2 Build cart item component with quantity controls
  - [ ] 5.3 Implement cart summary with total calculation
  - [ ] 5.4 Create order API functions for placement and management
  - [ ] 5.5 Build checkout screen with payment integration
  - [ ] 5.6 Implement order confirmation flow
  - [ ] 5.7 Add cart persistence using MMKV storage

- [ ] 6.0 Create Location & Search Features

  - [ ] 6.1 Create location service hook for GPS and distance calculation
  - [ ] 6.2 Build search bar component with real-time filtering
  - [ ] 6.3 Implement filter modal for products (category, price, location)
  - [ ] 6.4 Add location-based farm discovery within 100km radius
  - [ ] 6.5 Create search results screen with sorting options
  - [ ] 6.6 Implement location permission handling

- [ ] 7.0 Build Order Management & Status Tracking

  - [ ] 7.1 Create order tracking API functions in `src/api/orders/index.ts`
  - [ ] 7.2 Build order status timeline component
  - [ ] 7.3 Implement order history screen at `src/app/orders/index.tsx`
  - [ ] 7.4 Create individual order detail screen at `src/app/orders/[id].tsx`
  - [ ] 7.5 Build farm order management interface
  - [ ] 7.6 Add order status update functionality for farms
  - [ ] 7.7 Implement order notifications (email/SMS basic)

- [ ] 8.0 Implement Core Navigation & Screens
  - [ ] 8.1 Update main tab navigation for marketplace features
  - [ ] 8.2 Create home screen with farm discovery and featured products
  - [ ] 8.3 Implement search/browse screen for products
  - [ ] 8.4 Add cart screen with checkout flow
  - [ ] 8.5 Create orders tracking screen
  - [ ] 8.6 Build user profile screen with role-specific features
  - [ ] 8.7 Add bottom navigation icons for marketplace tabs
