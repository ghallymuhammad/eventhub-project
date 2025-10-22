import { Router } from 'express';
import eventController from '../controllers/event.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/events
 * @desc    Get all events (public)
 * @access  Public
 */
router.get('/', eventController.getAllEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Public
 */
router.get('/:id', eventController.getEventById);

/**
 * @route   POST /api/events
 * @desc    Create new event
 * @access  Private (Organizers only)
 */
router.post('/', verifyToken, eventController.createEvent);

/**
 * @route   PUT /api/events/:id
 * @desc    Update event
 * @access  Private (Organizer who created it)
 */
router.put('/:id', verifyToken, eventController.updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event
 * @access  Private (Organizer who created it)
 */
router.delete('/:id', verifyToken, eventController.deleteEvent);

/**
 * @route   GET /api/events/organizer/my-events
 * @desc    Get organizer's events
 * @access  Private (Organizers only)
 */
router.get('/organizer/my-events', verifyToken, eventController.getOrganizerEvents);

/**
 * @route   POST /api/events/:id/image
 * @desc    Upload event image
 * @access  Private (Organizer who created it)
 */
router.post('/:id/image', verifyToken, eventController.uploadEventImage);

/**
 * @route   GET /api/events/:id/analytics
 * @desc    Get event analytics
 * @access  Private (Organizer who created it)
 */
router.get('/:id/analytics', verifyToken, eventController.getEventAnalytics);

/**
 * @route   GET /api/events/:id/attendees
 * @desc    Get event attendees
 * @access  Private (Organizer who created it)
 */
router.get('/:id/attendees', verifyToken, eventController.getEventAttendees);

export default router;
