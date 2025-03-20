import { InsertUser, User, Train, InsertTrain, Booking, InsertBooking } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Train operations
  createTrain(train: InsertTrain): Promise<Train>;
  updateTrain(id: number, train: Partial<Train>): Promise<Train>;
  deleteTrain(id: number): Promise<void>;
  getTrain(id: number): Promise<Train | undefined>;
  getAllTrains(): Promise<Train[]>;
  searchTrains(from: string, to: string, date: Date): Promise<Train[]>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getUserBookings(userId: number): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  updateBooking(id: number, booking: Partial<Booking>): Promise<Booking>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trains: Map<number, Train>;
  private bookings: Map<number, Booking>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.trains = new Map();
    this.bookings = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      isAdmin: true,
    } as any);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createTrain(train: InsertTrain): Promise<Train> {
    const id = this.currentId++;
    const newTrain = { ...train, id };
    this.trains.set(id, newTrain);
    return newTrain;
  }

  async updateTrain(id: number, trainUpdate: Partial<Train>): Promise<Train> {
    const train = await this.getTrain(id);
    if (!train) throw new Error("Train not found");
    
    const updatedTrain = { ...train, ...trainUpdate };
    this.trains.set(id, updatedTrain);
    return updatedTrain;
  }

  async deleteTrain(id: number): Promise<void> {
    this.trains.delete(id);
  }

  async getTrain(id: number): Promise<Train | undefined> {
    return this.trains.get(id);
  }

  async getAllTrains(): Promise<Train[]> {
    return Array.from(this.trains.values());
  }

  async searchTrains(from: string, to: string, date: Date): Promise<Train[]> {
    return Array.from(this.trains.values()).filter(train => 
      train.from.toLowerCase() === from.toLowerCase() &&
      train.to.toLowerCase() === to.toLowerCase() &&
      new Date(train.departureTime).toDateString() === date.toDateString()
    );
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentId++;
    const newBooking = { ...booking, id, createdAt: new Date() };
    this.bookings.set(id, newBooking);
    
    // Update available seats
    const train = await this.getTrain(booking.trainId);
    if (train) {
      await this.updateTrain(train.id, {
        availableSeats: train.availableSeats - booking.seatCount
      });
    }
    
    return newBooking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getUserBookings(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.userId === userId
    );
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async updateBooking(id: number, bookingUpdate: Partial<Booking>): Promise<Booking> {
    const booking = await this.getBooking(id);
    if (!booking) throw new Error("Booking not found");
    
    const updatedBooking = { ...booking, ...bookingUpdate };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
}

export const storage = new MemStorage();
