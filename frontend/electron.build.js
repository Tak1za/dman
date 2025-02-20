import { build } from "esbuild";

build({
  entryPoints: ["src/main.ts"],
  outfile: "dist-electron/main.js",
  bundle: true,
  platform: "node",
  target: "esnext",
  external: ["electron"],
  format: "esm",
}).catch(() => process.exit(1));
