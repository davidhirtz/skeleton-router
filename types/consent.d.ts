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
    categories: Array<string>;
    container: HTMLElement;
    cookieDomain?: string;
    cookieName: string;
    expires?: string;
    modules: Array<ConsentModule>;
    constructor(config?: Object);
    init(): void;
    initButtons(): void;
    initContainer(): void;
    loadModules(categories: Set<string> | string): void;
    setCategories(categories: Set<string> | string): void;
    addCategories(categories: Set<string> | string): void;
    hasCategory(category: string): boolean;
    getCookie(): string | false;
    setCookie: (value: Set<string> | string, remove?: boolean) => void;
    getButtons(): NodeListOf<HTMLButtonElement>;
    getCheckboxes(): NodeListOf<HTMLInputElement>;
}
//# sourceMappingURL=consent.d.ts.map