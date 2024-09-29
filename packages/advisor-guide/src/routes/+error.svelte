<script lang="ts">
    import { page } from "$app/stores";
    import SEO from "$lib/components/SEO.svelte";
</script>

<SEO
    title="Error {$page.status} - Advisor Guide"
    description="An error occurred while processing your request."
/>

<main class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="text-center p-8 bg-base-100 rounded-lg shadow-xl max-w-md w-full">
        <h1 class="text-5xl font-bold text-error mb-4">Error {$page.status}</h1>
        <p class="text-xl mb-6">{$page.error?.message || "An unexpected error occurred."}</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/" class="btn btn-primary"> Go to Home </a>
            <a
                href="https://github.com/JacobLinCool/advisor-guide/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline"
            >
                Report Issue
            </a>
        </div>
    </div>
</main>
