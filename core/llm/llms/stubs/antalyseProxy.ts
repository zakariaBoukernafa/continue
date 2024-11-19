import { ControlPlaneProxyInfo } from "../../../control-plane/analytics/IAnalyticsProvider.js";
import OpenAI from "../OpenAI.js";

import type { LLMOptions, ModelProvider } from "../../../index.js";

class antalyseProxy extends OpenAI {
  set controlPlaneProxyInfo(value: ControlPlaneProxyInfo) {
    this.apiKey = value.workOsAccessToken;
    this.apiBase = new URL("openai/v1/", value.controlPlaneProxyUrl).toString();
  }

  static providerName: ModelProvider = "antalyse-proxy";
  static defaultOptions: Partial<LLMOptions> = {
    useLegacyCompletionsEndpoint: false,
  };

  supportsCompletions(): boolean {
    return false;
  }

  supportsFim(): boolean {
    return true;
  }
}

export default antalyseProxy;
