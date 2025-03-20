import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false)
});

export const trains = pgTable("trains", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  totalSeats: integer("total_seats").notNull(),
  availableSeats: integer("available_seats").notNull(),
  price: integer("price").notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  trainId: integer("train_id").notNull(),
  seatCount: integer("seat_count").notNull(),
  totalPrice: integer("total_price").notNull(),
  status: text("status").notNull(), // confirmed, cancelled
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTrainSchema = createInsertSchema(trains).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Train = typeof trains.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type InsertTrain = z.infer<typeof insertTrainSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
