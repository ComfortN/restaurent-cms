# Restaurant Management System

A comprehensive backend API for managing restaurants, reservations, reviews, and user authentication. The system supports multiple user roles including super admin, restaurant admins, and regular users.

## Features

- **User Management**
  - User registration and authentication
  - JWT-based authentication
  - Multiple user roles (super_admin, restaurant_admin, user)
  - Profile management

- **Restaurant Management**
  - Create, read, update, and delete restaurants
  - Image upload and management using Firestore
  - Restaurant details including name, location, cuisine, tags, etc.
  - Access control based on user roles

- **Reservation System**
  - Create and manage restaurant reservations
  - Payment integration with Paystack
  - Reservation status tracking
  - User-specific reservation history

- **Review System**
  - Customer reviews and ratings
  - Average rating calculation
  - Review management (create, update, delete)
  - Pagination support for reviews

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Firebase account (for image storage)
- Paystack account (for payments)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ComfortN/restaurent-cms.git
cd restaurent-cms
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Restaurants
- `POST /api/restaurants` - Create a new restaurant (Super Admin only)
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant (Super Admin only)

### Reservations
- `POST /api/reservations` - Create a new reservation
- `GET /api/reservations/user` - Get user's reservations
- `PUT /api/reservations/:reservationId` - Update reservation
- `DELETE /api/reservations/:reservationId` - Cancel reservation
- `POST /api/reservations/payment` - Initialize reservation payment
- `POST /api/reservations/payment/confirm` - Confirm payment

### Reviews
- `POST /api/reviews` - Create a review
- `PUT /api/reviews/:reviewId` - Update review
- `DELETE /api/reviews/:reviewId` - Delete review
- `GET /api/reviews/restaurant/:restaurantId` - Get restaurant reviews

## User Roles and Permissions

1. **Super Admin**
   - Create and manage restaurants
   - Create restaurant admins
   - Access all system features

2. **Restaurant Admin**
   - Manage their assigned restaurant
   - View and manage reservations
   - Access restaurant-specific features

3. **Regular User**
   - Browse restaurants
   - Make reservations
   - Write reviews
   - Manage their own profile

## Error Handling

The API uses standard HTTP status codes and returns error messages in the following format:
```json
{
    "message": "Error message description",
    "error": "Detailed error information"
}
```

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Secure file upload handling

