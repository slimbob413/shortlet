import express, { Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db';
import { authenticateToken } from '../middleware/auth';
import { sendBookingStatusEmail } from '../services/notificationService';

const router = express.Router();

// Validation schemas
const createBookingSchema = z.object({
  property_id: z.number().positive(),
  check_in_date: z.string().transform((str) => new Date(str)),
  check_out_date: z.string().transform((str) => new Date(str)),
  total_price: z.number().positive(),
});

const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
});

// Create booking
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validatedData = createBookingSchema.parse({
      ...req.body,
      property_id: Number(req.body.property_id),
      total_price: Number(req.body.total_price),
    });

    // Verify property exists and get owner_id
    const propertyResult = await pool.query(
      'SELECT ownerId FROM properties WHERE id = $1',
      [validatedData.property_id]
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if dates are valid
    const today = new Date();
    if (validatedData.check_in_date < today) {
      return res.status(400).json({ error: 'Check-in date cannot be in the past' });
    }
    if (validatedData.check_out_date <= validatedData.check_in_date) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    // Check if property is available for these dates
    const conflictingBooking = await pool.query(
      `SELECT id FROM bookings 
       WHERE propertyId = $1 
       AND status = 'confirmed'
       AND (
         (checkInDate <= $2 AND checkOutDate >= $2)
         OR (checkInDate <= $3 AND checkOutDate >= $3)
         OR (checkInDate >= $2 AND checkOutDate <= $3)
       )`,
      [validatedData.property_id, validatedData.check_in_date, validatedData.check_out_date]
    );

    if (conflictingBooking.rows.length > 0) {
      return res.status(400).json({ error: 'Property is not available for these dates' });
    }

    // Create booking
    const result = await pool.query(
      `INSERT INTO bookings 
       (guestId, propertyId, status, checkInDate, checkOutDate, totalPrice)
       VALUES ($1, $2, 'pending', $3, $4, $5)
       RETURNING *`,
      [
        req.user!.userId,
        validatedData.property_id,
        validatedData.check_in_date,
        validatedData.check_out_date,
        validatedData.total_price,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List bookings
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    let query: string;
    let params: any[];

    if (req.user!.role === 'user') {
      // Get bookings where user is the renter
      query = `
        SELECT b.*, p.title as property_title, p.price as property_price,
               u.name as owner_name
        FROM bookings b
        JOIN properties p ON b.propertyId = p.id
        JOIN users u ON p.ownerId = u.id
        WHERE b.guestId = $1
        ORDER BY b.createdAt DESC
      `;
      params = [req.user!.userId];
    } else {
      // Get bookings for properties owned by the user
      query = `
        SELECT b.*, p.title as property_title, p.price as property_price,
               u.name as renter_name
        FROM bookings b
        JOIN properties p ON b.propertyId = p.id
        JOIN users u ON b.guestId = u.id
        WHERE p.ownerId = $1
        ORDER BY b.createdAt DESC
      `;
      params = [req.user!.userId];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('List bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Confirm a booking (agent only)
 * @route PUT /api/bookings/:id/confirm
 * @param {string} id - Booking ID
 * @returns {Object} Updated booking
 */
router.put('/:id/confirm', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Verify user is an agent
    if (req.user!.role !== 'agent') {
      return res.status(403).json({ error: 'Only agents can confirm bookings' });
    }

    // Check if booking exists and is pending
    const bookingResult = await pool.query(
      `SELECT b.*, p.ownerId, p.title, u.email as user_email, a.email as agent_email
       FROM bookings b
       JOIN properties p ON b.propertyId = p.id
       JOIN users u ON b.guestId = u.id
       JOIN users a ON p.ownerId = a.id
       WHERE b.id = $1`,
      [req.params.id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Verify booking is pending
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not pending' });
    }

    // Verify user is the property owner
    if (booking.ownerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update booking status
    const result = await pool.query(
      `UPDATE bookings 
       SET status = 'confirmed', updatedAt = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    // Send confirmation email
    await sendBookingStatusEmail(result.rows[0], 'confirmed');

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Cancel a booking (user or agent)
 * @route PUT /api/bookings/:id/cancel
 * @param {string} id - Booking ID
 * @returns {Object} Updated booking
 */
router.put('/:id/cancel', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Check if booking exists
    const bookingResult = await pool.query(
      `SELECT b.*, p.ownerId, p.title, u.email as user_email, a.email as agent_email
       FROM bookings b
       JOIN properties p ON b.propertyId = p.id
       JOIN users u ON b.guestId = u.id
       JOIN users a ON p.ownerId = a.id
       WHERE b.id = $1`,
      [req.params.id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Verify user is either the renter or the property owner
    if (booking.guestId !== req.user!.userId && booking.ownerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update booking status
    const result = await pool.query(
      `UPDATE bookings 
       SET status = 'cancelled', updatedAt = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    // Send cancellation email
    await sendBookingStatusEmail(result.rows[0], 'cancelled');

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 