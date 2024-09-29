<script lang="ts">
    import "../app.css";
    import { page } from "$app/stores";
</script>

{#if $page.error}
    <slot />
{:else}
    <slot />
{/if}
