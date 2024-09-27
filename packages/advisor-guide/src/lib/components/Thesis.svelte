<script lang="ts">
    import type { ThesisMetadata } from "advisor-guide-core";

    export let thesis: ThesisMetadata;
    export let matchedKeywords: string[] = [];

    function isKeywordMatched(keyword: string): boolean {
        return matchedKeywords.includes(keyword);
    }
</script>

<li>
    <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-gray-600">{thesis.year}</span>
        <a
            href={thesis.link}
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 hover:underline"
        >
            {thesis.title}
        </a>
    </div>
    <ul class="flex flex-wrap gap-1 mt-1" aria-label="Thesis keywords">
        {#each thesis.keywords as keyword}
            <li>
                <span class="badge badge-sm {isKeywordMatched(keyword) ? 'badge-primary' : ''}">
                    {keyword}
                </span>
            </li>
        {/each}
    </ul>
</li>
