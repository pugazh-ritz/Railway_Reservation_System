import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const trains = pgTable("trains", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  seats: integer("seats").notNull(),
  price: integer("price").notNull(),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  trainId: integer("train_id").notNull(),
  seatCount: integer("seat_count").notNull(),
  status: text("status").notNull(), // confirmed, pending, cancelled
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Enhanced validation for train schema
export const insertTrainSchema = createInsertSchema(trains, {
  departureTime: z.string().transform((str) => new Date(str)),
  seats: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertReservationSchema = createInsertSchema(reservations);

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Train = typeof trains.$inferSelect;
export type InsertTrain = z.infer<typeof insertTrainSchema>;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;