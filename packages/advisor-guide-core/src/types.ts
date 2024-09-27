export interface ThesisMetadata {
    advisor: string;
    author: string;
    title: string;
    year: string;
    keywords: string[];
    abstract: string;
    link?: string;
}

export interface Advisor {
    name: string;
    link?: string;
    keywords: Record<string, number>;
    thesis: ThesisMetadata[];
}

export interface Institution {
    name: string;
    link?: string;
    advisors: Advisor[];
}
