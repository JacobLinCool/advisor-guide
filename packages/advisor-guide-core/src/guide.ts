import type { Advisor, Institution, ThesisMetadata } from "./types";

export class AdvisorGuide {
    public readonly institution: Institution;

    constructor(institution: Institution) {
        this.institution = institution;
    }

    public static build(
        institutionName: string,
        metadata: ThesisMetadata[],
        institutionLink?: string,
    ): Institution {
        const advisorMap = new Map<string, Advisor>();
        const keywordMap: Record<string, Record<string, number>> = {};

        for (const thesis of metadata) {
            const { advisor: advisorName, keywords } = thesis;

            let advisor = advisorMap.get(advisorName);
            if (!advisor) {
                advisor = { name: advisorName, keywords: {}, thesis: [] };
                advisorMap.set(advisorName, advisor);
            }

            advisor.thesis.push(thesis);

            let keywordCount = keywordMap[advisorName] ?? {};
            for (const keyword of keywords) {
                const count = keywordCount[keyword] ?? 0;
                keywordCount[keyword] = count + 1;
            }
            keywordMap[advisorName] = keywordCount;
        }

        for (const advisor of advisorMap.values()) {
            advisor.keywords = keywordMap[advisor.name] ?? {};
        }

        return {
            name: institutionName,
            advisors: Array.from(advisorMap.values()),
            link: institutionLink,
        };
    }

    public get keywords(): string[] {
        const keywordCounts = new Map<string, number>();
        this.institution.advisors.forEach((advisor) => {
            Object.entries(advisor.keywords).forEach(([keyword, count]) => {
                const currentCount = keywordCounts.get(keyword) ?? 0;
                keywordCounts.set(keyword, currentCount + count);
            });
        });
        return Array.from(keywordCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([keyword]) => keyword);
    }
}
