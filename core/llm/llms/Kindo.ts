import { LLMOptions, ModelProvider } from "../..";

import OpenAI from "./OpenAI";

class Kindo extends OpenAI {
  static providerName: ModelProvider = "kindo";
  static defaultOptions: Partial<LLMOptions> = {
    apiBase: "https://llm.kindo.ai/v1",
    requestOptions: {
      headers: {
        "kindo-token-transaction-type": "antalyse",
      },
    },
  };
}

export default Kindo;
