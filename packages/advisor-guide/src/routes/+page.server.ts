import { institutions } from "$lib/server/data";
import { AdvisorGuide } from "advisor-guide-core";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const institutionList = Object.entries(institutions).map(([key, value]) => {
        const guide = new AdvisorGuide(value.default);
        return {
            key: key.replace("../../../data/", "").replace(".json", ""),
            name: value.default.name,
            advisorCount: value.default.advisors.length,
            keywordCount: guide.keywords.length,
            thesisCount: value.default.advisors.reduce(
                (sum, advisor) => sum + advisor.thesis.length,
                0,
            ),
        };
    });
    return { institutions: institutionList };
};
