import { Router } from "express";
import eventController from "../controllers/event.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const eventRouter = Router();

// Public routes
eventRouter.get("/", eventController.getAllEvents);
eventRouter.get("/:id", eventController.getEventById);

// Protected routes (require authentication)
eventRouter.post("/", authenticateToken, eventController.createEvent);
eventRouter.put("/:id", authenticateToken, eventController.updateEvent);
eventRouter.delete("/:id", authenticateToken, eventController.deleteEvent);

// Organizer specific routes
eventRouter.get("/organizer/my-events", authenticateToken, eventController.getOrganizerEvents);

export default eventRouter;
