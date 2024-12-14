export interface ConsentModule {
    categories: Array<string>;
    load: () => void;
}
export declare const categories: {
    ANALYTICS: string;
    EXTERNAL: string;
    MARKETING: string;
};
export default class Consent {
    #private;
    accepted: Set<string>;
    categories: Set<string>;
    container: HTMLElement;
    cookieDomain?: string;
    cookieName: string;
    expires?: string;
    modules: Array<ConsentModule>;
    version: string;
    constructor(config?: Object);
    init(): void;
    initButtons(): void;
    initContainer(): void;
    loadModules(categories: Set<string> | string): void;
    setCategories(categories: Set<string> | string): void;
    addCategories(categories: Set<string> | string): void;
    hasCategory(category: string): boolean;
    getCookie(): string;
    setCookie: (remove?: boolean) => void;
    getButtons(): NodeListOf<HTMLButtonElement>;
    getCheckboxes(): NodeListOf<HTMLInputElement>;
}
//# sourceMappingURL=consent.d.ts.map