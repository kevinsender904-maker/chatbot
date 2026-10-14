import fs from "node:fs";
import { execSync, spawn } from "node:child_process";

// 1. Build latest static assets for worker static assets serving
console.log("Building static assets for dev server...");
try {
  execSync("npx vite build", { stdio: "inherit" });
} catch (err) {
  console.error("Vite build error during dev bootstrap:", err);
}

// 2. Ensure .dev.vars exists with GEMINI_API_KEY and any Supabase keys if provided in env
const devVarsPath = ".dev.vars";
let currentVars = "";
if (fs.existsSync(devVarsPath)) {
  currentVars = fs.readFileSync(devVarsPath, "utf8");
}

const syncKey = (keyName, val) => {
  if (val && !currentVars.includes(keyName)) {
    fs.appendFileSync(devVarsPath, `\n${keyName}="${val}"\n`);
  }
};

if (process.env.GEMINI_API_KEY) syncKey("GEMINI_API_KEY", process.env.GEMINI_API_KEY);
if (process.env.SUPABASE_URL) syncKey("SUPABASE_URL", process.env.SUPABASE_URL);
if (process.env.SUPABASE_SERVICE_ROLE_KEY) syncKey("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
if (process.env.VITE_SUPABASE_URL) syncKey("VITE_SUPABASE_URL", process.env.VITE_SUPABASE_URL);
if (process.env.VITE_SUPABASE_ANON_KEY) syncKey("VITE_SUPABASE_ANON_KEY", process.env.VITE_SUPABASE_ANON_KEY);

// 3. Ensure wrangler registry directory exists to avoid ENOENT race condition
try {
  const home = process.env.HOME || "/root";
  fs.mkdirSync(`${home}/.config/.wrangler/registry`, { recursive: true });
} catch {}

// 4. Spawn wrangler dev on 0.0.0.0:3000
const child = spawn("npx", ["wrangler", "dev", "--port", "3000", "--ip", "0.0.0.0"], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
