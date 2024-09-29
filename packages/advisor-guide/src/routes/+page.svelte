<script lang="ts">
    import SEO from "$lib/components/SEO.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import { navigating } from "$app/stores";

    export let data;

    $: ({ institutions } = data);
</script>

<SEO
    title="Advisor Guide - Find Your Perfect Research Mentor"
    description="Use our Advisor Guide to find the perfect research mentor. Explore advisor profiles from various institutions to make an informed decision for your academic journey."
    keywords="advisor guide, research mentor, thesis advisor, graduate studies, academic research, institutions"
/>

<main class="container mx-auto p-4 min-h-screen flex flex-col">
    <h1 class="text-3xl font-bold mb-6">Advisor Guide - All Institutions</h1>

    <section aria-labelledby="institutions-list">
        <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each institutions as institution}
                <li>
                    <a
                        href={`/${institution.key}`}
                        class="block p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors relative"
                    >
                        <h3 class="text-lg font-semibold mb-2">{institution.name}</h3>
                        <div class="text-sm text-gray-600">
                            <p class="flex justify-between">
                                <span>{institution.advisorCount} Advisors</span>
                                <span>•</span>
                                <span>{institution.keywordCount} Keywords</span>
                                <span>•</span>
                                <span>{institution.thesisCount} Theses</span>
                            </p>
                        </div>
                        {#if $navigating && $navigating.to?.url.pathname === `/${institution.key}`}
                            <div
                                class="absolute inset-0 bg-base-200 bg-opacity-75 flex items-center justify-center"
                            >
                                <span class="loading loading-dots loading-md text-primary"></span>
                            </div>
                        {/if}
                    </a>
                </li>
            {/each}
        </ul>
    </section>
</main>

<Footer />
