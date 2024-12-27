const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurent');
const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);


// exports.createReservationPayment = async (req, res) => {
//     try {
//         const { 
//             restaurantId, 
//             date, 
//             time, 
//             guests, 
//             specialRequests,
//             customerName,
//             customerEmail,
//             customerPhoneNumber
//         } = req.body;

//         // Validate required fields
//         const missingFields = [];
//         if (!customerName) missingFields.push('customerName');
//         if (!customerEmail) missingFields.push('customerEmail');
//         if (!customerPhoneNumber) missingFields.push('customerPhoneNumber');

//         if (missingFields.length > 0) {
//             return res.status(400).json({ 
//                 message: 'Missing required customer information',
//                 missingFields 
//             });
//         }

//         // Fetch restaurant to get reservation details
//         const restaurant = await Restaurant.findById(restaurantId);
//         if (!restaurant) {
//             return res.status(404).json({ message: 'Restaurant not found' });
//         }

//         // Define reservation fee (e.g., $10 per reservation)
//         const reservationFee = 1000; // $10.00 in cents
//         const userId = req.user._id;

//         // Initialize Stripe
//         const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        

//         // Create payment intent
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: reservationFee,
//             currency: 'usd',
//             metadata: {
//                 restaurantId,
//                 date,
//                 time,
//                 guests,
//                 // userId,
//                 customerName,
//                 customerEmail,
//                 customerPhoneNumber
//             },
//             payment_method_types: ['card']
//         });

//         // Create reservation in pending status
//         const reservation = new Reservation({
//             restaurantId,
//             // userId,
//             customerName,
//             customerEmail,
//             customerPhoneNumber,
//             date,
//             time,
//             guests,
//             specialRequests,
//             status: 'pending',
//             paymentStatus: 'pending',
//             paymentIntentId: paymentIntent.id,
//             totalAmount: reservationFee
//         });

//         // Save the reservation
//         await reservation.save();

//         // Return client secret for frontend payment confirmation
//         res.status(200).json({ 
//             clientSecret: paymentIntent.client_secret,
//             reservationId: reservation._id
//         });

//     } catch (error) {
//         console.error('Reservation payment error:', error);
//         res.status(500).json({ 
//             message: 'Payment processing failed', 
//             error: error.message 
//         });
//     }
// };


// exports.createReservationPayment = async (req, res) => {
//     try {
//         const { 
//             restaurantId, 
//             date, 
//             time, 
//             guests, 
//             specialRequests,
//             customerName,
//             customerEmail,
//             customerPhoneNumber
//         } = req.body;

//         // Validate required fields
//         const missingFields = [];
//         if (!customerName) missingFields.push('customerName');
//         if (!customerEmail) missingFields.push('customerEmail');
//         if (!customerPhoneNumber) missingFields.push('customerPhoneNumber');

//         if (missingFields.length > 0) {
//             return res.status(400).json({ 
//                 message: 'Missing required customer information',
//                 missingFields 
//             });
//         }

//         // Fetch restaurant to get reservation details
//         const restaurant = await Restaurant.findById(restaurantId);
//         if (!restaurant) {
//             return res.status(404).json({ message: 'Restaurant not found' });
//         }

//         // Get existing reservations for the time slot
//                 const existingReservations = await Reservation.find({
//                     restaurantId,
//                     date: {
//                         $gte: new Date(new Date(date).setHours(0, 0, 0)),
//                         $lt: new Date(new Date(date).setHours(23, 59, 59))
//                     },
//                     time,
//                     status: { $ne: 'cancelled' }
//                 });
        
//                 // Calculate current bookings
//                 const currentBookings = existingReservations.reduce((sum, r) => sum + r.guests, 0);
//                 const timeSlot = restaurant.timeSlots.find(slot => slot.time === time);
                
//                 if (!timeSlot) {
//                     return res.status(400).json({ message: 'Invalid time slot' });
//                 }
        
//                 // Check if there's enough capacity
//                 if (currentBookings + guests > timeSlot.capacity) {
//                     return res.status(400).json({ message: 'Not enough capacity for this time slot' });
//                 }

//         // Define reservation fee
//         const reservationFee = 100;
//         const userId = req.user._id;

//         // Initialize Paystack payment
//         const payment = await paystack.transaction.initialize({
//             amount: reservationFee,
//             email: customerEmail,
//             metadata: {
//                 restaurantId,
//                 date,
//                 time,
//                 guests,
//                 customerName,
//                 customerPhoneNumber,
//                 userId
//             }
//         });

//         // Create reservation in pending status
//         const reservation = new Reservation({
//             restaurantId,
//             userId,
//             customerName,
//             customerEmail,
//             customerPhoneNumber,
//             date,
//             time,
//             guests,
//             specialRequests,
//             status: 'pending',
//             paymentStatus: 'pending',
//             paymentReference: payment.data.reference,
//             totalAmount: reservationFee
//         });

//         // Save the reservation
//         await reservation.save();

//         // Return authorization URL for frontend payment confirmation
//         res.status(200).json({ 
//             authorizationUrl: payment.data.authorization_url,
//             reservationId: reservation._id,
//             paymentReference: payment.data.reference // Pass the reference to the frontend
//         });

//     } catch (error) {
//         console.error('Reservation payment error:', error);
//         res.status(500).json({ 
//             message: 'Payment initialization failed', 
//             error: error.message 
//         });
//     }
// };


exports.createReservationPayment = async (req, res) => {
    try {
        const { 
            restaurantId, 
            date, 
            time, 
            guests, 
            specialRequests,
            customerName,
            customerEmail,
            customerPhoneNumber
        } = req.body;

        // Validate required fields
        const missingFields = [];
        if (!restaurantId) missingFields.push('restaurantId');
        if (!date) missingFields.push('date');
        if (!time) missingFields.push('time');
        if (!guests) missingFields.push('guests');
        if (!customerName) missingFields.push('customerName');
        if (!customerEmail) missingFields.push('customerEmail');
        if (!customerPhoneNumber) missingFields.push('customerPhoneNumber');

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                missingFields 
            });
        }

        // Validate date is not in the past
        const reservationDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (reservationDate < today) {
            return res.status(400).json({ 
                message: 'Cannot make reservations for past dates' 
            });
        }

        // Fetch restaurant and validate
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Validate time slot exists and is within operating hours
        const timeSlot = restaurant.timeSlots.find(slot => slot.time === time);
        if (!timeSlot) {
            return res.status(400).json({ message: 'Invalid time slot' });
        }

        // Get day of week for operating hours check
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = days[reservationDate.getDay()];
        const operatingHours = restaurant.operatingHours[dayOfWeek];

        if (!operatingHours) {
            return res.status(400).json({ 
                message: 'Invalid operating hours for this day' 
            });
        }

        // Convert time slot to 24-hour format for comparison
        const timeSlotHour = convertTo24Hour(time);
        const openingHour = parseInt(operatingHours.open.split(':')[0]);
        const closingHour = parseInt(operatingHours.close.split(':')[0]);

        if (timeSlotHour < openingHour || timeSlotHour >= closingHour) {
            return res.status(400).json({ 
                message: 'Selected time is outside operating hours' 
            });
        }

        // Get existing reservations for the time slot
        const existingReservations = await Reservation.find({
            restaurantId,
            date: {
                $gte: new Date(new Date(date).setHours(0, 0, 0)),
                $lt: new Date(new Date(date).setHours(23, 59, 59))
            },
            time,
            status: { $nin: ['cancelled', 'rejected', 'expired'] }
        });

        // Calculate current bookings including pending reservations
        const currentBookings = existingReservations.reduce((sum, r) => sum + r.guests, 0);
        
        // Check if there's enough capacity
        if (currentBookings + guests > timeSlot.capacity) {
            return res.status(400).json({ 
                message: 'Not enough capacity for this time slot',
                availableSeats: timeSlot.capacity - currentBookings,
                requestedSeats: guests
            });
        }

        // Validate guests number
        if (guests < 1 || guests > timeSlot.capacity) {
            return res.status(400).json({ 
                message: `Number of guests must be between 1 and ${timeSlot.capacity}` 
            });
        }

        // Define reservation fee
        const reservationFee = calculateReservationFee(guests);
        const userId = req.user.id;

        // Initialize Paystack payment
        const payment = await paystack.transaction.initialize({
            amount: reservationFee * 100, // Convert to cents
            email: customerEmail,
            metadata: {
                restaurantId,
                date,
                time,
                guests,
                customerName,
                customerPhoneNumber,
                userId
            }
        });

        // Create reservation in pending status
        const reservation = new Reservation({
            restaurantId,
            userId,
            customerName,
            customerEmail,
            customerPhoneNumber,
            date,
            time,
            guests,
            specialRequests,
            status: 'pending',
            paymentStatus: 'pending',
            paymentReference: payment.data.reference,
            totalAmount: reservationFee
        });

        // Save the reservation
        await reservation.save();

        // Return payment details
        res.status(200).json({ 
            authorizationUrl: payment.data.authorization_url,
            reservationId: reservation._id,
            paymentReference: payment.data.reference
        });

    } catch (error) {
        console.error('Reservation payment error:', error);
        res.status(500).json({ 
            message: 'Payment initialization failed', 
            error: error.message 
        });
    }
};

// Helper functions remain the same
const convertTo24Hour = (time) => {
    const [hour, modifier] = time.split(' ');
    let [numbers] = hour.split(':');
    numbers = parseInt(numbers);

    if (modifier === 'PM' && numbers < 12) numbers += 12;
    if (modifier === 'AM' && numbers === 12) numbers = 0;

    return numbers;
};

const calculateReservationFee = (guests) => {
    const basePrice = 100; // Base reservation fee
    return basePrice * guests; // Scale with number of guests
};

// exports.confirmReservationPayment = async (req, res) => {
//     try {
//         const { reservationId, paymentIntentId } = req.body;
//         const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

//         // Retrieve the payment intent
//         const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//         // Find the reservation
//         const reservation = await Reservation.findById(reservationId);
//         if (!reservation) {
//             return res.status(404).json({ message: 'Reservation not found' });
//         }

//         // Check payment status
//         if (paymentIntent.status === 'succeeded') {
//             reservation.paymentStatus = 'paid';
//             reservation.status = 'confirmed';
//             await reservation.save();

//             return res.status(200).json({ 
//                 message: 'Payment confirmed', 
//                 reservation 
//             });
//         } else {
//             reservation.paymentStatus = 'failed';
//             await reservation.save();

//             return res.status(400).json({ 
//                 message: 'Payment failed', 
//                 status: paymentIntent.status 
//             });
//         }
//     } catch (error) {
//         console.error('Payment confirmation error:', error);
//         res.status(500).json({ 
//             message: 'Payment confirmation failed', 
//             error: error.message 
//         });
//     }
// };


exports.confirmReservationPayment = async (req, res) => {
    try {
        const { reservationId, paymentReference } = req.body;

        // Verify the payment with Paystack
        const payment = await paystack.transaction.verify(paymentReference);

        // Find the reservation
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Check payment status
        if (payment.data.status === 'success') {
            reservation.paymentStatus = 'paid';
            reservation.status = 'confirmed';
            await reservation.save();

            return res.status(200).json({ 
                message: 'Payment confirmed', 
                reservation 
            });
        } else {
            reservation.paymentStatus = 'failed';
            await reservation.save();

            return res.status(400).json({ 
                message: 'Payment failed', 
                status: payment.data.status 
            });
        }
    } catch (error) {
        console.error('Payment confirmation error:', error);
        res.status(500).json({ 
            message: 'Payment confirmation failed', 
            error: error.message 
        });
    }
};
