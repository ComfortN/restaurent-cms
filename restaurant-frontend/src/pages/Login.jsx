import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../reduc/slices/authSlice';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const { isAuthenticated, error, isLoading, role } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      // Navigate based on user role
      if (role === 'super_admin') {
        navigation.replace('SuperAdminDashboard');
      } else if (role === 'restaurant_admin') {
        navigation.replace('RestaurantAdminDashboard');
      } else {
        navigation.replace('UserDashboard');
      }
    }
  }, [isAuthenticated, role, navigation]);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error);
      dispatch(clearError());
    }
  }, [error]);

  const handleLogin = () => {
    const loginCredentials = {
      email: email,
      password: password
    };
  
    dispatch(loginUser(loginCredentials))
      .unwrap()
      .then((result) => {
        // Handle successful login
        console.log('Login successful:', result);
      })
      .catch((error) => {
        console.error('Login error:', error);
        Alert.alert('Login Failed', error || 'Unable to log in');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurant CMS</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.loginButtonText}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F7BF90'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#B44E13',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'white'
  },
  loginButton: {
    backgroundColor: '#B44E13',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center'
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default LoginScreen;