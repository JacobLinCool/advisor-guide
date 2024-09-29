import { AdvisorGuide, Institution, InstitutionMetadata } from "advisor-guide-core";
import fs from "node:fs";
import path from "node:path";
import { ThesisFetcherNDLTD, ThesisFetcherNTU } from "../src";

main();

async function main() {
    const dir = path.resolve("data");
    fs.mkdirSync(dir, { recursive: true });

    await downloadNTU(dir);
    await downloadNDLTD(dir);

    await buildIndex(dir);
}

async function downloadNTU(dir: string) {
    const department = {
        ee: "電機工程學研究所",
        csie: "資訊工程學研究所",
        ginm: "資訊網路與多媒體研究所",
    };

    for (const key in department) {
        const name = department[key];
        const file = path.join(dir, `tw-ntu-${key}.json`);
        if (fs.existsSync(file)) {
            console.log("Skip", name);
            continue;
        }

        console.log("Department:", name);

        const fetcher = new ThesisFetcherNTU(name);
        fetcher.log.enabled = true;

        const metadata = await fetcher.fetchAll();
        const institution = AdvisorGuide.build(`國立臺灣大學 ${name}`, metadata);

        fs.writeFileSync(file, JSON.stringify(institution, null));
    }
}

async function downloadNDLTD(dir: string) {
    const entries = {
        "ntnu-csie": ["國立臺灣師範大學", "資訊工程學系"],
        "nycu-computer-science": ["國立陽明交通大學", "資訊科學與工程研究所"],
        "nycu-multimedia": ["國立陽明交通大學", "多媒體工程研究所"],
        "nycu-data-science": ["國立陽明交通大學", "數據科學與工程研究所"],
        "nthu-cs": ["國立清華大學", "資訊工程學系"],
        "nthu-isa": ["國立清華大學", "資訊系統與應用研究所"],
    };

    for (const key in entries) {
        const [university, department] = entries[key];
        const file = path.join(dir, `tw-${key}.json`);
        if (fs.existsSync(file)) {
            console.log("Skip", university, department);
            continue;
        }

        console.log(university, department);

        const fetcher = new ThesisFetcherNDLTD(university, department);
        fetcher.log.enabled = true;

        const metadata = await fetcher.fetchAll();
        const institution = AdvisorGuide.build(`${university} ${department}`, metadata);

        fs.writeFileSync(file, JSON.stringify(institution, null));
    }
}

async function buildIndex(dir: string) {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    const metadata: InstitutionMetadata[] = [];

    for (const file of files) {
        if (file === "index.json") {
            continue;
        }
        console.log("building index", file);

        const content = fs.readFileSync(path.join(dir, file), "utf-8");
        const institution: Institution = JSON.parse(content);
        const guide = new AdvisorGuide(institution);
        metadata.push(guide.metadata(file.replace(/\.json$/, "")));
    }

    fs.writeFileSync(path.join(dir, "index.json"), JSON.stringify(metadata, null));
}
