const esbuild = require("esbuild");

const flags = process.argv.slice(2);

const esbuildConfig = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "out/extension.js",
  external: ["vscode", "esbuild", "./xhr-sync-worker.js"],
  format: "cjs",
  platform: "node",
  sourcemap: flags.includes("--sourcemap"),
  loader: {
    ".node": "file",
  },
  inject: ["./scripts/importMetaUrl.js"],
  define: { "import.meta.url": "importMetaUrl" },
  supported: { "dynamic-import": false },
};

(async () => {
  try {
    if (flags.includes("--watch")) {
      const ctx = await esbuild.context(esbuildConfig);
      await ctx.watch();
    } else {
      await esbuild.build(esbuildConfig);
    }
    console.log("VS Code Extension esbuild complete");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
})();
