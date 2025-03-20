import { users, trains, reservations, type User, type InsertUser, type Train, type InsertTrain, type Reservation, type InsertReservation } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Train operations
  getTrain(id: number): Promise<Train | undefined>;
  getTrains(): Promise<Train[]>;
  createTrain(train: InsertTrain): Promise<Train>;
  updateTrain(id: number, train: Partial<Train>): Promise<Train>;
  deleteTrain(id: number): Promise<void>;

  // Reservation operations
  getReservation(id: number): Promise<Reservation | undefined>;
  getReservationsByUser(userId: number): Promise<Reservation[]>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: number, status: string): Promise<Reservation>;

  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });

    // Create default admin user
    this.getUserByUsername("admin").then((user) => {
      if (!user) {
        this.createUser({
          username: "admin",
          password: "admin123",
          isAdmin: true,
        } as InsertUser);
      }
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Train operations
  async getTrain(id: number): Promise<Train | undefined> {
    const [train] = await db.select().from(trains).where(eq(trains.id, id));
    return train;
  }

  async getTrains(): Promise<Train[]> {
    return await db.select().from(trains);
  }

  async createTrain(train: InsertTrain): Promise<Train> {
    const [newTrain] = await db.insert(trains).values(train).returning();
    return newTrain;
  }

  async updateTrain(id: number, updates: Partial<Train>): Promise<Train> {
    const [train] = await db.update(trains)
      .set(updates)
      .where(eq(trains.id, id))
      .returning();
    return train;
  }

  async deleteTrain(id: number): Promise<void> {
    await db.delete(trains).where(eq(trains.id, id));
  }

  // Reservation operations
  async getReservation(id: number): Promise<Reservation | undefined> {
    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    return reservation;
  }

  async getReservationsByUser(userId: number): Promise<Reservation[]> {
    return await db.select().from(reservations).where(eq(reservations.userId, userId));
  }

  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const [newReservation] = await db.insert(reservations).values(reservation).returning();
    return newReservation;
  }

  async updateReservation(id: number, status: string): Promise<Reservation> {
    const [reservation] = await db.update(reservations)
      .set({ status })
      .where(eq(reservations.id, id))
      .returning();
    return reservation;
  }
}

export const storage = new DatabaseStorage();