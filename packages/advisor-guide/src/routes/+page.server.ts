import { listEmbeddedData, listRemoteData } from "$lib/server/data";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
    const institutions = listEmbeddedData();
    const remoteList = await listRemoteData(fetch);
    if (remoteList) {
        institutions.push(...(await remoteList()));
    }
    return { institutions };
};
