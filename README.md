# Restaurant Management System

A comprehensive solution for managing restaurants, reservations, and reviews with role-based access control. The system consists of a React Native frontend application and a Node.js backend API.

## Live Server Links

- Backend API: https://restaurent-cms.onrender.com/api


## Team Members
- **Comfort Ngwenya** - nqobilecomfyngwenya@gmail.com
- **Sibusiso Khoza** - sibusisok59@gmail.com


## Features

### User Roles
- **Super Admin:** Full system access, manage restaurants and user roles
- **Restaurant Admin:** Manage individual restaurant operations
- **Regular Users:** Browse restaurants, make reservations, write reviews

### Key Functionality
- Role-specific dashboards with real-time statistics
- Comprehensive reservation management system
- Customer review and rating system
- Image upload and management
- Secure payment integration via Paystack
- JWT-based authentication

## Technical Stack

### Frontend
- **Framework:** React Native
- **State Management:** Redux
- **UI Components:** Custom styled components, FontAwesome5, MaterialIcons
- **Development:** Expo
- **Additional Features:** Native DateTimePicker, Image Picker

### Backend
- **Framework:** Node.js with Express
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Firebase (Firestore)
- **Payment:** Paystack Integration

## Installation

### Frontend Setup
1. Clone the repository:
```bash
git clone https://github.com/ComfortN/restaurent-cms.git
```

2. Navigate to frontend directory:
```bash
cd restaurent-cms/restaurant-frontend
```

3. Install dependencies:
```bash
npm install
```

4. Start development server:
```bash
npm start
# or
expo start
```

### Backend Setup
1. Navigate to backend directory:
```bash
cd restaurent-cms/restaurent-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in root directory with following variables:
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

4. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Restaurants
- `POST /api/restaurants` - Create restaurant (Super Admin only)
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant (Super Admin only)

### Reservations
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/user` - Get user's reservations
- `PUT /api/reservations/:reservationId` - Update reservation
- `DELETE /api/reservations/:reservationId` - Cancel reservation
- `POST /api/reservations/payment` - Initialize payment
- `POST /api/reservations/payment/confirm` - Confirm payment

### Reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:reviewId` - Update review
- `DELETE /api/reviews/:reviewId` - Delete review
- `GET /api/reviews/restaurant/:restaurantId` - Get restaurant reviews

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Role-based access control
- Secure file handling with Firebase
- Input validation and sanitization

## Development Guidelines

### Frontend
- Use functional components with hooks
- Implement proper error handling
- Follow React Native best practices
- Maintain consistent styling patterns

### Backend
- Implement proper input validation and sanitization
- Follow RESTful API design principles
- Maintain role-based access control
- Handle errors gracefully

### Documentation Link

https://docs.google.com/document/d/1TjEJnwTE4lGEPFDf5h9vjTBDBPfSCJp3ldqbYRiP5oQ/edit?usp=sharing
