<script lang="ts">
    export let title = "Advisor Guide";
    export let description = "Find the perfect research mentor for your academic journey";
    export let keywords = "advisor, research, thesis, graduate studies";
    export let url = "https://advisor-guide.csie.cool";
</script>

<svelte:head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={url} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <link rel="canonical" href={url} />
</svelte:head>
