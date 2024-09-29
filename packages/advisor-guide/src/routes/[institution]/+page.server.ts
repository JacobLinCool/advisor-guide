import { getEmbeddedData, getRemoteData } from "$lib/server/data";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
    const institution = getEmbeddedData(params.institution);
    if (institution) {
        return { institution };
    }

    const remote = await getRemoteData(params.institution, fetch);
    if (remote) {
        return { institution: remote() };
    }

    throw error(404, "Institution not found");
};
