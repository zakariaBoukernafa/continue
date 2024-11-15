import { getantalyseRcPath, getTsConfigPath } from "core/util/paths";
import { Telemetry } from "core/util/posthog";
import * as vscode from "vscode";

import { VsCodeExtension } from "../extension/VsCodeExtension";
import registerQuickFixProvider from "../lang-server/codeActions";
import { getExtensionVersion } from "../util/util";

import { VsCodeantalyseApi } from "./api";
import { setupInlineTips } from "./inlineTips";

export async function activateExtension(context: vscode.ExtensionContext) {
  // Add necessary files
  getTsConfigPath();
  getantalyseRcPath();

  // Register commands and providers
  registerQuickFixProvider();
  setupInlineTips(context);

  const vscodeExtension = new VsCodeExtension(context);

  // Load antalyse configuration
  if (!context.globalState.get("hasBeenInstalled")) {
    context.globalState.update("hasBeenInstalled", true);
    Telemetry.capture(
      "install",
      {
        extensionVersion: getExtensionVersion(),
      },
      true,
    );
  }

  const api = new VsCodeantalyseApi(vscodeExtension);
  const antalysePublicApi = {
    registerCustomContextProvider: api.registerCustomContextProvider.bind(api),
  };

  // 'export' public api-surface
  // or entire extension for testing
  return process.env.NODE_ENV === "test"
    ? {
        ...antalysePublicApi,
        extension: vscodeExtension,
      }
    : antalysePublicApi;
}
