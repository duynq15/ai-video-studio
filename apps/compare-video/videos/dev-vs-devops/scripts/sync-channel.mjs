// Syncs the eyebrow tag ("#eyebrow" in index.html) to CHANNEL from the
// repo-root .env (shared across all videos/ in this series). Runs
// automatically before dev/check/render/publish via npm pre* hooks, so
// changing CHANNEL in .env updates every video's on-screen channel label
// without hand-editing each index.html.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(ROOT, "..", "..");

function loadEnv() {
  const envPath = path.join(REPO_ROOT, ".env");
  if (!fs.existsSync(envPath)) {
    console.warn(
      `[sync-channel] Không thấy ${envPath} — giữ nguyên #eyebrow.\n` +
        "  Tạo file cấu hình: cp .env.example .env (ở thư mục gốc repo)",
    );
    process.exit(0);
  }
  const raw = fs.readFileSync(envPath, "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const m = line.trim().match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    const quoted = m[2].match(/^(['"`])([\s\S]*)\1$/);
    env[m[1]] = quoted ? quoted[2] : m[2].replace(/\s+#.*$/, "").trim();
  }
  return env;
}

function escapeHtmlText(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const { CHANNEL } = loadEnv();
if (!CHANNEL) {
  throw new Error("Missing CHANNEL in .env");
}

const indexPath = path.join(ROOT, "index.html");
const html = fs.readFileSync(indexPath, "utf8");
const channelHtml = escapeHtmlText(CHANNEL);
const updated = html.replace(
  /(<div[^>]*\bid="eyebrow"[^>]*>)[^<]*(<\/div>)/,
  (_match, open, close) => `${open}${channelHtml}${close}`,
);

if (updated === html && !html.includes(`>${channelHtml}<`)) {
  throw new Error('No element with id="eyebrow" found in index.html');
}

if (updated !== html) {
  fs.writeFileSync(indexPath, updated);
  console.log(`Synced #eyebrow to CHANNEL="${CHANNEL}"`);
} else {
  console.log(`#eyebrow already matches CHANNEL="${CHANNEL}"`);
}
