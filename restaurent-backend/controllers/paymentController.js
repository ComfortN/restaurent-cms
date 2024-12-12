const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurent');

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
        if (!customerName) missingFields.push('customerName');
        if (!customerEmail) missingFields.push('customerEmail');
        if (!customerPhoneNumber) missingFields.push('customerPhoneNumber');

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: 'Missing required customer information',
                missingFields 
            });
        }

        // Fetch restaurant to get reservation details
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Define reservation fee (e.g., $10 per reservation)
        const reservationFee = 1000; // $10.00 in cents
        const userId = req.user._id;

        // Initialize Stripe
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: reservationFee,
            currency: 'usd',
            metadata: {
                restaurantId,
                date,
                time,
                guests,
                // userId,
                customerName,
                customerEmail,
                customerPhoneNumber
            },
            payment_method_types: ['card']
        });

        // Create reservation in pending status
        const reservation = new Reservation({
            restaurantId,
            // userId,
            customerName,
            customerEmail,
            customerPhoneNumber,
            date,
            time,
            guests,
            specialRequests,
            status: 'pending',
            paymentStatus: 'pending',
            paymentIntentId: paymentIntent.id,
            totalAmount: reservationFee
        });

        // Save the reservation
        await reservation.save();

        // Return client secret for frontend payment confirmation
        res.status(200).json({ 
            clientSecret: paymentIntent.client_secret,
            reservationId: reservation._id
        });

    } catch (error) {
        console.error('Reservation payment error:', error);
        res.status(500).json({ 
            message: 'Payment processing failed', 
            error: error.message 
        });
    }
};

exports.confirmReservationPayment = async (req, res) => {
    try {
        const { reservationId, paymentIntentId } = req.body;
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        // Retrieve the payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Find the reservation
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Check payment status
        if (paymentIntent.status === 'succeeded') {
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
                status: paymentIntent.status 
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