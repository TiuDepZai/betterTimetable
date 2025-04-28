"use server";

import { drizzle } from "drizzle-orm/mysql2";
import { units, teachingPeriods, timeslots } from "../../../db/schema";
import { eq, sql } from "drizzle-orm";

export default async function checkUnits(unitCode: string, unitName?: string) {
    const db = drizzle(process.env.DATABASE_URL!);

    try {
        // Check if unit already exists in the database
        const existingUnitQuery = await db
        .select()
        .from(units)
        .where(eq(units.unitCode, unitCode))
        .limit(1)
        .execute();

        const existingUnit = existingUnitQuery[0];

        if (existingUnit) {
            // Fetch all teaching periods for this unit
            const periodIds = await db
                .select({ teachingPeriodId: timeslots.teachingPeriodId })
                .from(timeslots)
                .where(eq(timeslots.unitId, existingUnit.id));
            const uniquePeriodIds = [...new Set(periodIds.map(p => p.teachingPeriodId))];
            let periods: any[] = [];
            if (uniquePeriodIds.length > 0) {
                periods = await db
                    .select()
                    .from(teachingPeriods)
                    .where(sql`${teachingPeriods.id} IN (${uniquePeriodIds.map(id => `'${id}'`).join(",")})`)
                    .execute();
            }
            return { exists: true, unitData: existingUnit, teachingPeriods: periods };
        }
        else {
            return { exists: false };
        }

    }  
    catch (error) {
        console.error("Error checking unit:", error);
        return { exists: false , message: "Something went wrong. Please try again"};
    }

}