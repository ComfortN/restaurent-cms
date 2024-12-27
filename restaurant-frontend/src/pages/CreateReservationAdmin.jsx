import React, { useState, useEffect } from 'react';
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
import { createReservation, fetchAvailableTimeSlots, clearTimeSlots } from '../reduc/slices/reservationSlice';
import { FontAwesome5 } from '@expo/vector-icons';

const CreateReservation = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { isLoading } = useSelector(state => state.reservations);
  const { available: availableSlots, operatingHours } = useSelector(state => state.reservations.timeSlots);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [partySize, setPartySize] = useState('');
  const [date, setDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (date) {
      dispatch(fetchAvailableTimeSlots({ 
        restaurantId: user?.restaurantId?._id, 
        date: date 
      }));
    }
    return () => dispatch(clearTimeSlots());
  }, [date, dispatch, user?.restaurantId?._id]);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    if (Platform.OS !== 'ios') {
      setShow(false);
    }
    setDate(currentDate);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleCreateReservation = () => {
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
    if (!selectedTime) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    const formattedDate = date.toISOString().split('T')[0];

    const reservationData = {
      restaurantId: user?.restaurantId?._id,
      date: formattedDate,
      time: selectedTime,
      guests: parseInt(partySize),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhoneNumber: customerPhone.trim(),
    };

    dispatch(createReservation(reservationData))
      .unwrap()
      .then(() => {
        Alert.alert('Success', 'Reservation created successfully!',
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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

        <TouchableOpacity 
          style={styles.dateTimeInput} 
          onPress={() => {
            setMode('date');
            setShow(true);
          }}
        >
          <FontAwesome5 name="calendar" size={20} color="#B44E13" />
          <Text style={styles.dateTimeText}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode={mode}
            is24Hour={true}
            display="default"
            onChange={onChange}
            minimumDate={new Date()}
          />
        )}

        <Text style={styles.sectionTitle}>Available Time Slots</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.timeSlotContainer}>
            {availableSlots.map((slot) => (
              <TouchableOpacity
                key={slot.time}
                style={[
                  styles.timeSlot,
                  selectedTime === slot.time && styles.selectedTimeSlot,
                  slot.available === 0 && styles.disabledTimeSlot
                ]}
                onPress={() => setSelectedTime(slot.time)}
                disabled={slot.available === 0}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedTime === slot.time && styles.selectedTimeSlotText,
                  slot.available === 0 && styles.disabledTimeSlotText
                ]}>
                  {slot.time}
                </Text>
                <Text style={styles.availabilityText}>
                  {slot.available} available
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

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
        timeSlotContainer: {
          flexDirection: 'row',
          paddingVertical: 10,
        },
        timeSlot: {
          padding: 10,
          marginRight: 10,
          backgroundColor: 'white',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#B44E13',
          minWidth: 100,
          alignItems: 'center',
        },
        selectedTimeSlot: {
          backgroundColor: '#B44E13',
        },
        disabledTimeSlot: {
          backgroundColor: '#f0f0f0',
          borderColor: '#ccc',
        },
        timeSlotText: {
          color: '#B44E13',
          fontWeight: '500',
        },
        selectedTimeSlotText: {
          color: 'white',
        },
        disabledTimeSlotText: {
          color: '#999',
        },
        availabilityText: {
          fontSize: 12,
          color: '#666',
          marginTop: 4,
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



