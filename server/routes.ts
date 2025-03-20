import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertTrainSchema, insertBookingSchema } from "@shared/schema";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Train routes
  app.get("/api/trains", async (req, res) => {
    const { from, to, date } = req.query;
    if (from && to && date) {
      const trains = await storage.searchTrains(
        from as string,
        to as string,
        new Date(date as string)
      );
      res.json(trains);
    } else {
      const trains = await storage.getAllTrains();
      res.json(trains);
    }
  });

  app.post("/api/trains", requireAdmin, async (req, res) => {
    const parsed = insertTrainSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const train = await storage.createTrain(parsed.data);
    res.status(201).json(train);
  });

  app.put("/api/trains/:id", requireAdmin, async (req, res) => {
    const train = await storage.updateTrain(parseInt(req.params.id), req.body);
    res.json(train);
  });

  app.delete("/api/trains/:id", requireAdmin, async (req, res) => {
    await storage.deleteTrain(parseInt(req.params.id));
    res.sendStatus(204);
  });

  // Booking routes
  app.post("/api/bookings", requireAuth, async (req, res) => {
    const parsed = insertBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const booking = await storage.createBooking({
      ...parsed.data,
      userId: req.user.id
    });
    res.status(201).json(booking);
  });

  app.get("/api/bookings", requireAuth, async (req, res) => {
    if (req.user.isAdmin) {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } else {
      const bookings = await storage.getUserBookings(req.user.id);
      res.json(bookings);
    }
  });

  app.put("/api/bookings/:id", requireAuth, async (req, res) => {
    const booking = await storage.getBooking(parseInt(req.params.id));
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (!req.user.isAdmin && booking.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const updatedBooking = await storage.updateBooking(
      parseInt(req.params.id),
      req.body
    );
    res.json(updatedBooking);
  });

  const httpServer = createServer(app);
  return httpServer;
}
