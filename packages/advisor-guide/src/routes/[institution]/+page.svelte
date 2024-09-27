<script lang="ts">
    import { onMount } from "svelte";
    import { AdvisorGuide } from "advisor-guide-core";
    import AdvisorList from "$lib/components/AdvisorList.svelte";
    import SEO from "$lib/components/SEO.svelte";
    import YearRangeSelector from "$lib/components/YearRangeSelector.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import Fuse from "fuse.js";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { fade } from "svelte/transition";

    export let data;

    let guide: AdvisorGuide;
    let allKeywords: string[] = [];
    let selectedKeywords: string[] = [];
    let keywordSearch = "";
    let fuse: Fuse<string>;

    let allYears: number[] = [];
    let selectedYear: number | null = null;

    $: filteredKeywords = keywordSearch
        ? fuse.search(keywordSearch).map((result) => result.item)
        : allKeywords;

    $: {
        if (browser) {
            // Update URL with selected keywords and year
            const searchParams = new URLSearchParams($page.url.searchParams);
            searchParams.delete("keywords");
            searchParams.delete("year");
            searchParams.append("keywords", selectedKeywords.join(","));
            if (selectedYear) {
                searchParams.append("year", selectedYear.toString());
            }
            goto(`?${searchParams.toString()}`, {
                replaceState: true,
                keepFocus: true,
                noScroll: true,
            });
        }
    }

    onMount(() => {
        guide = new AdvisorGuide(data.institution);
        allKeywords = guide.keywords;
        fuse = new Fuse(allKeywords, {
            threshold: 0.3,
        });

        // Initialize selectedKeywords and selectedYear from URL
        const urlKeywords = $page.url.searchParams.get("keywords");
        if (urlKeywords) {
            selectedKeywords = urlKeywords.split(",");
        }

        const urlYear = $page.url.searchParams.get("year");
        if (urlYear) {
            selectedYear = parseInt(urlYear, 10);
        } else {
            selectedYear = null;
        }

        allYears = [
            ...new Set(
                guide.institution.advisors.flatMap((advisor) =>
                    advisor.thesis.map((thesis) => parseInt(thesis.year, 10)),
                ),
            ),
        ].sort((a, b) => a - b);
    });

    $: hasSelectedKeywords = selectedKeywords.length > 0;

    function toggleKeyword(keyword: string) {
        if (selectedKeywords.includes(keyword)) {
            selectedKeywords = selectedKeywords.filter((k) => k !== keyword);
        } else {
            selectedKeywords = [...selectedKeywords, keyword];
        }
    }

    function handleYearChange(event: CustomEvent<number>) {
        selectedYear = event.detail;
    }
</script>

<SEO
    title="Advisor Guide - Find Your Perfect Research Mentor"
    description="Use our Advisor Guide to find the perfect research mentor. Search by keywords and explore advisor profiles to make an informed decision for your academic journey."
    keywords="advisor guide, research mentor, thesis advisor, graduate studies, academic research"
/>

<main class="container mx-auto p-4 min-h-screen flex flex-col">
    {#if guide}
        <a href=".."><h1 class="text-xl font-bold">Advisor Guide</h1></a>
        {#if guide.institution.link}
            <a href={guide.institution.link} target="_blank" rel="noopener noreferrer">
                <h2 class="text-3xl font-bold mb-6">{guide.institution.name}</h2>
            </a>
        {:else}
            <h2 class="text-3xl font-bold mb-6">{guide.institution.name}</h2>
        {/if}

        <YearRangeSelector {allYears} {selectedYear} on:change={handleYearChange} />

        <section aria-labelledby="keyword-selection">
            <h2 id="keyword-selection" class="text-xl font-semibold mb-2">Filter by Keyword</h2>
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

        <section aria-labelledby="matching-advisors" class="flex-grow">
            <h2 id="matching-advisors" class="text-xl font-semibold mb-4">Matching Advisors</h2>
            {#if !hasSelectedKeywords}
                <p class="text-lg text-gray-600 mb-4">
                    Please select at least one keyword to see matching advisors.
                </p>
            {:else}
                <AdvisorList
                    advisors={guide.institution.advisors}
                    {selectedKeywords}
                    {selectedYear}
                />
            {/if}
        </section>
    {:else}
        <div
            class="flex flex-col items-center justify-center gap-4 h-64 flex-grow"
            in:fade={{ duration: 300 }}
        >
            <span class="loading loading-dots loading-lg text-primary"></span>
            <p class="text-xl font-semibold text-gray-700">Loading advisor information...</p>
            <p class="text-sm text-gray-500">
                This may take a few moments. Thank you for your patience!
            </p>
        </div>
    {/if}
</main>

<Footer />
