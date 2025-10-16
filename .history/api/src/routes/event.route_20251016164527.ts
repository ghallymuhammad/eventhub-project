import { Router } from "express";
import eventController from "../controllers/event.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const eventRouter = Router();

// Public routes
eventRouter.get("/", eventController.getAllEvents);
eventRouter.get("/:id", eventController.getEventById);

// Protected routes (require authentication)
eventRouter.post("/", verifyToken, eventController.createEvent);
eventRouter.put("/:id", verifyToken, eventController.updateEvent);
eventRouter.delete("/:id", verifyToken, eventController.deleteEvent);

// Organizer specific routes
eventRouter.get("/organizer/my-events", verifyToken, eventController.getOrganizerEvents);

export default eventRouter;
