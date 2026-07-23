import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching all students...");
  const { data: students, error } = await supabase.from("Student").select("*");

  if (error) {
    console.error("Error fetching students:", error);
    process.exit(1);
  }

  if (!students || students.length === 0) {
    console.log("No students found.");
    process.exit(0);
  }

  console.log(`Found ${students.length} students. Updating statuses...`);

  let updatedCount = 0;

  for (const student of students) {
    let newStatus = "en_cours";
    if (student.etape === "Hafiz" || student.etape === "👑 Hafiz") {
      newStatus = "hafiz";
    }

    if (student.status !== newStatus) {
      const { error: updateError } = await supabase
        .from("Student")
        .update({ status: newStatus })
        .eq("id", student.id);

      if (updateError) {
        console.error(`Error updating student ${student.matricule}:`, updateError);
      } else {
        console.log(`Updated student ${student.matricule} to status '${newStatus}'`);
        updatedCount++;
      }
    }
  }

  console.log(`Done. Updated ${updatedCount} students.`);
}

main();
