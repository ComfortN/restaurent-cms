const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurent');
const User = require('../models/User')
const { sendEmail, sendPushNotification} = require('../utils/sendNotification');


exports.createReservation = async (req, res) => {
    try {
        const {
            restaurantId,
            date,
            time,
            guests,
            customerName,
            customerEmail,
            customerPhoneNumber,
        } = req.body;

        const userId = req.user.id;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }


        // Get existing reservations for the time slot
        const existingReservations = await Reservation.find({
            restaurantId,
            date: {
                $gte: new Date(new Date(date).setHours(0, 0, 0)),
                $lt: new Date(new Date(date).setHours(23, 59, 59))
            },
            time,
            status: { $ne: 'cancelled' }
        });

        // Calculate current bookings
        const currentBookings = existingReservations.reduce((sum, r) => sum + r.guests, 0);
        const timeSlot = restaurant.timeSlots.find(slot => slot.time === time);
        
        if (!timeSlot) {
            return res.status(400).json({ message: 'Invalid time slot' });
        }

        // Check if there's enough capacity
        if (currentBookings + guests > timeSlot.capacity) {
            return res.status(400).json({ message: 'Not enough capacity for this time slot' });
        }


        const reservation = new Reservation({
            restaurantId,
            userId,
            date,
            time,
            guests,
            customerName,
            customerEmail,
            customerPhoneNumber,
        });

        await reservation.save();
        res.status(201).json({ message: 'Reservation created successfully', reservation });
    } catch (error) {
        console.error('Error creating reservation:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.getAvailabilityByDate = async (req, res) => {
    try {
        const { restaurantId, date } = req.params;
        
        // Get restaurant operating hours and capacity
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Get the day of week from the date properly
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = dayNames[new Date(date).getDay()];

        // Default operating hours if not set
        const defaultHours = { open: "10:00", close: "22:00" };
        
        // Get operating hours with fallback to default
        const operatingHours = restaurant.operatingHours?.[dayOfWeek] || defaultHours;

        // Get all reservations for the specified date
        const reservations = await Reservation.find({
            restaurantId,
            date: {
                $gte: new Date(new Date(date).setHours(0, 0, 0)),
                $lt: new Date(new Date(date).setHours(23, 59, 59))
            },
            status: { $ne: 'cancelled' }
        });

        // Use restaurant's timeSlots if available, otherwise generate them
        let timeSlots = restaurant.timeSlots && restaurant.timeSlots.length > 0 
            ? restaurant.timeSlots 
            : generateTimeSlots(operatingHours.open || "10:00", operatingHours.close || "22:00");

        // Calculate availability for each time slot
        const availability = timeSlots.map(slot => {
            const bookedGuests = reservations
                .filter(r => r.time === slot.time)
                .reduce((sum, r) => sum + r.guests, 0);

            return {
                time: slot.time,
                capacity: slot.capacity || 20,
                booked: bookedGuests,
                available: (slot.capacity || 20) - bookedGuests
            };
        });

        res.status(200).json({ 
            date,
            dayOfWeek,
            availability,
            operatingHours
        });
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            stack: error.stack
        });
    }
};

// Helper function to generate time slots with better error handling
const generateTimeSlots = (openTime = "10:00", closeTime = "22:00") => {
    try {
        const slots = [];
        const [openHour] = (openTime || "10:00").split(':').map(Number);
        const [closeHour] = (closeTime || "22:00").split(':').map(Number);

        const startHour = openHour || 10;  // fallback to 10 if parsing fails
        const endHour = closeHour || 22;   // fallback to 22 if parsing fails

        for (let hour = startHour; hour < endHour; hour++) {
            const formattedHour = hour % 12 || 12;
            const ampm = hour < 12 ? 'AM' : 'PM';
            slots.push({
                time: `${formattedHour}:00 ${ampm}`,
                capacity: 20
            });
        }

        return slots;
    } catch (error) {
        console.error('Error generating time slots:', error);
        // Return default time slots if there's an error
        return [
            { time: "10:00 AM", capacity: 20 },
            { time: "11:00 AM", capacity: 20 },
            { time: "12:00 PM", capacity: 20 },
            { time: "1:00 PM", capacity: 20 },
            { time: "2:00 PM", capacity: 20 },
            { time: "3:00 PM", capacity: 20 },
            { time: "4:00 PM", capacity: 20 },
            { time: "5:00 PM", capacity: 20 }
        ];
    }
};


exports.getUserReservations = async (req, res) => {
    try {
        const userId = req.user.id;

        const reservations = await Reservation.find({ userId })
            .sort({ date: -1 })
            .populate('restaurantId', 'name');

        res.status(200).json({ reservations });
    } catch (error) {
        console.error('Error fetching user reservations:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.updateUserReservation = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const { date, time, guests } = req.body;
        const userId = req.user.id;

        const reservation = await Reservation.findOne({ _id: reservationId, userId });

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found or unauthorized' });
        }

        reservation.date = date || reservation.date;
        reservation.time = time || reservation.time;
        reservation.guests = guests || reservation.guests;

        await reservation.save();
        res.status(200).json({ message: 'Reservation updated successfully', reservation });
    } catch (error) {
        console.error('Error updating reservation:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.cancelUserReservation = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const userId = req.user.id;

        const reservation = await Reservation.findOne({ _id: reservationId, userId });

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found or unauthorized' });
        }

        reservation.status = 'cancelled';
        reservation.isCancelledByUser = true;

        await reservation.save();
        res.status(200).json({ message: 'Reservation cancelled successfully', reservation });
    } catch (error) {
        console.error('Error cancelling reservation:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.getRestaurantReservations = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        // Check if the admin has access to the restaurant
        if (req.user.role !== 'restaurant_admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const reservations = await Reservation.find({ restaurantId }).sort({ date: -1 });
        res.status(200).json({ reservations });
    } catch (error) {
        console.error('Error fetching restaurant reservations:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.updateReservationStatus = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const { status } = req.body;

        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const reservation = await Reservation.findById(reservationId)
        .populate('userId', 'fcmToken');

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        reservation.status = status;

        await reservation.save();


        // Find the restaurant admin's email using the restaurantId from the reservation
    const restaurantAdmin = await User.findOne({
        restaurantId: reservation.restaurantId, // Assuming `restaurantId` exists on the reservation
        role: 'restaurant_admin',
      });
  
      if (!restaurantAdmin || !restaurantAdmin.email) {
        return res.status(404).json({ message: 'Restaurant admin not found for the associated restaurant' });
      }
  
      const adminEmail = restaurantAdmin.email;
  
      // Send email notification to the customer
      await sendEmail(reservation.customerEmail, 'statusUpdate', reservation, reservation.restaurantId);
  

        let notificationTitle = 'Reservation Update';
        let notificationBody = `Your reservation status has been updated to ${status}`;

        if (status === 'confirmed') {
            notificationTitle = 'Reservation Confirmed';
            notificationBody = `Your reservation for ${reservation.date} at ${reservation.time} has been confirmed!`;
        } else if (status === 'cancelled') {
            notificationTitle = 'Reservation Cancelled';
            notificationBody = `Your reservation for ${reservation.date} at ${reservation.time} has been cancelled.`;
        }

        await sendPushNotification(
            reservation.userId._id,
            notificationTitle,
            notificationBody
        );
        
        res.status(200).json({ message: 'Reservation status updated successfully', reservation });
    } catch (error) {
        console.error('Error updating reservation status:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
