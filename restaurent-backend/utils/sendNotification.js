const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Reservation = require('../models/Reservation')

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID
});

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
 service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Disables certificate validation
  }
});

// Email templates
const emailTemplates = {
  newReservation: (reservation) => ({
    subject: 'New Reservation Confirmation',
    html: `
      <h2>Thank you for your reservation!</h2>
      <p>Dear ${reservation.customerName},</p>
      <p>Your reservation details:</p>
      <ul>
        <li>Date: ${reservation.date}</li>
        <li>Time: ${reservation.time}</li>
        <li>Number of Guests: ${reservation.guests}</li>
        <li>Reference: ${reservation.paymentReference}</li>
      </ul>
      <p>Status: ${reservation.status}</p>
    `
  }),
  statusUpdate: (reservation) => ({
    subject: `Reservation Status Updated - ${reservation.status.toUpperCase()}`,
    html: `
      <h2>Reservation Status Update</h2>
      <p>Dear ${reservation.customerName},</p>
      <p>Your reservation status has been updated to: <strong>${reservation.status}</strong></p>
      <p>Reservation details:</p>
      <ul>
        <li>Date: ${reservation.date}</li>
        <li>Time: ${reservation.time}</li>
        <li>Number of Guests: ${reservation.guests}</li>
      </ul>
    `
  })
};

// Send push notification
const sendPushNotification = async (userId, title, body) => {
  try {
    // Get user's FCM token from your database
    const user = await User.findById(userId);
    if (!user?.fcmToken) return;

    const message = {
      notification: {
        title,
        body,
      },
      token: user.fcmToken,
    };

    await admin.messaging().send(message);
    console.log('Push notification sent successfully');
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

// Send email
const sendEmail = async (to, template, data, fromEmail) => {
  try {
    const emailContent = emailTemplates[template](data);

    await transporter.sendMail({
      from: fromEmail, // Use the admin's email here
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log('Email sent successfully from:', fromEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};



module.exports = {
  sendPushNotification,
  sendEmail
};