import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAvailableTimeSlots } from '../reduc/slices/reservationSlice';


const ReservationCalendar = ({ restaurantId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { available: timeSlots, operatingHours, isLoading } = useSelector(state => state.reservations.timeSlots);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const id = restaurantId || user?.restaurantId?._id;
    if (id) {
      console.log('Fetching with ID:', id);
      dispatch(fetchAvailableTimeSlots({ 
        restaurantId: id,
        date: selectedDate 
      }));
    } else {
      console.log('No restaurant ID available');
    }
  }, [selectedDate, restaurantId, user?.restaurantId?._id]);

  useEffect(() => {
    console.log('Current timeSlots:', timeSlots);
    console.log('Operating hours:', operatingHours);
  }, [timeSlots, operatingHours]);

  const getSlotColor = (available, capacity) => {
    const ratio = (capacity - available) / capacity;
    if (available === 0) return '#FEE2E2';
    if (ratio >= 0.7) return '#FEF3C7';
    return '#DCFCE7';
  };


  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading time slots...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome5 name="calendar-alt" size={20} color="#B44E13" />
        <Text style={styles.headerText}>Reservation Schedule</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroller}>
        {[...Array(7)].map((_, index) => {
          const date = new Date();
          date.setDate(date.getDate() + index);
          const isSelected = selectedDate.toDateString() === date.toDateString();
          
          return (
            <TouchableOpacity 
              key={index}
              style={[styles.dateCard, isSelected && styles.selectedDate]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedText]}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Text style={[styles.dateText, isSelected && styles.selectedText]}>
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.timeSlotsContainer}>
        {Array.isArray(timeSlots) && timeSlots.length > 0 ? (
          <View style={styles.timeGrid}>
            {timeSlots.map((slot, index) => (
              <View 
                key={index}
                style={[
                  styles.timeSlot,
                  { backgroundColor: getSlotColor(slot.available, slot.capacity) }
                ]}
              >
                <Text style={styles.timeText}>{slot.time}</Text>
                <Text style={styles.bookingText}>
                  {`${slot.booked}/${slot.capacity} booked`}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noSlotsText}>No time slots available for this date</Text>
        )}
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#DCFCE7' }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FEF3C7' }]} />
          <Text style={styles.legendText}>Filling Fast</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FEE2E2' }]} />
          <Text style={styles.legendText}>Full</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFE1BB',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B44E13'
  },
  dateScroller: {
    marginBottom: 15
  },
  dateCard: {
    backgroundColor: '#F7BF90',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    width: 60
  },
  selectedDate: {
    backgroundColor: '#B44E13'
  },
  dayText: {
    fontSize: 12,
    color: '#666'
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B44E13'
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between'
  },
  timeSlot: {
    width: '48%',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666'
  },
  bookingText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F7BF90'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  legendText: {
    fontSize: 12,
    color: '#666'
  },
  selectedText: {
    color: 'white'
  }
});

export default ReservationCalendar;