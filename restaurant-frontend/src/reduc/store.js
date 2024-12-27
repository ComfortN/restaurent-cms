import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import restaurantReducer from './slices/restaurentSlice';
import reservationReducer from './slices/reservationSlice';
import usersReducer from './slices/usersSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurants: restaurantReducer,
    reservations: reservationReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for complex objects
    }),
});