<script lang="ts">
    import type { Advisor, ThesisMetadata } from "advisor-guide-core";
    import { slide } from "svelte/transition";
    import Thesis from "./Thesis.svelte";

    export let advisor: Advisor;
    export let matchedKeywords: string[] = [];
    export let theses: ThesisMetadata[] = [];

    $: unmatchedKeywords = Object.keys(advisor.keywords).filter(
        (keyword) => !matchedKeywords.includes(keyword),
    );

    $: sortedTheses = theses
        .map((thesis) => ({
            ...thesis,
            matchedCount: thesis.keywords.filter((keyword) => matchedKeywords.includes(keyword))
                .length,
        }))
        .sort((a, b) => b.matchedCount - a.matchedCount || parseInt(b.year) - parseInt(a.year));

    let showOtherKeywords = false;
</script>

<article class="card bg-base-100 shadow-xl mb-4">
    <div class="card-body">
        <h3 class="card-title">{advisor.name}</h3>
        <section>
            <h4 class="font-semibold">Matched Keywords:</h4>
            <ul class="flex flex-wrap gap-1 mt-1" aria-label="Matched keywords">
                {#each matchedKeywords as keyword}
                    <li><span class="badge badge-primary">{keyword}</span></li>
                {/each}
            </ul>
        </section>
        {#if unmatchedKeywords.length > 0}
            <section>
                <h4 class="font-semibold">
                    Other Keywords:
                    <button
                        class="btn btn-xs btn-ghost"
                        on:click={() => (showOtherKeywords = !showOtherKeywords)}
                        aria-expanded={showOtherKeywords}
                        aria-controls="other-keywords"
                    >
                        {showOtherKeywords ? "Hide" : "Show"}
                    </button>
                </h4>
                {#if showOtherKeywords}
                    <ul
                        id="other-keywords"
                        class="flex flex-wrap gap-1 mt-1"
                        aria-label="Other keywords"
                        transition:slide
                    >
                        {#each unmatchedKeywords as keyword}
                            <li><span class="badge badge-secondary">{keyword}</span></li>
                        {/each}
                    </ul>
                {/if}
            </section>
        {/if}
        <section>
            <h4 class="font-semibold">Theses:</h4>
            <div class="max-h-60 overflow-y-auto pr-2">
                <ul class="list-none mt-1 space-y-2">
                    {#each sortedTheses as thesis}
                        <Thesis {thesis} {matchedKeywords} />
                    {/each}
                </ul>
            </div>
        </section>
    </div>
</article>
