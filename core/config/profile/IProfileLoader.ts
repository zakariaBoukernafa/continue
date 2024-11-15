// ProfileHandlers manage the loading of a config, allowing us to abstract over different ways of getting to a antalyseConfig

import { antalyseConfig } from "../../index.js";
import { ConfigResult } from "../load.js";

// After we have the antalyseConfig, the ConfigHandler takes care of everything else (loading models, lifecycle, etc.)
export interface IProfileLoader {
  profileTitle: string;
  profileId: string;
  doLoadConfig(): Promise<ConfigResult<antalyseConfig>>;
  setIsActive(isActive: boolean): void;
}
