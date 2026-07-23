/**
 * Migration Supabase — Ajoute les colonnes manquantes à la table Halaqa
 * Utilise l'API Management Supabase (nécessite service_role key ou accès direct)
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jaudxdtcsqezwfnuohks.supabase.co";
const SUPABASE_ANON = "sb_publishable_GT3dFHBa7S3uYjVd0Hze8A_Hr20_uRZ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// SQL de migration
const MIGRATION_SQL = `
ALTER TABLE "Halaqa" ADD COLUMN IF NOT EXISTS "building" text;
ALTER TABLE "Halaqa" ADD COLUMN IF NOT EXISTS "schedule" text;
ALTER TABLE "Halaqa" ADD COLUMN IF NOT EXISTS "level" text;
ALTER TABLE "Halaqa" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "Halaqa" ADD COLUMN IF NOT EXISTS "phoneTeacher" text;
ALTER TABLE "Halaqa" ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true;
`;

async function main() {
  console.log("=== Migration Supabase — Ajout colonnes Halaqa ===\n");
  console.log("SQL à exécuter :\n");
  console.log(MIGRATION_SQL);

  // Tentative via rpc execute_sql (si la fonction existe)
  console.log("Tentative via supabase.rpc('execute_sql')...");
  const { error: rpcError } = await (supabase.rpc as any)("execute_sql", { sql: MIGRATION_SQL });
  
  if (rpcError) {
    console.log(`ℹ️  RPC non disponible (${rpcError.message}) — migration manuelle requise.`);
  } else {
    console.log("✅ Migration via RPC réussie !");
  }

  // Vérification post-migration
  const { data, error } = await supabase.from("Halaqa").select("*").limit(1);
  if (data && data.length > 0) {
    const cols = Object.keys(data[0]);
    const newCols = ["building", "schedule", "level", "description", "phoneTeacher", "isActive"];
    console.log("\nRésultat après migration :");
    for (const c of newCols) {
      console.log(`  ${cols.includes(c) ? "✅" : "❌"} ${c}`);
    }
  }
}

main().catch(console.error);
