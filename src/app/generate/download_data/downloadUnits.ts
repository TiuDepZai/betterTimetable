"use server";

import { drizzle } from "drizzle-orm/mysql2";
import { units, timeslots, teachingPeriods } from "../../../db/schema"; 
import { eq, sql } from "drizzle-orm";

export default async function downloadUnit(unitCode: string) {
  const db = drizzle(process.env.DATABASE_URL!); // Connect to database

  try {
    // Fetch the unit name from the units table
    const unitQuery = await db
      .select()
      .from(units)
      .where(eq(units.unitCode, unitCode))
      .execute();

    if (unitQuery.length === 0) {
      return { success: false, message: "Unit not found." };
    }

    const unitName = unitQuery[0].unitName;

    // Fetch the timetable data from the timetable table, joining teachingPeriods
    const timetableQuery = await db
      .select({
        id: timeslots.id,
        unitId: timeslots.unitId,
        teachingPeriodId: timeslots.teachingPeriodId,
        type: timeslots.type,
        activity: timeslots.activity,
        day: timeslots.day,
        classTime: timeslots.classTime,
        room: timeslots.room,
        teachingStaff: timeslots.teachingStaff,
        periodName: teachingPeriods.periodName
      })
      .from(timeslots)
      .leftJoin(teachingPeriods, eq(timeslots.teachingPeriodId, teachingPeriods.id))
      .where(eq(timeslots.unitId, unitQuery[0].id))
      .execute();

    return { success: true, unitName, courseData: timetableQuery };
  } catch (error) {
    console.error("Download unit error:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}