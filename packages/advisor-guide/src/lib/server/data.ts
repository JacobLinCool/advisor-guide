import { env } from "$env/dynamic/private";
import type { Institution, InstitutionMetadata } from "advisor-guide-core";
import { AdvisorGuide } from "advisor-guide-core";

// Use Vite's import.meta.glob to load the JSON file at compile time
export const institutions: Record<string, { default: Institution }> = import.meta.glob(
    "../../../data/*.json",
    { eager: true, query: "?json" },
);

export function listEmbeddedData(): InstitutionMetadata[] {
    return Object.entries(institutions).map(([key, value]) => {
        const guide = new AdvisorGuide(value.default);
        key = key.replace("../../../data/", "").replace(".json", "");
        return guide.metadata(key);
    });
}

export function getEmbeddedData(id: string): Institution | undefined {
    const file = institutions[`../../../data/${id}.json`];
    return file?.default;
}

export async function listRemoteData(
    fetch = globalThis.fetch,
): Promise<(() => Promise<InstitutionMetadata[]>) | null> {
    if (!env.REMOTE_DATA_BASE_URL) {
        console.error("No REMOTE_DATA_BASE_URL provided");
        return null;
    }

    const url = `${env.REMOTE_DATA_BASE_URL}/index.json`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Failed to fetch data from ${url}:`, res.statusText);
            return null;
        }

        return () => res.json();
    } catch (error) {
        console.error(`Failed to fetch data from ${url}:`, error);
        return null;
    }
}

export async function getRemoteData(
    id: string,
    fetch = globalThis.fetch,
): Promise<(() => Promise<Institution>) | null> {
    if (!env.REMOTE_DATA_BASE_URL) {
        console.error("No REMOTE_DATA_BASE_URL provided");
        return null;
    }

    const url = `${env.REMOTE_DATA_BASE_URL}/${id}.json`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Failed to fetch data from ${url}:`, res.statusText);
            return null;
        }

        return () => res.json();
    } catch (error) {
        console.error(`Failed to fetch data from ${url}:`, error);
        return null;
    }
}
