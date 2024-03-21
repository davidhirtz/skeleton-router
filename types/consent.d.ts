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
    loadModules(categories: Array<string> | string): void;
    setCategories(categories: string): void;
    hasCategory(category: string): boolean;
    getCookie(): string | false;
    setCookie: (value: string, remove?: boolean) => void;
    getButtons(): NodeListOf<HTMLButtonElement>;
    getCheckboxes(): NodeListOf<HTMLInputElement>;
}
//# sourceMappingURL=consent.d.ts.map