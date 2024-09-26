<script lang="ts">
    import type { Advisor } from "advisor-guide-core";
    import { slide } from 'svelte/transition';

    export let advisor: Advisor;
    export let matchedKeywords: string[] = [];

    $: unmatchedKeywords = advisor.keywords.filter((keyword) => !matchedKeywords.includes(keyword));

    $: sortedTheses = advisor.thesis
        .map((thesis) => ({
            ...thesis,
            matchedCount: thesis.keywords.filter((keyword) => matchedKeywords.includes(keyword))
                .length,
        }))
        .sort((a, b) => b.matchedCount - a.matchedCount);

    function isKeywordMatched(keyword: string): boolean {
        return matchedKeywords.includes(keyword);
    }

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
        <section>
            <h4 class="font-semibold">
                Other Keywords:
                <button
                    class="btn btn-xs btn-ghost"
                    on:click={() => showOtherKeywords = !showOtherKeywords}
                    aria-expanded={showOtherKeywords}
                    aria-controls="other-keywords"
                >
                    {showOtherKeywords ? 'Hide' : 'Show'}
                </button>
            </h4>
            {#if showOtherKeywords}
                <ul id="other-keywords" class="flex flex-wrap gap-1 mt-1" aria-label="Other keywords" transition:slide>
                    {#each unmatchedKeywords as keyword}
                        <li><span class="badge badge-secondary">{keyword}</span></li>
                    {/each}
                </ul>
            {/if}
        </section>
        <section>
            <h4 class="font-semibold">Theses:</h4>
            <div class="max-h-60 overflow-y-auto pr-2">
                <ul class="list-none mt-1 space-y-2">
                    {#each sortedTheses as thesis}
                        <li>
                            <a
                                href={thesis.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-blue-600 hover:underline"
                            >
                                {thesis.title}
                            </a>
                            <ul class="flex flex-wrap gap-1 mt-1" aria-label="Thesis keywords">
                                {#each thesis.keywords as keyword}
                                    <li>
                                        <span
                                            class="badge badge-sm {isKeywordMatched(keyword)
                                                ? 'badge-primary'
                                                : ''}"
                                        >
                                            {keyword}
                                        </span>
                                    </li>
                                {/each}
                            </ul>
                        </li>
                    {/each}
                </ul>
            </div>
        </section>
    </div>
</article>
