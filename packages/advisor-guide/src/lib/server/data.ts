import type { Institution } from "advisor-guide-core";

// Use Vite's import.meta.glob to load the JSON file at compile time
export const institutions: Record<string, { default: Institution }> = import.meta.glob(
    "../../../data/*.json",
    { eager: true, query: "?json" },
);
