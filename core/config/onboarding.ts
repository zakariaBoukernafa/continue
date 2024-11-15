import { SerializedContinueConfig } from "../";

export const TRIAL_FIM_MODEL = "codestral-latest";
export const ONBOARDING_LOCAL_MODEL_TITLE = "Ollama";
export const LOCAL_ONBOARDING_FIM_MODEL = "qwen2.5-coder:0.5b";
export const LOCAL_ONBOARDING_CHAT_MODEL = "qwen2.5-coder:0.5b";
export const LOCAL_ONBOARDING_CHAT_TITLE = "Qwen 2.5 Coder 0.5b";

/**
 * We set the "best" chat + autocopmlete models by default
 * whenever a user doesn't have a config.json
 */
export function setupBestConfig(
  config: SerializedContinueConfig,
): SerializedContinueConfig {
  return {
    ...config,
    models: config.models.filter((model) => model.provider !== "free-trial"),
  };
}

export function setupLocalConfig(
  config: SerializedContinueConfig,
): SerializedContinueConfig {
  return {
    ...config,
    models: [
      {
        title: LOCAL_ONBOARDING_CHAT_TITLE,
        provider: "ollama",
        model: LOCAL_ONBOARDING_CHAT_MODEL,
      },
      ...config.models.filter((model) => model.provider !== "free-trial"),
    ],
    tabAutocompleteModel: {
      title: "Starcoder 3b",
      provider: "ollama",
      model: LOCAL_ONBOARDING_FIM_MODEL,
    },
    embeddingsProvider: {
      provider: "ollama",
      model: "nomic-embed-text",
    },
  };
}

export function setupLocalConfigAfterFreeTrial(
  config: SerializedContinueConfig,
): SerializedContinueConfig {
  return {
    ...config,
    models: [
      {
        title: LOCAL_ONBOARDING_CHAT_TITLE,
        provider: "ollama",
        model: LOCAL_ONBOARDING_CHAT_MODEL,
      },
      {
        title: ONBOARDING_LOCAL_MODEL_TITLE,
        provider: "ollama",
        model: "AUTODETECT",
      },
      ...config.models.filter((model) => model.provider !== "free-trial"),
    ],
  };
}
