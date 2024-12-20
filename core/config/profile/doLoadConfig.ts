import {
  antalyseConfig,
  antalyseRcJson,
  IDE,
  IdeSettings,
  SerializedantalyseConfig,
} from "../../";
import { AntalyseProxyReranker } from "../../context/rerankers/antalyseProxyReranker.js";
import { ControlPlaneProxyInfo } from "../../control-plane/analytics/IAnalyticsProvider.js";
import { ControlPlaneClient } from "../../control-plane/client.js";
import { controlPlaneEnv } from "../../control-plane/env.js";
import { TeamAnalytics } from "../../control-plane/TeamAnalytics";
import antalyseProxyEmbeddingsProvider from "../../indexing/embeddings/antalyseProxyEmbeddingsProvider";
import antalyseProxy from "../../llm/llms/stubs/antalyseProxy";
import { TTS } from "../../util/tts";
import { ConfigResult, loadFullConfigNode } from "../load";

export default async function doLoadConfig(
  ide: IDE,
  ideSettingsPromise: Promise<IdeSettings>,
  controlPlaneClient: ControlPlaneClient,
  writeLog: (message: string) => Promise<void>,
  overrideConfigJson: SerializedantalyseConfig | undefined,
  workspaceId?: string,
): Promise<ConfigResult<antalyseConfig>> {
  const workspaceConfigs = await getWorkspaceConfigs(ide);
  const ideInfo = await ide.getIdeInfo();
  const uniqueId = await ide.getUniqueId();
  const ideSettings = await ideSettingsPromise;
  const workOsAccessToken = await controlPlaneClient.getAccessToken();

  let {
    config: newConfig,
    errors,
    configLoadInterrupted,
  } = await loadFullConfigNode(
    ide,
    workspaceConfigs,
    ideSettings,
    ideInfo.ideType,
    uniqueId,
    writeLog,
    workOsAccessToken,
    overrideConfigJson,
  );

  if (configLoadInterrupted || !newConfig) {
    return { errors, config: newConfig, configLoadInterrupted: true };
  }

  // TODO: pass config to pre-load non-system TTS models
  await TTS.setup();

  // Set up control plane proxy if configured
  const controlPlane = (newConfig as any).controlPlane;
  const useOnPremProxy =
    controlPlane?.useantalyseForTeamsProxy === false && controlPlane?.proxyUrl;
  let controlPlaneProxyUrl: string = useOnPremProxy
    ? controlPlane?.proxyUrl
    : controlPlaneEnv.DEFAULT_CONTROL_PLANE_PROXY_URL;

  if (!controlPlaneProxyUrl.endsWith("/")) {
    controlPlaneProxyUrl += "/";
  }
  const controlPlaneProxyInfo = {
    workspaceId,
    controlPlaneProxyUrl,
    workOsAccessToken,
  };

  if (newConfig.analytics) {
    await TeamAnalytics.setup(
      newConfig.analytics as any, // TODO: Need to get rid of index.d.ts once and for all
      uniqueId,
      ideInfo.extensionVersion,
      controlPlaneClient,
      controlPlaneProxyInfo,
    );
  }

  newConfig = await injectControlPlaneProxyInfo(
    newConfig,
    controlPlaneProxyInfo,
  );

  return { config: newConfig, errors, configLoadInterrupted: false };
}

// Pass ControlPlaneProxyInfo to objects that need it
async function injectControlPlaneProxyInfo(
  config: antalyseConfig,
  info: ControlPlaneProxyInfo,
): Promise<antalyseConfig> {
  [...config.models, ...(config.tabAutocompleteModels ?? [])].forEach(
    async (model) => {
      if (model.providerName === "antalyse-proxy") {
        (model as antalyseProxy).controlPlaneProxyInfo = info;
      }
    },
  );

  if (config.embeddingsProvider?.providerName === "antalyse-proxy") {
    (
      config.embeddingsProvider as antalyseProxyEmbeddingsProvider
    ).controlPlaneProxyInfo = info;
  }

  if (config.reranker?.name === "antalyse-proxy") {
    (config.reranker as AntalyseProxyReranker).controlPlaneProxyInfo = info;
  }

  return config;
}

async function getWorkspaceConfigs(ide: IDE): Promise<antalyseRcJson[]> {
  const ideInfo = await ide.getIdeInfo();
  let workspaceConfigs: antalyseRcJson[] = [];

  try {
    workspaceConfigs = await ide.getWorkspaceConfigs();

    // Config is sent over the wire from JB so we need to parse it
    if (ideInfo.ideType === "jetbrains") {
      workspaceConfigs = (workspaceConfigs as any).map(JSON.parse);
    }
  } catch (e) {
    console.debug("Failed to load workspace configs: ", e);
  }

  return workspaceConfigs;
}
