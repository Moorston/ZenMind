## ADDED Requirements

### Requirement: Create payment order
The system SHALL allow authenticated users to create payment orders for courses or memberships.

#### Scenario: Create course purchase order
- **WHEN** a user sends `POST /api/payments/orders` with `{ type: 'course', itemId: 'course-1' }`
- **THEN** it SHALL create an order with status='pending' and return the order with prepayId

#### Scenario: Create membership purchase order
- **WHEN** a user sends `POST /api/payments/orders` with `{ type: 'membership', itemId: 'premium' }`
- **THEN** it SHALL create an order with the membership price

### Requirement: WeChat Pay integration
The system SHALL integrate with WeChat Pay for processing payments.

#### Scenario: Unified order API call
- **WHEN** an order is created
- **THEN** the system SHALL call WeChat Pay unified order API and return prepay_id to the frontend

#### Scenario: Payment callback received
- **WHEN** WeChat Pay sends a payment success callback
- **THEN** the system SHALL verify the signature, update order status to 'paid', and unlock the content

### Requirement: Course unlock after payment
The system SHALL unlock course access after successful payment.

#### Scenario: Course unlocked after payment
- **WHEN** a course purchase payment is confirmed
- **THEN** the user's progress record SHALL be created for that course, granting access

### Requirement: Membership system
The system SHALL support a tiered membership system (free/premium/vip).

#### Scenario: Activate premium membership
- **WHEN** a premium membership payment is confirmed
- **THEN** the system SHALL create/update the user's membership record with level='premium' and expiresAt

#### Scenario: Membership expires
- **WHEN** a user's membership expiresAt has passed
- **THEN** the system SHALL treat the user as 'free' tier

### Requirement: Order history
The system SHALL allow users to view their order history.

#### Scenario: Get order history
- **WHEN** `GET /api/payments/orders` is called by an authenticated user
- **THEN** it SHALL return the user's orders ordered by createdAt descending
