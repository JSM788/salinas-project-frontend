// Fails when a Tailwind class uses a fixed pixel value for size, width or spacing
// (e.g. max-w-[1400px], text-[11px], min-w-[260px]). Use the rem-based Tailwind
// scale or a token instead so the UI scales with the fluid root font size.
// Allowed: px for borders, rings, shadows, outlines and blur (they must stay crisp).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("../src", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];
const FIXED_PX = /(?<![\w-])(-?[a-z][\w:-]*?)-\[(-?\d+(?:\.\d+)?px)\]/g;
const ALLOWED_PREFIXES = /(^|:)-?(border|ring|shadow|outline|blur|drop-shadow|divide|decoration|underline-offset)(-|$)/;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return EXTENSIONS.some((ext) => path.endsWith(ext)) ? [path] : [];
  });
}

const violations = [];
for (const file of walk(ROOT)) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, index) => {
      for (const match of line.matchAll(FIXED_PX)) {
        if (ALLOWED_PREFIXES.test(match[1])) continue;
        violations.push(`${relative(process.cwd(), file)}:${index + 1}  ${match[0]}`);
      }
    });
}

if (violations.length > 0) {
  console.error("Fixed px values found (use rem scale or tokens):\n" + violations.join("\n"));
  process.exit(1);
}
console.log("check-fixed-px: OK");
