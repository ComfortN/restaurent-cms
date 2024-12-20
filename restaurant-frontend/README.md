# Restaurant Management Application

## Overview
A comprehensive React Native application for managing restaurants, reservations, and restaurant admins. The application supports multiple user roles including super admin and restaurant admin, each with their specific functionalities and dashboards.

## Features

### Super Admin Features
- Dashboard with overview statistics
- Create and manage restaurants
- Create restaurant admin accounts
- View and manage all restaurants in the system
- Complete restaurant management capabilities

### Restaurant Admin Features
- Dashboard with restaurant-specific statistics
- Manage reservations
- View and respond to customer reviews
- Create new reservations
- Monitor restaurant performance
- Track customer feedback

### General Features
- User authentication and authorization
- Role-based access control
- Real-time statistics and updates
- Image upload capabilities
- Responsive design for various screen sizes

## Technical Stack

### Frontend
- React Native
- React Navigation for routing
- Redux for state management
- Expo for development and building
- Native components from @react-native-community

### UI Components
- Custom styled components
- FontAwesome5 and MaterialIcons for icons
- Native DateTimePicker
- Image Picker for photo uploads

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ComfortN/restaurent-cms.git
```

2. Install dependencies:
```bash
cd restaurent-cms/restaurant-frontend
npm install
```

3. Start the development server:
```bash
npm start
# or
expo start
```


## Key Components

### Navigation
The app uses React Navigation with a stack navigator for screen management. The navigation structure includes:
- Login Screen
- Super Admin Dashboard
- Restaurant Admin Dashboard
- Various management screens

### State Management
Redux is used for state management with the following slices:
- Authentication (authSlice)
- Restaurants (restaurantSlice)
- Reservations (reservationSlice)

### Styling
The application uses a consistent color scheme:
- Primary: #B44E13
- Background: #F7BF90
- Accent: #FFE1BB
- Text: Various shades for hierarchy

## Development Guidelines

### Code Style
- Use functional components with hooks
- Implement proper error handling
- Follow React Native best practices
- Maintain consistent styling patterns

### State Management
- Use Redux for global state
- Utilize local state for component-specific data
- Implement proper loading and error states

### Navigation
- Implement proper navigation guards
- Handle deep linking appropriately
- Maintain clean navigation stacks

