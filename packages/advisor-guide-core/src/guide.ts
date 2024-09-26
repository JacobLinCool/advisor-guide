import type { Advisor, ThesisMetadata } from "./types";

export class AdvisorGuide {
    private readonly metadata: ThesisMetadata[];
    public advisors: Advisor[] = [];

    constructor(metadata: ThesisMetadata[]) {
        this.metadata = metadata;
        this.build();
    }

    private build(): void {
        const advisorMap = new Map<string, Advisor>();
        const keywordMap = new Map<string, Record<string, number>>();

        for (const thesis of this.metadata) {
            const { advisor: advisorName, keywords } = thesis;

            let advisor = advisorMap.get(advisorName);
            if (!advisor) {
                advisor = { name: advisorName, keywords: [], thesis: [] };
                advisorMap.set(advisorName, advisor);
            }

            advisor.thesis.push(thesis);

            let keywordCount = keywordMap.get(advisorName) ?? {};
            for (const keyword of keywords) {
                const count = keywordCount[keyword] ?? 0;
                keywordCount[keyword] = count + 1;
            }
            keywordMap.set(advisorName, keywordCount);
        }

        for (const advisor of advisorMap.values()) {
            const keywordCount = keywordMap.get(advisor.name) ?? {};
            advisor.keywords = Object.entries(keywordCount)
                .sort((a, b) => b[1] - a[1])
                .map(([keyword]) => keyword);
        }

        this.advisors = Array.from(advisorMap.values());
    }

    public get keywords(): string[] {
        const keywordCounts = new Map<string, number>();
        this.advisors.forEach((advisor) => {
            advisor.keywords.forEach((keyword) => {
                keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
            });
        });
        return Array.from(keywordCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([keyword]) => keyword);
    }
}
