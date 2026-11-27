import { compile, optimize } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

async function buildCss() {
  const cssInput = `
@import "tailwindcss";

:root {
  --background: #fafafa;
  --foreground: #18181b;
  --card: #ffffff;
  --card-foreground: #18181b;
  --border: #e4e4e7;
  --input: #e4e4e7;
  --primary: #18181b;
  --primary-foreground: #ffffff;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`;

  const compiler = await compile(cssInput, {
    base: rootDir,
    shouldRewriteUrls: true,
    onDependency: () => {},
  });

  const scanner = new Scanner({
    sources: [
      { base: path.resolve(rootDir, "app"), pattern: "**/*", negated: false },
      { base: path.resolve(rootDir, "public"), pattern: "**/*", negated: false },
    ],
  });

  const candidates = scanner.scan();
  const outputCss = compiler.build([...candidates]);
  const optimized = optimize(outputCss, { minify: false }).code;

  const outPath = path.resolve(rootDir, "app/globals.css");
  fs.writeFileSync(outPath, optimized, "utf-8");
  console.log(`[build-css] Compiled ${candidates.length} Tailwind CSS utility classes into app/globals.css (${optimized.length} bytes)`);
}

buildCss().catch((err) => {
  console.error("[build-css] Error compiling Tailwind:", err);
  process.exit(1);
});
