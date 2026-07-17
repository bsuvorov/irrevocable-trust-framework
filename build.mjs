// Builds the static site: bundles the React component into app.js and
// generates the Tailwind utilities it uses into app.css. Run `npm install`
// once, then `npm run build` after editing irrevocable-trust-framework.jsx.
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

await build({
  stdin: {
    contents: `
      import { createRoot } from "react-dom/client";
      import IrrevocableTrustFramework from "./irrevocable-trust-framework.jsx";
      createRoot(document.getElementById("root")).render(<IrrevocableTrustFramework />);
    `,
    resolveDir: root,
    loader: "jsx",
  },
  bundle: true,
  minify: true,
  format: "iife",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  target: ["es2019", "safari13"],
  outfile: join(root, "app.js"),
  logLevel: "info",
});

execFileSync(
  join(root, "node_modules", ".bin", "tailwindcss"),
  ["-c", "tailwind.config.cjs", "-i", "tailwind.css", "-o", "app.css", "--minify"],
  { cwd: root, stdio: "inherit" }
);

console.log("Build complete: app.js + app.css");
