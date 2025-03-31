import axios from "axios";
import * as cheerio from "cheerio"; // Use named import
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique IDs
import { NextResponse } from 'next/server';
import { teachingPeriods } from "@/db/schema";


// Add courses to global storage in nested dictionary format
export async function GET(request: { url: string | URL; }) {
  try {
    // Get the search parameters from the request URL
    const url = new URL(request.url);
    const unitCode = url.searchParams.get('unitCode');

    const qut_data = `https://qutvirtual3.qut.edu.au/qvpublic/ttab_unit_search_p.process_teach_period_search?p_unit_cd=${unitCode}`;
    const { data } = await axios.get(qut_data);
    const $ = cheerio.load(data);
    
    // Extract the unit name
    const unitName = $("select").eq(0).text().trim();
    if (!unitName) {
      // If unit name is not found, return an empty response instead of null
      return NextResponse.json({});
    }

    const teachingPeriods = $("select option")
    .map((_, element) => {
    const value = $(element).attr("value"); // Get the value attribute
    const text = $(element).text().trim(); // Get the text content
    return { id: value, name: text }; // Return as an object
    })
    .get();

    const response = {
    unitCode: unitCode,
    unitName: unitName,
    teachingPeriods: teachingPeriods,
    };

    
    console.log("API Call -", response);
    console.log("From server");

    return NextResponse.json(response);
  } catch (error) {
    // If any error occurs, return an empty response instead of a 500 error
    console.error("Error fetching data:", error);
    return NextResponse.json({});
  }
}