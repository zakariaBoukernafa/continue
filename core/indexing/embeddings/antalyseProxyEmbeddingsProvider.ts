import { ControlPlaneProxyInfo } from "../../control-plane/analytics/IAnalyticsProvider.js";
import { EmbeddingsProviderName } from "../../index.js";

import OpenAIEmbeddingsProvider from "./OpenAIEmbeddingsProvider.js";

class antalyseProxyEmbeddingsProvider extends OpenAIEmbeddingsProvider {
  static providerName: EmbeddingsProviderName = "antalyse-proxy";

  set controlPlaneProxyInfo(value: ControlPlaneProxyInfo) {
    this.options.apiKey = value.workOsAccessToken;
    this.options.apiBase = new URL(
      "openai/v1",
      value.controlPlaneProxyUrl,
    ).toString();
  }
}

export default antalyseProxyEmbeddingsProvider;
