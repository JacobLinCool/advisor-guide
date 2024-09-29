import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ data }) => {
    // Wait for the institution data to resolve
    const institution = await data.institution;
    return { institution };
};
