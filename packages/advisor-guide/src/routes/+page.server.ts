import type { ThesisMetadata } from "advisor-guide-core";
import type { PageServerLoad } from "./$types";

// Use Vite's import.meta.glob to load the JSON file at compile time
const jsonFiles = import.meta.glob("../../data/*.json", { eager: true, query: "?json" });

export const load: PageServerLoad = async () => {
    try {
        // Find the correct JSON file (assuming there's only one in the static folder)
        const jsonFile = Object.values(jsonFiles)[0] as { default: ThesisMetadata[] };

        if (!jsonFile) {
            throw new Error("JSON file not found in static folder");
        }

        const metadata: ThesisMetadata[] = jsonFile.default;
        return { metadata };
    } catch (error) {
        console.error("Error loading metadata:", error);
        return { metadata: [] };
    }
};
