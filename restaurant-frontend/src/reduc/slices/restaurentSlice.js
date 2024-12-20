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

export const fetchRestaurantById = createAsyncThunk(
  'restaurants/fetchById',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_URL}/restaurants/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched Restaurant Data:', response.data); // Add this line
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant by ID:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch restaurant details'
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
      
      // Ensure the content type is multipart/form-data
      const response = await axios.post(`${API_URL}/restaurants`, restaurantData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.restaurant;
    } catch (error) {
      console.error('Full Create Restaurant Error:', 
        error.response ? JSON.stringify(error.response.data) : error.message
      );
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create restaurant'
      );
    }
  }
);


// Update Restaurant 
export const updateRestaurant = createAsyncThunk(
    'restaurants/update',
    async ({ restaurantId, restaurantData }, { rejectWithValue }) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.put(`${API_URL}/restaurants/${restaurantId}`, restaurantData, {
            headers: { Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
             }
            });
            return response.data.restaurant;
        } catch (error) {
            return rejectWithValue(
            error.response?.data?.message || 'Failed to update restaurant'
            );
        }
        }
    );
    
    // Delete Restaurant
    export const deleteRestaurant = createAsyncThunk(
        'restaurants/delete',
        async (restaurantId, { rejectWithValue }) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.delete(`${API_URL}/restaurants/${restaurantId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return restaurantId;
        } catch (error) {
            return rejectWithValue(
            error.response?.data?.message || 'Failed to delete restaurant'
        );
        }
        }
    );

    

    //Fetch restaurant reviews
    export const fetchRestaurantReviews = createAsyncThunk(
      'restaurants/fetchReviews',
      async ({ restaurantId, page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          const response = await axios.get(
            `${API_URL}/reviews/restaurants/${restaurantId}/reviews?page=${page}&limit=${limit}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          return response.data;
        } catch (error) {
          return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
        }
      }
    );

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState: {
    restaurants: [],
    selectedRestaurant: null,
    reviews: {
      items: [],
      totalPages: 0,
      currentPage: 1,
      totalReviews: 0
    },
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

    builder.addCase(fetchRestaurantById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchRestaurantById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedRestaurant = action.payload;
      // Update the restaurant in the list if it exists
      const index = state.restaurants.findIndex(r => r._id === action.payload._id);
      if (index !== -1) {
        state.restaurants[index] = action.payload;
      }
    });
    builder.addCase(fetchRestaurantById.rejected, (state, action) => {
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
    
  // Update Restaurant Cases
    builder.addCase(updateRestaurant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
    });
    builder.addCase(updateRestaurant.fulfilled, (state, action) => {
        state.isLoading = false;
        // Replace the updated restaurant in the list
        const index = state.restaurants.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
            state.restaurants[index] = action.payload;
        }
        // Update selected restaurant if it exists
        if (state.selectedRestaurant?._id === action.payload._id) {
            state.selectedRestaurant = action.payload;
        }
    });
    builder.addCase(updateRestaurant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
    });

    // Delete Restaurant Cases
    builder.addCase(deleteRestaurant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
    });
    builder.addCase(deleteRestaurant.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove the deleted restaurant from the list
        state.restaurants = state.restaurants.filter(r => r._id !== action.payload);
        // Clear selected restaurant if it was the deleted one
        if (state.selectedRestaurant?._id === action.payload) {
            state.selectedRestaurant = null;
        }
    });
    builder.addCase(deleteRestaurant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
    });

    // Fetch restaurant reviews
    builder.addCase(fetchRestaurantReviews.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchRestaurantReviews.fulfilled, (state, action) => {
      state.isLoading = false;
      state.reviews = {
        items: action.payload.reviews,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
        totalReviews: action.payload.totalReviews
      };
      // Update selectedRestaurant with totalReviews and averageRating
      if (state.selectedRestaurant) {
        state.selectedRestaurant.totalReviews = action.payload.totalReviews;
        state.selectedRestaurant.averageRating = action.payload.averageRating;
      }
    });
    builder.addCase(fetchRestaurantReviews.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    }
});

export const { clearError, setSelectedRestaurant } = restaurantSlice.actions;
export default restaurantSlice.reducer;