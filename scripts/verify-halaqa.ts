/**
 * Script de vérification et migration Supabase pour la table Halaqa
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jaudxdtcsqezwfnuohks.supabase.co";
const SUPABASE_ANON = "sb_publishable_GT3dFHBa7S3uYjVd0Hze8A_Hr20_uRZ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

const REQUIRED_COLUMNS = [
  { name: "id", type: "uuid" },
  { name: "name", type: "text" },
  { name: "teacherName", type: "text" },
  { name: "maxCapacity", type: "integer DEFAULT 20" },
  { name: "building", type: "text" },
  { name: "schedule", type: "text" },
  { name: "level", type: "text" },
  { name: "description", type: "text" },
  { name: "phoneTeacher", type: "text" },
  { name: "isActive", type: "boolean DEFAULT true" },
];

async function main() {
  console.log("=== Vérification Supabase — Table Halaqa ===\n");

  const { data: halaqas, error } = await supabase.from("Halaqa").select("*").limit(10);

  if (error) {
    console.error("❌ Erreur de connexion Supabase:", error.message);
    process.exit(1);
  }

  console.log(`✅ Connexion OK — ${halaqas?.length ?? 0} Halaqa(s) trouvée(s)\n`);

  const keysPresent = halaqas && halaqas.length > 0 ? Object.keys(halaqas[0]) : [];
  const missingCols: string[] = [];

  console.log("📋 Vérification des colonnes requises :");
  for (const col of REQUIRED_COLUMNS) {
    const present = keysPresent.includes(col.name);
    console.log(`   ${present ? "✅" : "❌"} ${col.name}`);
    if (!present) missingCols.push(col.name);
  }

  if (missingCols.length === 0) {
    console.log("\n🎉 Toutes les colonnes sont présentes dans Supabase !");
  } else {
    console.log(`\n⚠️  Colonnes manquantes : ${missingCols.join(", ")}`);
    console.log("\n=== SQL à exécuter dans Supabase SQL Editor ===");
    for (const colName of missingCols) {
      const col = REQUIRED_COLUMNS.find(c => c.name === colName)!;
      console.log(`ALTER TABLE "Halaqa" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type};`);
    }
    console.log("================================================\n");
  }

  // Test d'upsert complet sur la première halaqa
  if (halaqas && halaqas.length > 0) {
    console.log("🧪 Test d'upsert avec tous les nouveaux champs...");
    const first = halaqas[0];
    const testPayload = {
      id: first.id,
      name: first.name,
      teacherName: first.teacherName,
      maxCapacity: first.maxCapacity ?? 20,
      building: first.building ?? "Bâtiment Principal — Mermoz",
      schedule: first.schedule ?? "08h00 - 14h00",
      level: first.level ?? "Hifz Intermédiaire",
      description: first.description ?? "",
      phoneTeacher: first.phoneTeacher ?? "",
      isActive: first.isActive !== false,
    };

    const { error: upsertErr } = await supabase.from("Halaqa").upsert(testPayload);
    if (upsertErr) {
      console.error("❌ Upsert échoué :", upsertErr.message);
      console.log("   → Les colonnes manquantes doivent être créées via SQL ci-dessus.\n");
    } else {
      console.log("✅ Upsert avec tous les champs : OK\n");
    }
  }

  // Affichage de toutes les halaqas
  console.log("=== État de toutes les Halaqas dans Supabase ===");
  (halaqas || []).forEach((h: any, i: number) => {
    console.log(`\n[${i + 1}] ${h.name}`);
    console.log(`    id           : ${h.id}`);
    console.log(`    teacherName  : ${h.teacherName}`);
    console.log(`    maxCapacity  : ${h.maxCapacity}`);
    console.log(`    building     : ${h.building ?? "— non renseigné"}`);
    console.log(`    schedule     : ${h.schedule ?? "— non renseigné"}`);
    console.log(`    level        : ${h.level ?? "— non renseigné"}`);
    console.log(`    description  : ${h.description ?? "— non renseigné"}`);
    console.log(`    phoneTeacher : ${h.phoneTeacher ?? "— non renseigné"}`);
    console.log(`    isActive     : ${h.isActive ?? "— non renseigné"}`);
  });

  console.log("\n=== Fin de la vérification ===");
}

main().catch(console.error);
