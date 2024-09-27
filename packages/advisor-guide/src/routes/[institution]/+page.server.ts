import { institutions } from "$lib/server/data";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
    const file = institutions[`../../../data/${params.institution}.json`];

    if (!file) {
        return error(404, "Institution not found");
    }

    const institution = file.default;
    return { institution };
};
