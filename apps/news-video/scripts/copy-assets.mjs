// Copy non-TS runtime files into dist/ so `node dist/cli.js` works.
import { cpSync, existsSync } from "node:fs";

const copies = [
  ["src/render/templates", "dist/render/templates"],
  ["src/render/blocks", "dist/render/blocks"],
  ["assets", "dist/assets"],
];

for (const [from, to] of copies) {
  if (existsSync(from)) cpSync(from, to, { recursive: true });
}
