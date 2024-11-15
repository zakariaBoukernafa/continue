import { config } from "dotenv";

import {
  BrowserSerializedantalyseConfig,
  antalyseConfig,
  IContextProvider,
} from "../index.js";

import { ConfigResult, finalToBrowserConfig } from "./load.js";
import { IProfileLoader } from "./profile/IProfileLoader.js";

export interface ProfileDescription {
  title: string;
  id: string;
}

export class ProfileLifecycleManager {
  private savedConfig: antalyseConfig | undefined;
  private savedBrowserConfig?: BrowserSerializedantalyseConfig;
  private pendingConfigPromise?: Promise<antalyseConfig>;

  constructor(private readonly profileLoader: IProfileLoader) {}

  get profileId() {
    return this.profileLoader.profileId;
  }

  get profileTitle() {
    return this.profileLoader.profileTitle;
  }

  get profileDescription(): ProfileDescription {
    return {
      title: this.profileTitle,
      id: this.profileId,
    };
  }

  clearConfig() {
    this.savedConfig = undefined;
    this.savedBrowserConfig = undefined;
    this.pendingConfigPromise = undefined;
  }

  // Clear saved config and reload
  async reloadConfig(): Promise<ConfigResult<antalyseConfig>> {
    this.savedConfig = undefined;
    this.savedBrowserConfig = undefined;
    this.pendingConfigPromise = undefined;

    return this.profileLoader.doLoadConfig();
  }

  async loadConfig(
    additionalContextProviders: IContextProvider[],
  ): Promise<antalyseConfig> {
    // If we already have a config, return it
    if (this.savedConfig) {
      return this.savedConfig;
    } else if (this.pendingConfigPromise) {
      return this.pendingConfigPromise;
    }

    // Set pending config promise
    this.pendingConfigPromise = new Promise(async (resolve, reject) => {
      const { config: newConfig, errors } =
        await this.profileLoader.doLoadConfig();

      if (newConfig) {
        // Add registered context providers
        newConfig.contextProviders = (newConfig.contextProviders ?? []).concat(
          additionalContextProviders,
        );

        this.savedConfig = newConfig;
        resolve(newConfig);
      } else if (errors) {
        reject(
          `Error in config.json: ${errors.map((item) => item.message).join(" | ")}`,
        );
      }
    });

    // Wait for the config promise to resolve
    this.savedConfig = await this.pendingConfigPromise;
    this.pendingConfigPromise = undefined;
    return this.savedConfig;
  }

  async getSerializedConfig(
    additionalContextProviders: IContextProvider[],
  ): Promise<BrowserSerializedantalyseConfig> {
    if (!this.savedBrowserConfig) {
      const antalyseConfig = await this.loadConfig(additionalContextProviders);
      this.savedBrowserConfig = finalToBrowserConfig(antalyseConfig);
    }
    return this.savedBrowserConfig;
  }
}
