<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let allYears: number[] = [];
    export let selectedYear: number | null = null;

    const dispatch = createEventDispatcher();

    $: minYear = Math.min(...allYears);
    $: maxYear = Math.max(...allYears);
    $: selectedYearValue = selectedYear ?? minYear;

    function handleYearChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const year = parseInt(target.value, 10);
        dispatch("change", year);
    }

    $: yearsFromNewest = maxYear - selectedYearValue;
</script>

<div class="mb-4">
    <h2 class="text-xl font-semibold mb-2">Filter by Year</h2>
    <div class="flex flex-col items-start gap-2">
        <div class="w-full">
            <input
                type="range"
                min={minYear}
                max={maxYear}
                bind:value={selectedYearValue}
                on:input={handleYearChange}
                class="range range-sm range-primary"
            />
        </div>
        <div class="flex justify-between w-full text-sm font-semibold">
            <span>From {selectedYearValue}</span>
            <span>
                {#if yearsFromNewest === 0}
                    Most recent year
                {:else}
                    {yearsFromNewest} year{yearsFromNewest === 1 ? "" : "s"} from most recent
                {/if}
            </span>
        </div>
    </div>
</div>
