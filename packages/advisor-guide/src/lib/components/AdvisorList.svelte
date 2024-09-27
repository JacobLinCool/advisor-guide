<script lang="ts">
    import type { Advisor } from "advisor-guide-core";
    import AdvisorComponent from "./Advisor.svelte";

    export let advisors: Advisor[] = [];
    export let selectedKeywords: string[] = [];
    export let selectedYear: number | null = null;

    $: filteredAdvisors = advisors
        .map((advisor) => ({
            advisor,
            matchedKeywords: Object.keys(advisor.keywords).filter((keyword) =>
                selectedKeywords.includes(keyword),
            ),
            theses: advisor.thesis.filter((thesis) => {
                const thesisYear = parseInt(thesis.year, 10);
                const yearInrange = !selectedYear || thesisYear >= selectedYear;
                const keywordMatched = thesis.keywords.some((keyword) =>
                    selectedKeywords.includes(keyword),
                );
                return yearInrange && keywordMatched;
            }),
        }))
        .filter(({ matchedKeywords, theses }) => matchedKeywords.length > 0 && theses.length > 0)
        .sort((a, b) => b.matchedKeywords.length - a.matchedKeywords.length);
</script>

<div class="space-y-4">
    {#each filteredAdvisors as { advisor, matchedKeywords, theses }}
        <AdvisorComponent {advisor} {matchedKeywords} {theses} />
    {/each}
</div>
