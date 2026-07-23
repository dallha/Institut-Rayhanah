import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching students to delete...");
  const { data: students, error } = await supabase.from("Student").select("id, firstName, lastName");
  
  if (error) {
    console.error("Error fetching students:", error);
    return;
  }

  const toDelete = students.filter(s => 
    (s.firstName.includes("Mouhamed Bachir") && s.lastName.includes("Thiam")) ||
    (s.firstName.includes("Aïcha") && s.lastName.includes("Niass"))
  );

  console.log("Found students to delete:", toDelete);

  for (const student of toDelete) {
    const { error: deleteError } = await supabase.from("Student").delete().eq("id", student.id);
    if (deleteError) {
      console.error(`Failed to delete ${student.firstName} ${student.lastName}:`, deleteError);
    } else {
      console.log(`Deleted ${student.firstName} ${student.lastName} (ID: ${student.id})`);
    }
  }

  console.log("Done.");
}

run();
