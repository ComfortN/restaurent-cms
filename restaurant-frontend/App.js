import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { store } from './src/reduc/store';

// Import Screens
import LoginScreen from './src/pages/Login';
import SuperAdminDashboard from './src/pages/DashBoard';
import RestaurantAdminDashboard from './src/pages/RestaurantAdminDashboard';
import CreateRestaurant from './src/pages/CreateRestaurantScreen';
import ManageRestaurants from './src/pages/ManageRestaurant';
import EditRestaurantScreen from './src/pages/EditResstaurant';
import RestaurantDetailScreen from './src/pages/RestaurantDetails';
import CreateRestaurantAdmin from './src/pages/CreateRestaurantAdmin';
import ManageReservations from './src/pages/ManageReservations';
import CreateReservation from './src/pages/CreateReservationAdmin';
import ReviewsSection from './src/pages/ReviewsSection';

const Stack = createStackNavigator();

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{ 
            headerShown: false,
            cardStyle: { backgroundColor: '#f5f5f5' }
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          
          {/* Super Admin Routes */}
          <Stack.Screen 
            name="SuperAdminDashboard" 
            component={SuperAdminDashboard} 
            
          />
          <Stack.Screen 
            name="CreateRestaurant" 
            component={CreateRestaurant} 
          />
          <Stack.Screen 
            name="ManageRestaurants" 
            component={ManageRestaurants} 
          />
          <Stack.Screen 
            name="CreateRestaurantAdmin" 
            component={CreateRestaurantAdmin} 
          />
          <Stack.Screen
            name="RestaurantDetails"
            component={RestaurantDetailScreen}
          />
          <Stack.Screen
            name="EditRestaurant"
            component={EditRestaurantScreen}
          />
          <Stack.Screen
          name='RestaurantAdminDashboard'
          component={RestaurantAdminDashboard}
          />
          <Stack.Screen
          name='ManageReservations'
          component={ManageReservations}
          />
          <Stack.Screen
          name='CreateReservation'
          component={CreateReservation}
          />
          <Stack.Screen
          name='Reviews'
          component={ReviewsSection}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;