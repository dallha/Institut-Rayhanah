/**
 * Script pour créer l'utilisateur administrateur dans Supabase Auth
 * Usage: npx tsx scripts/create-admin.ts
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jaudxdtcsqezwfnuohks.supabase.co";
// On utilise la service_role key pour créer un utilisateur côté admin
// IMPORTANT: ne jamais exposer cette clé dans le frontend
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_SERVICE_KEY) {
  console.error("❌ SUPABASE_SERVICE_KEY manquante dans .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@rayhanah.sn";
  const password = process.env.ADMIN_PASSWORD || "Cheikh@66#";

  console.log(`Création de l'admin: ${email}`);
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Confirme directement sans email de vérification
  });

  if (error) {
    if (error.message.includes("already registered")) {
      console.log("✅ L'utilisateur existe déjà.");
    } else {
      console.error("❌ Erreur:", error.message);
      process.exit(1);
    }
  } else {
    console.log(`✅ Admin créé avec succès! ID: ${data.user?.id}`);
    console.log(`   Email: ${email}`);
    console.log(`   Vous pouvez maintenant vous connecter avec ces identifiants.`);
  }
}

createAdmin();
