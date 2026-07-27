import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "shared", "const", "buildInfo.ts");
const date = new Date().toISOString().slice(0, 10);

const contents = `/**
 * Data da build em ISO date (YYYY-MM-DD).
 * \`scripts/write-build-date.mjs\` atualiza este valor no início de cada build.
 */
export const SITE_BUILD_DATE = "${date}";
`;

writeFileSync(target, contents, "utf8");
console.log(`[build-date] SITE_BUILD_DATE = ${date}`);
