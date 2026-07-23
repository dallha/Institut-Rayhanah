import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://jaudxdtcsqezwfnuohks.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_GT3dFHBa7S3uYjVd0Hze8A_Hr20_uRZ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface DocxStudent {
  fullName: string;
  monthlyFee: number;
  paymentDate?: string;
  category: string;
}

const CAS_SOCIAUX: DocxStudent[] = [
  { fullName: "Pape Amadou Gueye", monthlyFee: 80000, paymentDate: "2026-07-05", category: "Cas Social" },
  { fullName: "Amdy M. Sow", monthlyFee: 75000, paymentDate: "2026-07-02", category: "Cas Social" },
  { fullName: "Yaye Maguette", monthlyFee: 50000, paymentDate: "2026-07-02", category: "Cas Social" },
  { fullName: "Baye Mourtar", monthlyFee: 50000, paymentDate: "2026-05-19", category: "Cas Social" },
  { fullName: "Aboubacrine Dia", monthlyFee: 50000, paymentDate: "2026-05-19", category: "Cas Social" },
  { fullName: "Aminatou Dia", monthlyFee: 50000, category: "Cas Social" },
  { fullName: "Mohamed Thioune", monthlyFee: 40000, category: "Cas Social" },
  { fullName: "Fatimath Thioune", monthlyFee: 40000, category: "Cas Social" }
];

const CAS_REGULIERS: DocxStudent[] = [
  { fullName: "Mohamed S. Diallo", monthlyFee: 120000, category: "Externat Régulier" },
  { fullName: "Babacar Ndao", monthlyFee: 110000, category: "Externat Régulier" },
  { fullName: "Moussa Bâ", monthlyFee: 110000, category: "Externat Régulier" },
  { fullName: "Mohamed Loum", monthlyFee: 110000, category: "Externat Régulier" },
  { fullName: "Marieme Loum", monthlyFee: 110000, category: "Externat Régulier" },
  { fullName: "Binta Maass", monthlyFee: 110000, category: "Externat Régulier" },
  { fullName: "Cheikh D. Gueye", monthlyFee: 110000, category: "Externat Régulier" },
  { fullName: "Adama Wade", monthlyFee: 110000, category: "Externat Régulier" },
  { fullName: "Awa Wade", monthlyFee: 110000, category: "Externat Régulier" },
  { fullName: "Mohamed L. Jaaby", monthlyFee: 110000, category: "Externat Régulier" },
  { fullName: "Ibrahima Samoura", monthlyFee: 110000, category: "Externat Régulier" },
  { fullName: "Pape Moussa Diarisso", monthlyFee: 100000, category: "Externat Régulier" },
  { fullName: "Nafir Sané", monthlyFee: 100000, category: "Externat Régulier" },
  { fullName: "Mohamed Diing", monthlyFee: 100000, category: "Externat Régulier" },
  { fullName: "Saliou Badji", monthlyFee: 125000, category: "Externat Régulier" }
];

const TABLEAU_MENSUALITES: DocxStudent[] = [
  { fullName: "Ibrahima Niass", monthlyFee: 50000, paymentDate: "2026-06-22", category: "Externat Mensualité" },
  { fullName: "Mahy Niass", monthlyFee: 50000, paymentDate: "2026-06-22", category: "Externat Mensualité" },
  { fullName: "Moustou Aziz", monthlyFee: 50000, category: "Externat Mensualité" },
  { fullName: "Ablaye Diop", monthlyFee: 40000, paymentDate: "2026-07-05", category: "Externat Mensualité" },
  { fullName: "Aïssatou Diop", monthlyFee: 40000, paymentDate: "2026-07-05", category: "Externat Mensualité" },
  { fullName: "M. Dembel Sow", monthlyFee: 40000, paymentDate: "2026-07-05", category: "Externat Mensualité" },
  { fullName: "Hamidou Kaaram", monthlyFee: 35000, category: "Externat Mensualité" },
  { fullName: "Marieme Diallo", monthlyFee: 30000, paymentDate: "2026-07-06", category: "Externat Mensualité" },
  { fullName: "Bachir Sabo", monthlyFee: 25000, category: "Externat Mensualité" },
  { fullName: "Latif Sabo", monthlyFee: 25000, category: "Externat Mensualité" },
  { fullName: "Malick Sarr", monthlyFee: 25000, category: "Externat Mensualité" },
  { fullName: "Aliéka Badji", monthlyFee: 25000, paymentDate: "2026-07-08", category: "Externat Mensualité" },
  { fullName: "Betty Kaam", monthlyFee: 25000, category: "Externat Mensualité" },
  { fullName: "Oumou Kaam", monthlyFee: 25000, category: "Externat Mensualité" },
  { fullName: "Seydina O. Diop", monthlyFee: 25000, paymentDate: "2026-07-03", category: "Externat Mensualité" }
];

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  const lastName = parts.pop() || "";
  const firstName = parts.join(" ");
  return { firstName, lastName };
}

function detectGender(firstName: string): string {
  const nameLower = firstName.toLowerCase();
  if (["marieme", "yaye", "aminatou", "fatimath", "binta", "awa", "aïssatou", "betty", "oumou"].some(n => nameLower.includes(n))) {
    return "F";
  }
  return "M";
}

async function run() {
  console.log("🚀 Syncing 38 students directly with Supabase Cloud...");
  
  // 1. Ensure at least 1 Halaqa exists
  let defaultHalaqaId = "halaqa-general";
  const { data: halaqas } = await supabase.from("Halaqa").select("*");
  if (halaqas && halaqas.length > 0) {
    defaultHalaqaId = halaqas[0].id;
  } else {
    const { data: newH } = await supabase.from("Halaqa").upsert({
      id: "halaqa-general",
      name: "Halaqa Générale",
      teacherName: "Sheikh Oustaz Référent",
      building: "Bâtiment Principal"
    }).select();
    if (newH && newH.length > 0) defaultHalaqaId = newH[0].id;
  }

  const allItems = [...CAS_SOCIAUX, ...CAS_REGULIERS, ...TABLEAU_MENSUALITES];

  let createdCount = 0;
  let paymentCount = 0;

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const { firstName, lastName } = splitName(item.fullName);
    const gender = detectGender(firstName);
    const matricule = `IRY-2026-${String(i + 1).padStart(3, "0")}`;
    const id = `student-july-2026-${i + 1}`;

    const isJulyPaid = item.paymentDate && item.paymentDate.startsWith("2026-07");
    const balanceDue = isJulyPaid ? 0 : item.monthlyFee;

    const studentPayload = {
      id,
      matricule,
      firstName,
      lastName,
      gender,
      halaqaId: defaultHalaqaId,
      regime: item.category.toLowerCase().includes("social") ? "cas_social" : "externat",
      monthlyFee: item.monthlyFee,
      balanceDue,
      currentHizbNum: 60,
      currentHizbFraction: 0,
      etape: "Hifz",
      score: 100,
      status: "active",
      parentName: `Tuteur de ${firstName} ${lastName}`,
      parentPhone: `+221 77 000 ${String(i + 1).padStart(4, "0")}`
    };

    const { error: studentErr } = await supabase
      .from("Student")
      .upsert(studentPayload);

    if (studentErr) {
      console.error(`❌ Error inserting ${item.fullName}:`, studentErr.message);
    } else {
      createdCount++;
      console.log(`✅ Supabase Upserted: ${firstName} ${lastName} (${matricule})`);
    }

    if (item.paymentDate) {
      const paymentPayload = {
        id: `payment-july-2026-${paymentCount + 1}`,
        studentId: id,
        receiptNumber: `REC-2026-${String(paymentCount + 1).padStart(3, "0")}`,
        amount: item.monthlyFee,
        date: item.paymentDate,
        purpose: `Mensualité (${item.category})`,
        recordedBy: "Administration (Import Juillet 2026)"
      };

      const { error: payErr } = await supabase
        .from("PaymentRecord")
        .upsert(paymentPayload);

      if (payErr) {
        console.error(`❌ Payment insert error for ${item.fullName}:`, payErr.message);
      } else {
        paymentCount++;
      }
    }
  }

  console.log(`\n🎉 IMPORT TO SUPABASE SUCCESSFUL!`);
  console.log(`- Total Students Upserted: ${createdCount}`);
  console.log(`- Total Payment Receipts Upserted: ${paymentCount}`);
}

run();
