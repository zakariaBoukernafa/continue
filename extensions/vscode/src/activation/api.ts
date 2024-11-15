import { IContextProvider } from "core";

import { VsCodeExtension } from "../extension/VsCodeExtension";

export class VsCodeantalyseApi {
  constructor(private readonly vscodeExtension: VsCodeExtension) {}

  registerCustomContextProvider(contextProvider: IContextProvider) {
    this.vscodeExtension.registerCustomContextProvider(contextProvider);
  }
}
