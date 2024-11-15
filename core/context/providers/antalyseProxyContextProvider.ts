import { controlPlaneEnv } from "../../control-plane/env.js";
import {
  ContextItem,
  ContextProviderDescription,
  ContextProviderExtras,
  ContextSubmenuItem,
  LoadSubmenuItemsArgs,
} from "../../index.js";
import { BaseContextProvider } from "../index.js";

class antalyseProxyContextProvider extends BaseContextProvider {
  static description: ContextProviderDescription = {
    title: "antalyse-proxy",
    displayTitle: "antalyse Proxy",
    description: "Retrieve a context item from a antalyse for Teams add-on",
    type: "submenu",
  };

  workOsAccessToken: string | undefined = undefined;

  override get description(): ContextProviderDescription {
    return {
      title:
        this.options.title || antalyseProxyContextProvider.description.title,
      displayTitle:
        this.options.displayTitle ||
        antalyseProxyContextProvider.description.displayTitle,
      description:
        this.options.description ||
        antalyseProxyContextProvider.description.description,
      type: this.options.type || antalyseProxyContextProvider.description.type,
    };
  }

  async loadSubmenuItems(
    args: LoadSubmenuItemsArgs,
  ): Promise<ContextSubmenuItem[]> {
    const response = await args.fetch(
      new URL(
        `/proxy/context/${this.options.id}/list`,
        controlPlaneEnv.CONTROL_PLANE_URL,
      ),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.workOsAccessToken}`,
        },
      },
    );
    const data = await response.json();
    return data.items;
  }

  async getContextItems(
    query: string,
    extras: ContextProviderExtras,
  ): Promise<ContextItem[]> {
    const response = await extras.fetch(
      new URL(
        `/proxy/context/${this.options.id}/retrieve`,
        controlPlaneEnv.CONTROL_PLANE_URL,
      ),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.workOsAccessToken}`,
        },
        body: JSON.stringify({
          query: query || "",
          fullInput: extras.fullInput,
        }),
      },
    );

    const items: any = await response.json();
    return items;
  }
}

export default antalyseProxyContextProvider;
