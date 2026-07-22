import fs from "fs";
import { execSync } from "child_process";

const projectRef = "jaudxdtcsqezwfnuohks";
const password = "zJ83vayhFqLbZ0as";

const hosts = [
  "aws-0-eu-west-1.pooler.supabase.com",
  "aws-0-eu-west-3.pooler.supabase.com",
  "aws-0-eu-central-1.pooler.supabase.com",
  "aws-0-us-east-1.pooler.supabase.com",
  "aws-0-us-west-1.pooler.supabase.com",
  "aws-0-[#region].pooler.supabase.com"
];

for (const h of hosts) {
  const url = `postgresql://postgres.${projectRef}:${password}@${h}:6543/postgres?pgbouncer=true`;
  const direct = `postgresql://postgres.${projectRef}:${password}@${h}:5432/postgres`;
  fs.writeFileSync(".env", `DATABASE_URL="${url}"\nDIRECT_URL="${direct}"\n`);
  
  console.log(`Testing host: ${h}...`);
  try {
    const res = execSync("npx prisma db push --accept-data-loss", { encoding: "utf-8", stdio: "pipe", timeout: 8000 });
    console.log(`🎉 SUCCESS ON HOST ${h}! Output:\n`, res);
    process.exit(0);
  } catch (err: any) {
    const msg = (err.stdout || "") + (err.stderr || "");
    if (msg.includes("Your database is now in sync with your Prisma schema") || msg.includes("The database is already in sync")) {
      console.log(`🎉 SUCCESS ON HOST ${h}!`);
      process.exit(0);
    } else if (msg.includes("tenant/user postgres.jaudxdtcsqezwfnuohks not found")) {
      console.log(`❌ ${h}: tenant not found`);
    } else {
      console.log(`👉 ${h} msg:`, msg.slice(0, 150));
    }
  }
}
