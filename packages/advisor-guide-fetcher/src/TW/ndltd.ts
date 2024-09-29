import { Cite } from "@citation-js/core";
import "@citation-js/plugin-ris";
import type { ThesisMetadata } from "advisor-guide-core";
import debug from "debug";
import { ThesisFetcher } from "../fetcher";

const logger = debug("ThesisFetcherNDLTD");

const USER_AGENT = "Mozilla/5.0 ThesisFetcherNDLTD";

export class ThesisFetcherNDLTD extends ThesisFetcher {
    private readonly university: string;
    private readonly department: string;
    public readonly log: debug.Debugger;

    constructor(university: string, department: string) {
        super();
        this.university = university;
        this.department = department;
        this.log = logger.extend(university + department);
    }

    private async getCCD(): Promise<string> {
        const res = await fetch("https://ndltd.ncl.edu.tw/cgi-bin/gs32/gsweb.cgi/login?o=dwebmge");
        if (!res.ok) {
            throw new Error("Failed to fetch CCD");
        }
        const text = await res.text();
        const match = text.match(/ccd=([^/]+)\//);
        if (!match) {
            throw new Error("Failed to parse CCD");
        }

        const ccd = match[1];
        this.log("CCD:", ccd);
        return ccd;
    }

    // query and parse html
    private async query(ccd: string) {
        const res = await fetch(
            `https://ndltd.ncl.edu.tw/cgi-bin/gs32/gsweb.cgi/ccd=${ccd}/search`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Cookie: `ccd=${ccd};`,
                },
                body: new URLSearchParams({
                    qs0: this.university,
                    qf0: "asc",
                    qo1: "and",
                    qs1: this.department,
                    qf1: "sdp",
                    gs32search: "搜尋",
                    displayonerecdisable: "1",
                    extrasearch: "es0",
                    ltyr: "104",
                    eltyr: "113",
                    action: "",
                    op: "",
                    h: "",
                    histlist: "",
                    opt: "m",
                    _status_: "search__v2",
                }),
            },
        );

        if (!res.ok) {
            throw new Error("Failed to query");
        }

        const text = await res.text();
        const entries = text.match(/"etd_e">&nbsp;(\d+)&nbsp/);
        if (!entries) {
            throw new Error("Failed to parse query");
        }

        const count = parseInt(entries[1]);
        this.log("Count:", count);
        return count;
    }

    private async retry<T>(fn: () => Promise<T>, n: number = 3): Promise<T> {
        let err: Error | undefined;
        for (let i = 0; i < n; i++) {
            try {
                return await fn();
            } catch (error) {
                err = error;
                await new Promise((resolve) => setTimeout(resolve, 2 ** i * 1000));
            }
        }
        throw err;
    }

    private async checkIn(ccd: string, start: number, end: number) {
        const res = await fetch(
            `https://ndltd.ncl.edu.tw/cgi-bin/gs32/gsweb.cgi/ccd=${ccd}/getchecker?in=${start}-${end}&cache=${Date.now()}`,
            {
                headers: {
                    Cookie: `ccd=${ccd};`,
                    "User-Agent": USER_AGENT,
                },
            },
        );
        if (!res.ok) {
            throw new Error("Failed to check in");
        }

        const text = await res.text();
        if (!text.includes(`value="${end - start + 1}"`)) {
            throw new Error("Failed to check in");
        }
    }

    private async checkOut(ccd: string, start: number, end: number) {
        const res = await fetch(
            `https://ndltd.ncl.edu.tw/cgi-bin/gs32/gsweb.cgi/ccd=${ccd}/getchecker?out=${start}-${end}&cache=${Date.now()}`,
            {
                headers: {
                    Cookie: `ccd=${ccd};`,
                    "User-Agent": USER_AGENT,
                },
            },
        );
        if (!res.ok) {
            throw new Error("Failed to check out");
        }

        const text = await res.text();
        if (!text.includes(`value="0"`)) {
            throw new Error("Failed to check out");
        }
    }

    private async fetchRIS(ccd: string) {
        const res = await fetch(
            `https://ndltd.ncl.edu.tw/cgi-bin/gs32/gsweb.cgi/ccd=${ccd}/resmage?savefmt=1&crange=1&cfield=9&outfmt=txt&char_fmt=utf8`,
            {
                headers: {
                    Cookie: `ccd=${ccd};`,
                    "User-Agent": USER_AGENT,
                },
            },
        );
        if (!res.ok) {
            throw new Error("Failed to fetch RIS");
        }

        const text = await res.text();
        if (!text.includes("AU")) {
            throw new Error("Failed to fetch RIS");
        }

        return text;
    }

    private parse(ris: string): ThesisMetadata[] {
        const cite = Cite(ris, { forceType: "@ris/file" });
        const records = cite.data[0]._graph.filter((x: any) => x.type === "@ris/record");
        return records.map((entry: any) => {
            const title = entry.data.TI || entry.data.TT;
            const author = entry.data.AU;
            const year = entry.data.PY;
            const advisor = typeof entry.data.A3 === "string" ? entry.data.A3 : entry.data.A3[0];
            const keywords =
                typeof entry.data.KW === "string"
                    ? entry.data.KW.split(",")
                          .map((x: any) => x.trim())
                          .filter(Boolean)
                    : entry.data.KW;
            const abstract = typeof entry.data.AB === "string" ? entry.data.AB : entry.data.AB[0];
            const link = entry.data.UR;
            return {
                advisor,
                author,
                title,
                year,
                keywords,
                abstract,
                link,
            };
        });
    }

    // download and parse ris in a range
    private async download(ccd: string, start: number, end: number) {
        this.log("Downloading RIS:", start, end);

        await this.retry(() => this.checkIn(ccd, start, end));
        const ris = await this.retry(() => this.fetchRIS(ccd));
        await this.retry(() => this.checkOut(ccd, start, end));

        return this.parse(ris);
    }

    public async fetchAll(): Promise<ThesisMetadata[]> {
        const ccd = await this.getCCD();
        const max = await this.query(ccd);

        const metadata: ThesisMetadata[] = [];
        for (let i = 1; i <= 1000; i++) {
            const start = i * 30 - 29;
            const end = Math.min(i * 30, max);
            if (start > end) {
                break;
            }

            const res = await this.download(ccd, start, end);
            metadata.push(...res);
        }

        return metadata;
    }
}
