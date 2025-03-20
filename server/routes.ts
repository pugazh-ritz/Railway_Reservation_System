import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Train routes
  app.get("/api/trains", async (req, res) => {
    const trains = await storage.getTrains();
    res.json(trains);
  });

  app.post("/api/trains", async (req, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const train = await storage.createTrain(req.body);
    res.status(201).json(train);
  });

  app.put("/api/trains/:id", async (req, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const train = await storage.updateTrain(parseInt(req.params.id), req.body);
    res.json(train);
  });

  app.delete("/api/trains/:id", async (req, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    await storage.deleteTrain(parseInt(req.params.id));
    res.sendStatus(204);
  });

  // Reservation routes
  app.get("/api/reservations", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const reservations = await storage.getReservationsByUser(req.user.id);
    res.json(reservations);
  });

  app.post("/api/reservations", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const reservation = await storage.createReservation({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(reservation);
  });

  app.put("/api/reservations/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const reservation = await storage.updateReservation(
      parseInt(req.params.id),
      req.body.status
    );
    res.json(reservation);
  });

  const httpServer = createServer(app);
  return httpServer;
}
