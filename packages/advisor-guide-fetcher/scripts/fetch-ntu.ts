import type { ThesisMetadata } from "advisor-guide-core";
import fs from "node:fs";
import { ThesisFetcherNTU } from "../src";

main();

async function main() {
    const department = process.argv[2] || "資訊工程學研究所";
    console.log("Department:", department);

    const fetcher = new ThesisFetcherNTU();
    fetcher.log.enabled = true;

    const items = await fetcher.list(department);

    const metadata: ThesisMetadata[] = [];
    for (let i = 0; i < items.length; i++) {
        console.log(`Fetching ${i + 1}/${items.length}`);
        const item = items[i];
        const data = await fetcher.fetch(item);
        metadata.push(data);
    }

    fs.writeFileSync(`${department}.json`, JSON.stringify(metadata, null, 2));
}
