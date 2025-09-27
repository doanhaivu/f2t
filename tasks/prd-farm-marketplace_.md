# Product Requirements Document: Farm-to-Table Marketplace

## 1. Introduction/Overview

Farm-to-Table Marketplace is a mobile application that allows urban consumers (primarily families in Hanoi) to purchase fresh agricultural products directly from nearby farms. The application solves the problem of accessing fresh, clean food with traceable origins while supporting farmers to sell their products directly.

**Goal:** Directly connect urban consumers with surrounding farms to purchase fresh, high-quality agricultural products at reasonable prices.

## 2. Goals

1. **Direct Connection:** Create a bridge between farms and consumers, eliminating intermediaries
2. **Quality Assurance:** Provide fresh products harvested according to order requirements
3. **Information Transparency:** Buyers know the origin, harvest time, and delivery schedule
4. **Farmer Support:** Help farms have direct sales channels and increase income
5. **Smooth Experience:** Track orders from placement to product receipt

## 3. User Stories

### Consumers (Buyers):
- **US1:** As an urban family, I want to find farms near me to buy fresh vegetables and fruits
- **US2:** As a buyer, I want to see detailed product information (price, available quantity, harvest time) to make purchasing decisions
- **US3:** As a customer, I want to order before products are harvested to ensure freshness
- **US4:** As a buyer, I want to track order status from placement to delivery
- **US5:** As a regular customer, I want to place subscription orders weekly/monthly

### Farms (Vendors):
- **US6:** As a farm owner, I want to create a profile to showcase my farm and certifications
- **US7:** As a farmer, I want to post products with detailed information (price, unit, expected harvest time)
- **US8:** As a vendor, I want to manage orders and update status for customers
- **US9:** As a farm, I want multiple delivery options (self-delivery or third-party services)

## 4. Functional Requirements

### 4.1 Authentication & Registration
1. **REQ-001:** System must support registration/login via email, phone number, and social accounts (Google, Facebook)
2. **REQ-002:** All accounts must have verified phone numbers for delivery contact
3. **REQ-003:** Farms must go through verification and approval process before being allowed to sell
4. **REQ-004:** Farms must provide information: business license, specific address, contact information

### 4.2 Product Management
5. **REQ-005:** Farms can post products with information: name, description, images, price, selling unit, available quantity
6. **REQ-006:** Each product must have expected harvest time and delivery time information
7. **REQ-007:** Farms can choose selling units (kg, bunch, bag, box, etc.)
8. **REQ-008:** Minimum order quantity is 1 unit

### 4.3 Search & Browse Products
9. **REQ-009:** Users can search products by name, type, and farm location
10. **REQ-010:** System displays farms within 100km radius from Hanoi
11. **REQ-011:** Users can filter products by price, delivery time, product type
12. **REQ-012:** Display farm information: name, address, certifications (if any)

### 4.4 Ordering & Payment
13. **REQ-013:** Users can add products to cart and place orders
14. **REQ-014:** Support one-time orders and subscriptions (weekly/monthly)
15. **REQ-015:** Support multiple payment methods: cash, bank transfer, e-wallets
16. **REQ-016:** Calculate delivery fees based on distance and delivery method

### 4.5 Order Management
17. **REQ-017:** System tracks orders through statuses: Pending → Accepted → Preparing → Harvesting → Ready for delivery → In transit → Delivered → Completed
18. **REQ-018:** Additional statuses: Cancelled, Refunded
19. **REQ-019:** Farms can manually update order status
20. **REQ-020:** Send notifications to customers when order status changes

### 4.6 Delivery
21. **REQ-021:** Support direct delivery from farms and third-party delivery services
22. **REQ-022:** Calculate delivery fees: direct by distance, warehouse route as farm→warehouse→user
23. **REQ-023:** Same-day delivery timeframe
24. **REQ-024:** Customers can choose delivery address and preferred time

### 4.7 Additional Features (Phase 2)
25. **REQ-025:** Rating and review system for products/farms
26. **REQ-026:** Direct chat feature between customers and farms
27. **REQ-027:** Wishlist/Favorite to save preferred products
28. **REQ-028:** Order history and quick reorder functionality

## 5. Non-Goals (Out of Scope)

1. **Processed Products:** No selling of jams, juices, or processed products in the initial version
2. **Mandatory Certifications:** No requirement for organic or food safety certifications
3. **Inventory Management:** No complex inventory management system development
4. **Dispute Resolution:** No automated dispute resolution system
5. **ERP Integration:** No integration with farm ERP systems

## 6. Design Considerations

### Platform:
- **Primary:** Mobile app (React Native/Expo)
- **Secondary:** Web app for development and testing
- **Responsive:** Mobile-first optimization

### UI/UX Requirements:
- **Design:** Clean, modern, easy to use for elderly users
- **Colors:** Green and white tones to represent nature and freshness
- **Navigation:** Tab-based navigation for main features
- **Accessibility:** Support text scaling and high contrast

### Key Screens:
- Home/Discovery: Farm listings and featured products
- Product catalog: Browse products by category
- Farm profile: Detailed farm information
- Cart & Checkout: Order placement process
- Order tracking: Order status monitoring
- Profile management: Account management

## 7. Technical Considerations

### Technology Stack:
- **Frontend:** React Native with Expo
- **Backend:** Node.js with Express or NestJS
- **Database:** PostgreSQL for main data, Redis for cache
- **Authentication:** Firebase Auth or Auth0
- **Payment:** Integration with VNPay, MoMo, ZaloPay
- **Maps:** Google Maps API for location services
- **Push Notifications:** Firebase Cloud Messaging
- **File Storage:** AWS S3 or CloudFlare for images

### Key Integrations:
- **Maps & Location:** Google Maps API for distance calculation and location display
- **SMS:** Twilio or Esms.vn for OTP verification
- **Payment Gateways:** VNPay, MoMo, ZaloPay APIs
- **Delivery Partners:** Potential integration with GrabExpress, AhaMove

### Performance Requirements:
- **Load time:** < 3 seconds for main screens
- **Offline capability:** Cache basic data for offline browsing
- **Image optimization:** Lazy loading and compression for product images

## 8. Success Metrics

### User Acquisition:
- **Target:** 1,000 registered users in the first 3 months
- **Target:** 50 verified farms in the first 3 months

### Engagement:
- **Order completion rate:** > 85%
- **User retention:** > 60% after 1 month
- **Average order value:** > 200,000 VND

### Business:
- **Monthly transactions:** > 500 orders/month after 3 months
- **Customer satisfaction:** > 4.5/5 stars average rating
- **Farm satisfaction:** > 80% farms rate the platform as helpful

### Technical:
- **App crash rate:** < 1%
- **API response time:** < 500ms for 95% of requests
- **Uptime:** > 99.5%

## 9. Open Questions

1. **Legal & Compliance:**
   - What licenses are needed to operate a food marketplace in Vietnam?
   - Legal responsibility when there are product quality issues?

2. **Business Model:**
   - Commission structure for the platform (% from each order)?
   - Listing fees for farms?
   - Pricing strategy for delivery fees?

3. **Operations:**
   - Process for handling product quality complaints?
   - Support team structure to handle customer service?
   - Quality control process for new farms?

4. **Technical:**
   - Real-time tracking implementation for delivery?
   - Inventory sync frequency from farms?
   - Backup strategy for order data?

5. **Scaling:**
   - Plan to expand to other cities?
   - International expansion possibilities?
   - Partnership strategy with retail chains?

---

**Document Version:** 1.0  
**Last Updated:** September 20, 2025  
**Next Review:** October 20, 2025
