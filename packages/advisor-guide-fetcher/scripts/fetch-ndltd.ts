import { AdvisorGuide } from "advisor-guide-core";
import fs from "node:fs";
import { ThesisFetcherNDLTD } from "../src";

main();

async function main() {
    const university = process.argv[2] || "國立臺灣師範大學";
    const department = process.argv[3] || "資訊工程學系";
    console.log(university, department);

    const fetcher = new ThesisFetcherNDLTD(university, department);
    fetcher.log.enabled = true;

    const metadata = await fetcher.fetchAll();
    const institution = AdvisorGuide.build(`${university} ${department}`, metadata);

    fs.writeFileSync(`${university}-${department}.json`, JSON.stringify(institution, null, 2));
}
