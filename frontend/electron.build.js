import { build } from "esbuild";

build({
  entryPoints: ["src/main.ts", "src/preload.ts"],
  outdir: "dist-electron",
  bundle: true,
  platform: "node",
  target: "esnext",
  external: ["electron"],
  format: "esm",
}).catch(() => process.exit(1));
