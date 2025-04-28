"use server";

import { drizzle } from "drizzle-orm/mysql2";
import { units, timeslots, teachingPeriods } from "../../../db/schema"; // 🛠 IMPORT teachingPeriods
import { v4 as uuidv4 } from "uuid";
import * as schema from "../../../db/schema"; 
import { eq } from "drizzle-orm";

export default async function uploadUnit(unitCode: string, courseData: any[], selectedPeriod: string, unitName?: string) {
  const db = drizzle(process.env.DATABASE_URL!); // Connect to database

  try {
    // 0. Ensure teaching period exists (by periodName)
    let teachingPeriodId: string;
    // Try to find the teaching period by name
    const existingPeriods = await db
      .select()
      .from(teachingPeriods)
      .where(eq(teachingPeriods.periodName, selectedPeriod))
      .limit(1)
      .execute();
    if (existingPeriods.length > 0) {
      teachingPeriodId = existingPeriods[0].id;
    } else {
      teachingPeriodId = uuidv4();
      await db.insert(teachingPeriods).values({
        id: teachingPeriodId,
        periodName: selectedPeriod,
      }).execute();
    }

    // 1. Create a new unit ID
    const unitId = uuidv4();

    // 2. Insert the new unit into the units table
    await db.insert(units).values({
      id: unitId,
      unitCode,
      unitName: unitName || "", // fallback to empty string
    }).execute();

    // 3. Prepare timeslot entries
    const timeslotValues = courseData.map(course => ({
      id: course.id || uuidv4(), // fallback to a new UUID
      unitId: unitId,             // link timeslot to the newly created unit
      teachingPeriodId: teachingPeriodId, // use ensured teaching period id
      type: course.classType || "",      // map correctly
      activity: course.activity || "",
      day: course.day || "",
      classTime: course.time,             // required field
      room: course.room || "",
      teachingStaff: course.teachingStaff || "",
    }));

    console.log("Inserting into timeslots:", timeslotValues);

    // 4. Insert into timeslots table
    await db.insert(timeslots).values(timeslotValues).execute();

    return { success: true };
  } catch (error) {
    console.error("Upload unit error:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}
