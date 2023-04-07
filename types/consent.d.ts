export interface ConsentModule {
    categories: Array<string>;
    load: () => void;
}
export declare const categories: {
    ANALYTICS: string;
    MARKETING: string;
    SOCIAL: string;
};
export default class Consent {
    buttons: Array<HTMLElement>;
    categories: Array<string>;
    container: HTMLElement;
    cookieDomain?: string;
    cookieName: string;
    defaultValue: string;
    modules: Array<ConsentModule>;
    constructor(config?: Object);
    init(): void;
    initButtons(): void;
    initContainer(): void;
    loadModules(categories: any): void;
    setCategories(categories: any): void;
    hasCategory(category: any): boolean;
    getCookie(): string | false;
    setCookie: (value: string, remove?: boolean) => void;
}
//# sourceMappingURL=consent.d.ts.map