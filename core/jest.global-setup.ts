import fs from "fs";
import path from "path";

export default async function () {
  process.env.antalyse_GLOBAL_DIR = path.join(__dirname, ".antalyse-test");
  if (fs.existsSync(process.env.antalyse_GLOBAL_DIR)) {
    fs.rmdirSync(process.env.antalyse_GLOBAL_DIR, { recursive: true });
  }
}
