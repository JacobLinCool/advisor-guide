import { AdvisorGuide } from "advisor-guide-core";
import fs from "node:fs";
import { ThesisFetcherNTU } from "../src";

main();

async function main() {
    const department = process.argv[2] || "資訊工程學研究所";
    console.log("Department:", department);

    const fetcher = new ThesisFetcherNTU(department);
    fetcher.log.enabled = true;

    const metadata = await fetcher.fetchAll();
    const institution = AdvisorGuide.build(`國立臺灣大學 ${department}`, metadata);

    fs.writeFileSync(`${department}.json`, JSON.stringify(institution, null, 2));
}
