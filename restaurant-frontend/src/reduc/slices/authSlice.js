import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_URL = 'https://restaurent-cms.onrender.com/api';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('userToken', response.data.token);
      
      return {
        token: response.data.token,
        role: response.data.role
      };
    } catch (error) {
      console.error('Full Login Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      return rejectWithValue(
        
        error.response?.data?.message && 'Login failed'
      );
    }
  }
);

// Async thunk for profile fetch
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch profile'
      );
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    await AsyncStorage.removeItem('userToken');
    return null;
  }
);


// Async thunk for creating restaurant admin
export const createRestaurantAdmin = createAsyncThunk(
  'auth/createRestaurantAdmin',
  async (adminData, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(`${API_URL}/auth/create-restaurant-admin`, adminData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create restaurant admin'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    role: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login reducers
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    });

    // Profile fetch reducers
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });

    // Logout reducers
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.token = null;
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
    });

    // Add this to your extraReducers in the existing slice
    builder.addCase(createRestaurantAdmin.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createRestaurantAdmin.fulfilled, (state, action) => {
      state.isLoading = false;
      // Optionally, you might want to do something with the created admin
    });
    builder.addCase(createRestaurantAdmin.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;