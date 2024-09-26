<script lang="ts">
    import { onMount } from "svelte";
    import { AdvisorGuide } from "advisor-guide-core";
    import type { ThesisMetadata } from "advisor-guide-core";
    import AdvisorList from "$lib/components/AdvisorList.svelte";
    import SEO from "$lib/components/SEO.svelte";
    import Fuse from "fuse.js";

    export let data: { metadata: ThesisMetadata[] };

    let guide: AdvisorGuide;
    let allKeywords: string[] = [];
    let selectedKeywords: string[] = [];
    let keywordSearch = "";
    let fuse: Fuse<string>;

    $: filteredKeywords = keywordSearch
        ? fuse.search(keywordSearch).map((result) => result.item)
        : allKeywords;

    onMount(() => {
        guide = new AdvisorGuide(data.metadata);
        allKeywords = guide.keywords;
        fuse = new Fuse(allKeywords, {
            threshold: 0.3,
        });
    });

    function toggleKeyword(keyword: string) {
        if (selectedKeywords.includes(keyword)) {
            selectedKeywords = selectedKeywords.filter((k) => k !== keyword);
        } else {
            selectedKeywords = [...selectedKeywords, keyword];
        }
    }
</script>

<SEO
    title="Advisor Guide - Find Your Perfect Research Mentor"
    description="Use our Advisor Guide to find the perfect research mentor. Search by keywords and explore advisor profiles to make an informed decision for your academic journey."
    keywords="advisor guide, research mentor, thesis advisor, graduate studies, academic research"
/>

<main class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">Advisor Guide</h1>

    <section aria-labelledby="keyword-selection">
        <h2 id="keyword-selection" class="text-xl font-semibold mb-2">Select Keywords</h2>
        <input
            type="text"
            placeholder="Search keywords"
            aria-label="Search keywords"
            class="input input-bordered w-full max-w-xs mb-2"
            bind:value={keywordSearch}
        />
        <div
            class="flex flex-wrap gap-2 max-h-60 overflow-y-auto"
            role="listbox"
            aria-label="Available keywords"
        >
            {#each filteredKeywords as keyword}
                <button
                    role="option"
                    aria-selected={selectedKeywords.includes(keyword)}
                    class="btn btn-sm {selectedKeywords.includes(keyword)
                        ? 'btn-primary'
                        : 'btn-outline'}"
                    on:click={() => toggleKeyword(keyword)}
                >
                    {keyword}
                </button>
            {/each}
        </div>
    </section>

    <section aria-labelledby="matching-advisors">
        <h2 id="matching-advisors" class="text-xl font-semibold mb-4">Matching Advisors</h2>
        {#if guide}
            <AdvisorList advisors={guide.advisors} {selectedKeywords} />
        {:else}
            <p>Loading advisor information...</p>
        {/if}
    </section>
</main>
