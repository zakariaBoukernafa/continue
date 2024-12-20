import { URL } from "node:url";

import { TRIAL_PROXY_URL } from "../../../control-plane/client";
import { PageData } from "../DocsCrawler";

export class DefaultCrawler {
  constructor(private readonly startUrl: URL) {}

  async crawl(): Promise<PageData[]> {
    const resp = await fetch(new URL("crawl", TRIAL_PROXY_URL).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startUrl: this.startUrl.toString() }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Failed to crawl site: ${text}`);
    }
    const json = (await resp.json()) as PageData[];
    return json;
  }
}
