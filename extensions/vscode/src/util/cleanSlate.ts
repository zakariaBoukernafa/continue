import fs from "fs";

import { getantalyseGlobalPath } from "core/util/paths";
import { ExtensionContext } from "vscode";

/**
 * Clear all antalyse-related artifacts to simulate a brand new user
 */
export function cleanSlate(context: ExtensionContext) {
  // Commented just to be safe
  // // Remove ~/.antalyse
  // const antalysePath = getantalyseGlobalPath();
  // if (fs.existsSync(antalysePath)) {
  //   fs.rmSync(antalysePath, { recursive: true, force: true });
  // }
  // // Clear extension's globalState
  // context.globalState.keys().forEach((key) => {
  //   context.globalState.update(key, undefined);
  // });
}
