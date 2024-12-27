import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../reduc/slices/usersSlice';
import { FontAwesome5 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const EditUserScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.users);
  const { user } = route.params;

  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'user',
    restaurantId: user.restaurantId?._id || ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await dispatch(updateUser({
          userId: user._id,
          userData: formData
        })).unwrap();
        Alert.alert('Success', 'User updated successfully', [{
          text: 'OK',
          onPress: () => navigation.goBack()
        }]);
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to update user');
      }
    }
  };

  const renderInput = (label, field, placeholder, keyboardType = 'default', secure = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError]}
        value={formData[field]}
        onChangeText={(text) => setFormData(prev => ({ ...prev, [field]: text }))}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        placeholderTextColor="#999"
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#B44E13" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit User</Text>
      </View>

      <ScrollView style={styles.formContainer}>
        {renderInput('Name', 'name', 'Enter name')}
        {renderInput('Email', 'email', 'Enter email', 'email-address')}
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Role</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.role}
              style={styles.picker}
              onValueChange={(itemValue) =>
                setFormData(prev => ({ ...prev, role: itemValue }))
              }
            >
              <Picker.Item label="User" value="user" />
              <Picker.Item label="Admin" value="admin" />
              <Picker.Item label="Restaurant Manager" value="manager" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Updating...' : 'Update User'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7BF90'
  },
  header: {
    backgroundColor: '#B44E13',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40
  },
  backButton: {
    marginRight: 15
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  formContainer: {
    padding: 20
  },
  inputContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500'
  },
  input: {
    backgroundColor: '#FFE1BB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333'
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5
  },
  pickerContainer: {
    backgroundColor: '#FFE1BB',
    borderRadius: 8,
    overflow: 'hidden'
  },
  picker: {
    height: 50,
    width: '100%'
  },
  submitButton: {
    backgroundColor: '#B44E13',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default EditUserScreen;