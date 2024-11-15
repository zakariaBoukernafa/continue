import { workspace } from "vscode";

export const antalyse_WORKSPACE_KEY = "antalyse";

export function getantalyseWorkspaceConfig() {
  return workspace.getConfiguration(antalyse_WORKSPACE_KEY);
}
