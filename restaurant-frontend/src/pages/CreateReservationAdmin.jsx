import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Platform 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { createReservation } from '../reduc/slices/reservationSlice';
import { FontAwesome5 } from '@expo/vector-icons';

const CreateReservation = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { isLoading } = useSelector(state => state.reservations);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [partySize, setPartySize] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || (mode === 'date' ? date : time);
    
    // Hide picker for non-iOS platforms
    if (Platform.OS !== 'ios') {
      setShow(false);
    }

    // Update either date or time based on current mode
    if (mode === 'date') {
      setDate(currentDate);
    } else {
      setTime(currentDate);
    }
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  const handleCreateReservation = () => {
    // Validate inputs
    if (!customerName.trim()) {
      Alert.alert('Error', 'Please enter customer name');
      return;
    }

    if (!customerPhone.trim()) {
      Alert.alert('Error', 'Please enter customer phone number');
      return;
    }

    if (!partySize.trim() || isNaN(parseInt(partySize))) {
      Alert.alert('Error', 'Please enter a valid party size');
      return;
    }

    // Additional date validation
    const now = new Date();
    if (date < now) {
      Alert.alert('Error', 'Please select a future date');
      return;
    }

    // Combine date and time
    const reservationDateTime = new Date(
      date.getFullYear(), 
      date.getMonth(), 
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    // Prepare reservation data
    const reservationData = {
      restaurantId: user?.restaurantId?._id,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      partySize: parseInt(partySize),
      reservationDateTime: reservationDateTime.toISOString(),
      specialRequests: specialRequests.trim() || undefined
    };

    // Dispatch create reservation action
    dispatch(createReservation(reservationData))
      .unwrap()
      .then(() => {
        Alert.alert(
          'Success', 
          'Reservation created successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      })
      .catch((error) => {
        Alert.alert('Error', error || 'Failed to create reservation');
      });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Reservation</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Customer Details</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Customer Name *"
          value={customerName}
          onChangeText={setCustomerName}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Customer Email (Optional)"
          value={customerEmail}
          onChangeText={setCustomerEmail}
          keyboardType="email-address"
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Customer Phone *"
          value={customerPhone}
          onChangeText={setCustomerPhone}
          keyboardType="phone-pad"
          placeholderTextColor="#999"
        />

        <Text style={styles.sectionTitle}>Reservation Details</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Party Size *"
          value={partySize}
          onChangeText={setPartySize}
          keyboardType="numeric"
          placeholderTextColor="#999"
        />

        {/* Date Selection */}
        <TouchableOpacity 
          style={styles.dateTimeInput} 
          onPress={showDatepicker}
        >
          <FontAwesome5 name="calendar" size={20} color="#B44E13" />
          <Text style={styles.dateTimeText}>
            {date.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {/* Time Selection */}
        <TouchableOpacity 
          style={styles.dateTimeInput} 
          onPress={showTimepicker}
        >
          <FontAwesome5 name="clock" size={20} color="#B44E13" />
          <Text style={styles.dateTimeText}>
            {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
        </TouchableOpacity>

        {/* DateTimePicker */}
        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={mode === 'date' ? date : time}
            mode={mode}
            is24Hour={true}
            display="default"
            onChange={onChange}
            minimumDate={new Date()} // Prevent selecting past dates
          />
        )}

        <TextInput
          style={styles.multilineInput}
          placeholder="Special Requests (Optional)"
          value={specialRequests}
          onChangeText={setSpecialRequests}
          multiline
          numberOfLines={4}
          placeholderTextColor="#999"
        />

        <TouchableOpacity 
          style={styles.createButton} 
          onPress={handleCreateReservation}
          disabled={isLoading}
        >
          <FontAwesome5 name="plus-circle" size={20} color="white" />
          <Text style={styles.createButtonText}>
            {isLoading ? 'Creating...' : 'Create Reservation'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: '#F7BF90'
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 15,
          paddingTop: 50,
          backgroundColor: '#B44E13',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        },
        backButton: {
          marginRight: 15
        },
        headerTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: 'white'
        },
        formContainer: {
          padding: 15
        },
        sectionTitle: {
          fontSize: 16,
          fontWeight: 'bold',
          marginTop: 15,
          marginBottom: 10,
          color: '#B44E13'
        },
        input: {
          backgroundColor: 'white',
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginBottom: 10,
          fontSize: 16
        },
        multilineInput: {
          backgroundColor: 'white',
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginBottom: 10,
          fontSize: 16,
          height: 100,
          textAlignVertical: 'top'
        },
        dateTimeInput: {
          backgroundColor: 'white',
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginBottom: 10,
          flexDirection: 'row',
          alignItems: 'center'
        },
        dateTimeText: {
          marginLeft: 10,
          fontSize: 16,
          color: '#333'
        },
        createButton: {
          backgroundColor: '#B44E13',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 15,
          borderRadius: 10,
          marginTop: 10
        },
        createButtonText: {
          color: 'white',
          fontWeight: 'bold',
          fontSize: 16,
          marginLeft: 10
        },
        modalContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        },
        modalContent: {
          backgroundColor: 'white',
          borderRadius: 10,
          padding: 20,
          width: '80%',
          alignItems: 'center'
        },
        modalTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 15
        },
        datePickerContainer: {
          width: '100%',
          marginBottom: 15
        },
        timePickerContainer: {
          width: '100%',
          marginBottom: 15
        },
        dateInputRow: {
          flexDirection: 'row',
          justifyContent: 'space-between'
        },
        timeInputRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        },
        dateInput: {
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 5,
          padding: 10,
          width: '30%',
          textAlign: 'center'
        },
        timeInput: {
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 5,
          padding: 10,
          width: '30%',
          textAlign: 'center'
        },
        timeSeparator: {
          fontSize: 20,
          marginHorizontal: 10
        },
        modalButtonContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%'
        },
        modalButton: {
          padding: 10,
          width: '45%',
          alignItems: 'center',
          backgroundColor: '#B44E13',
          borderRadius: 5
        },
        modalButtonText: {
          color: 'white',
          fontWeight: 'bold'
        }
});

export default CreateReservation;



