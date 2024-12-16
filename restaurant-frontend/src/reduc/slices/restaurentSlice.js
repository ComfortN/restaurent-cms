import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://restaurent-cms.onrender.com/api';

// Fetch all restaurants (super admin)
export const fetchAllRestaurants = createAsyncThunk(
  'restaurants/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_URL}/restaurants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch restaurants'
      );
    }
  }
);

// Create restaurant (super admin)
export const createRestaurant = createAsyncThunk(
  'restaurants/create',
  async (restaurantData, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(`${API_URL}/restaurants`, restaurantData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.restaurant;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create restaurant'
      );
    }
  }
);

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState: {
    restaurants: [],
    selectedRestaurant: null,
    isLoading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedRestaurant: (state, action) => {
      state.selectedRestaurant = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch all restaurants
    builder.addCase(fetchAllRestaurants.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAllRestaurants.fulfilled, (state, action) => {
      state.isLoading = false;
      state.restaurants = action.payload;
    });
    builder.addCase(fetchAllRestaurants.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Create restaurant
    builder.addCase(createRestaurant.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createRestaurant.fulfilled, (state, action) => {
      state.isLoading = false;
      state.restaurants.push(action.payload);
    });
    builder.addCase(createRestaurant.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  }
});

export const { clearError, setSelectedRestaurant } = restaurantSlice.actions;
export default restaurantSlice.reducer;