import type { ThesisMetadata } from "advisor-guide-core";
import { ConcurrencyThrottle } from "./utils";

export abstract class ThesisFetcher {
    public throttle = new ConcurrencyThrottle(3);
    abstract fetchAll(): Promise<ThesisMetadata[]>;
}
