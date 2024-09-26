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
    keywords: string[];
    thesis: ThesisMetadata[];
}
