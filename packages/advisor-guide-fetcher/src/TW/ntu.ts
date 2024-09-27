import type { ThesisMetadata } from "advisor-guide-core";
import * as cheerio from "cheerio";
import debug from "debug";
import { ThesisFetcher } from "../fetcher";

export interface QueryOptions {
    sort_by?: string;
    order?: string;
    start?: number;
    rpp?: number;
}

export interface Item {
    year: string;
    title: string;
    link: string;
    author: string;
    department: string;
}

export const TW_NTU_DEFAULT_SEARCH_HOST = "https://tdr.lib.ntu.edu.tw";

const logger = debug("ThesisFetcherNTU");

export class ThesisFetcherNTU extends ThesisFetcher {
    private readonly host: string;
    private readonly department: string;
    public readonly log: debug.Debugger;

    constructor(department: string, host = TW_NTU_DEFAULT_SEARCH_HOST) {
        super();
        this.department = department;
        this.host = host;
        this.log = logger.extend(department);
    }

    public async query(options: QueryOptions = {}): Promise<string> {
        const qs = new URLSearchParams();
        qs.set("query", "");
        qs.set("filter_field_1", "dept");
        qs.set("filter_type_1", "contains");
        qs.set("filter_value_1", this.department);
        qs.set("sort_by", options.sort_by || "dc.date.issued_dt");
        qs.set("order", options.order || "desc");
        qs.set("rpp", String(options.rpp || 100));
        qs.set("etal", "0");
        qs.set("start", String(options.start || 0));
        const url = new URL(`/simple-search?${qs.toString()}`, this.host);
        this.log("Querying %s", url.toString());

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Failed to query: ${response.statusText}`);
        }

        const html = await response.text();
        return html;
    }

    public parse(html: string): Item[] {
        const $ = cheerio.load(html);
        const items = $(".discovery-result-results table tr")
            .slice(1)
            .map((_, el) => {
                const $el = $(el);
                const year = $el.find("td").eq(0).text().trim();
                const title = $el.find("td").eq(1).text().trim();
                const link = $el.find("td").eq(1).find("a").attr("href") || "";
                const author = $el.find("td").eq(2).text().trim();
                const department = $el.find("td").eq(3).text().trim();
                return { year, title, link, author, department };
            })
            .get();
        return items;
    }

    public async list(rpp = 100): Promise<Item[]> {
        const items: Item[] = [];
        let start = 0;
        while (true) {
            const html = await this.query({ start, rpp });
            const parsed = this.parse(html);
            if (parsed.length === 0) {
                break;
            }
            items.push(...parsed);
            start += rpp;
        }
        return items;
    }

    public async fetch(item: Item): Promise<ThesisMetadata> {
        const url = new URL(item.link, this.host);
        url.searchParams.set("mode", "full");
        this.log("Fetching %s", url.toString());

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const table = $("table tr")
            .slice(1)
            .map((_, el) => {
                const $el = $(el);
                const key = $el.find(".metadataFieldLabel").text().trim();
                const value = $el.find(".metadataFieldValue").eq(0).text().trim();
                const lang = $el.find(".metadataFieldValue").eq(1).text().trim();
                return { key, value, lang };
            });

        const metadata: Record<string, string | undefined> = {};
        table.each((_, { key, value, lang }) => {
            if (lang !== "en") {
                metadata[key] = value;
            } else if (!metadata[key]) {
                metadata[key] = value;
            }
        });

        const advisor = metadata["dc.contributor.advisor"]?.replace(/\(.+\)$/, "").trim();
        if (!advisor) {
            throw new Error("Advisor not found");
        }

        const author = metadata["dc.contributor.author"]?.trim();
        if (!author) {
            throw new Error("Author not found");
        }
        const title = metadata["dc.title"]?.trim();
        if (!title) {
            throw new Error("Title not found");
        }
        const year = metadata["dc.date.submitted"]?.trim();
        if (!year) {
            throw new Error("Year not found");
        }

        const keywords =
            metadata["dc.subject.keyword"]
                ?.split(",")
                .map((s: string) => s.trim())
                .filter(Boolean) || [];
        const abstract = metadata["dc.description.abstract"]?.trim() || "";
        const link = metadata["dc.identifier.uri"]?.trim();

        return {
            advisor,
            author,
            title,
            year,
            keywords,
            abstract,
            link,
        };
    }

    async fetchAll(): Promise<ThesisMetadata[]> {
        const items = await this.list();
        let finished = 0;

        const metadata = await Promise.all(
            items.map((item) =>
                this.throttle.run(() => {
                    const res = this.fetch(item);
                    this.log(`Fetched ${++finished}/${items.length}`);
                    return res;
                }),
            ),
        );

        return metadata;
    }
}
