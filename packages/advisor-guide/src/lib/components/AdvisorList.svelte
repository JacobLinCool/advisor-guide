<script lang="ts">
    import type { Advisor } from "advisor-guide-core";
    import AdvisorComponent from "./Advisor.svelte";

    export let advisors: Advisor[] = [];
    export let selectedKeywords: string[] = [];

    $: filteredAdvisors = advisors
        .map((advisor) => ({
            advisor,
            matchedKeywords: advisor.keywords.filter((keyword) =>
                selectedKeywords.includes(keyword),
            ),
        }))
        .filter(({ matchedKeywords }) => matchedKeywords.length > 0)
        .sort((a, b) => b.matchedKeywords.length - a.matchedKeywords.length);
</script>

<div class="space-y-4">
    {#each filteredAdvisors as { advisor, matchedKeywords }}
        <AdvisorComponent {advisor} {matchedKeywords} />
    {/each}
</div>
