import os from "node:os";

import antalyseProxyAnalyticsProvider from "./analytics/antalyseProxyAnalyticsProvider.js";
import {
  ControlPlaneProxyInfo,
  IAnalyticsProvider,
} from "./analytics/IAnalyticsProvider.js";
import LogStashAnalyticsProvider from "./analytics/LogStashAnalyticsProvider.js";
import PostHogAnalyticsProvider from "./analytics/PostHogAnalyticsProvider.js";
import { ControlPlaneClient } from "./client.js";
import { Analytics } from "@continuedev/config-types";

function createAnalyticsProvider(
  config: Analytics,
): IAnalyticsProvider | undefined {
  // @ts-ignore
  switch (config.provider) {
    case "posthog":
      return new PostHogAnalyticsProvider();
    case "logstash":
      return new LogStashAnalyticsProvider();
    case "continue-proxy":
      return new antalyseProxyAnalyticsProvider();
    default:
      return undefined;
  }
}

export class TeamAnalytics {
  static provider: IAnalyticsProvider | undefined = undefined;
  static uniqueId = "NOT_UNIQUE";
  static os: string | undefined = undefined;
  static extensionVersion: string | undefined = undefined;

  static async capture(event: string, properties: { [key: string]: any }) {
    void TeamAnalytics.provider?.capture(event, {
      ...properties,
      os: TeamAnalytics.os,
      extensionVersion: TeamAnalytics.extensionVersion,
    });
  }

  static async setup(
    config: Analytics,
    uniqueId: string,
    extensionVersion: string,
    controlPlaneClient: ControlPlaneClient,
    controlPlaneProxyInfo: ControlPlaneProxyInfo,
  ) {
    TeamAnalytics.uniqueId = uniqueId;
    TeamAnalytics.os = os.platform();
    TeamAnalytics.extensionVersion = extensionVersion;

    if (!config) {
      await TeamAnalytics.provider?.shutdown();
      TeamAnalytics.provider = undefined;
    } else {
      TeamAnalytics.provider = createAnalyticsProvider(config);
      await TeamAnalytics.provider?.setup(
        config,
        uniqueId,
        controlPlaneProxyInfo,
      );

      if (config.provider === "continue-proxy") {
        (
          TeamAnalytics.provider as antalyseProxyAnalyticsProvider
        ).controlPlaneClient = controlPlaneClient;
      }
    }
  }
}
