import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://restaurent-cms.onrender.com/api';

// Fetch user's reservations
export const fetchUserReservations = createAsyncThunk(
  'reservations/fetchUserReservations',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_URL}/reservations/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.reservations;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch reservations'
      );
    }
  }
);

// Fetch restaurant-specific reservations (for restaurant admin)
export const fetchRestaurantReservations = createAsyncThunk(
  'reservations/fetchRestaurantReservations',
  async (restaurantId, { rejectWithValue }) => {
    try {
      console.log('Fetching reservations for restaurantId:', restaurantId);
      
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token:', token);

      const response = await axios.get(`${API_URL}/reservations/restaurant/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Reservations response:', response.data);
      return response.data.reservations;
    } catch (error) {
      console.error('Error fetching restaurant reservations:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch restaurant reservations'
      );
    }
  }
);

// Create a new reservation
export const createReservation = createAsyncThunk(
  'reservations/create',
  async (reservationData, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(`${API_URL}/reservations`, reservationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.reservation;
    } catch (error) {
      console.log('error creating: ', error)
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create reservation'
      );
    }
  }
);

// Update reservation status (for restaurant admin)
export const updateReservationStatus = createAsyncThunk(
  'reservations/updateStatus',
  async ({ reservationId, status }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.put(`${API_URL}/reservations/status/${reservationId}`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } 
      });
      return response.data.reservation;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update reservation status'
      );
    }
  }
);

// Cancel a reservation
export const cancelReservation = createAsyncThunk(
  'reservations/cancel',
  async (reservationId, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.patch(`${API_URL}/reservations/${reservationId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return reservationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to cancel reservation'
      );
    }
  }
);

const reservationSlice = createSlice({
  name: 'reservations',
  initialState: {
    reservations: [],
    isLoading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch user reservations
    builder.addCase(fetchUserReservations.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserReservations.fulfilled, (state, action) => {
      state.isLoading = false;
      state.reservations = action.payload;
    });
    builder.addCase(fetchUserReservations.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch restaurant reservations
    builder.addCase(fetchRestaurantReservations.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchRestaurantReservations.fulfilled, (state, action) => {
      state.isLoading = false;
      state.reservations = action.payload;
    });
    builder.addCase(fetchRestaurantReservations.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Create reservation
    builder.addCase(createReservation.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createReservation.fulfilled, (state, action) => {
      state.isLoading = false;
      state.reservations.push(action.payload);
    });
    builder.addCase(createReservation.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Update reservation status
    builder.addCase(updateReservationStatus.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateReservationStatus.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.reservations.findIndex(r => r._id === action.payload._id);
      if (index !== -1) {
        state.reservations[index] = action.payload;
      }
    });
    builder.addCase(updateReservationStatus.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Cancel reservation
    builder.addCase(cancelReservation.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(cancelReservation.fulfilled, (state, action) => {
      state.isLoading = false;
      state.reservations = state.reservations.filter(
        reservation => reservation._id !== action.payload
      );
    });
    builder.addCase(cancelReservation.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  }
});

export const { clearError } = reservationSlice.actions;
export default reservationSlice.reducer;