import { mysqlTable, varchar, boolean, text, int, timestamp } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  username: varchar("username", { length: 255 }).unique(),
  passwordHash: text("passwordHash"),
  title: varchar("title", { length: 50 }),
  firstName: varchar("firstName", { length: 255 }),
  lastName: varchar("lastName", { length: 255 }),
  email: varchar("email", { length: 255 }),
  admin: boolean("admin").default(false)
});

export const userPwdResets = mysqlTable("user_pwd_resets", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 36 }).notNull(),
  code: varchar("code", { length: 255 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull()
});

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("userId", { length: 36 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull()
});

export const units = mysqlTable("units", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  unitCode: varchar("unitCode", { length: 255 }).unique(),
  unitName: varchar("unitName", { length: 255 })
});

export const teachingPeriods = mysqlTable("teaching_periods", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  periodName: varchar("periodName", { length: 255 })
});

export const timeslots = mysqlTable("timeslots", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  unitId: varchar("unitId", { length: 36 }).notNull().references(() => units.id),
  teachingPeriodId: varchar("teachingPeriodId", { length: 36 }).notNull().references(() => teachingPeriods.id),
  type: varchar("classType", { length: 255 }),
  activity: varchar("activity", { length: 255 }),
  day: varchar("day", { length: 255 }),
  classTime: varchar("classTime", { length: 50 }).notNull(),
  room: varchar("room", { length: 255 }),
  teachingStaff: text("teachingStaff")
});

export const userTimeslots = mysqlTable("user_timeslots", {
  userId: varchar("userId", { length: 36 }).notNull().references(() => users.id),
  timeslotId: varchar("timeslotId", { length: 36 }).notNull().references(() => timeslots.id)
});

export const timetables = mysqlTable("timetables", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("userId", { length: 36 }).notNull().references(() => users.id),
  timetableName: varchar("timetableName", { length: 255 }).unique(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const timetableTimeslots = mysqlTable("timetable_timeslots", {
  timetableId: varchar("timetableId", { length: 36 }).notNull().references(() => timetables.id),
  timeslotId: varchar("timeslotId", { length: 36 }).notNull().references(() => timeslots.id),
});
