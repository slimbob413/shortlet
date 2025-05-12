/**
 * Notification Service
 * 
 * Handles sending notifications for various events:
 * - Booking status changes (confirmed, cancelled)
 * - Payment confirmations
 * - Check-in reminders
 * 
 * Uses SendGrid SMTP for email delivery
 */

import { Booking } from '../entities/Booking';
import nodemailer from 'nodemailer';

type BookingStatus = 'confirmed' | 'cancelled';

interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a booking status email to both the agent and user
 * @param booking - The booking object with all related data
 * @param status - The new status of the booking
 */
export const sendBookingStatusEmail = async (
  booking: Booking,
  status: BookingStatus
): Promise<void> => {
  try {
    const emailData: EmailData = {
      to: `${booking.guest.email}, ${booking.property.owner.email}`,
      subject: `Booking ${status}: ${booking.property.title}`,
      text: `Booking #${booking.id} has been ${status}.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Booking ${status}</h1>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
            <p style="margin: 0 0 10px;">Booking #${booking.id} for ${booking.property.title} has been ${status}.</p>
            <p style="margin: 0 0 10px;"><strong>Check-in:</strong> ${new Date(booking.checkInDate).toLocaleDateString()}</p>
            <p style="margin: 0 0 10px;"><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toLocaleDateString()}</p>
            <p style="margin: 0 0 10px;"><strong>Total:</strong> $${booking.totalPrice.toLocaleString()}</p>
          </div>
          <p style="text-align: center; margin-top: 20px; color: #666;">
            This is an automated message from Shortlet. Please do not reply to this email.
          </p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    });

    console.log('Email sent successfully:', emailData.subject);
  } catch (error) {
    console.error('Error sending booking status email:', error);
    throw new Error('Failed to send notification email');
  }
}; 