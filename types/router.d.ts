export default class Router {
    l: Location;
    main: HTMLElement;
    a: string;
    headers: {};
    cache: {};
    positions: {};
    referrer: any;
    noXhrClass: string;
    noCacheClass: string;
    isPopState: boolean;
    href: string;
    params: string[];
    constructor(config?: any);
    init(): void;
    onClick(e: MouseEvent, target: HTMLLinkElement): void;
    onUnhandledClick(e: MouseEvent, target: HTMLLinkElement): void;
    onPopState(e: any): void;
    beforeLoad(): boolean;
    load(disableCache?: boolean): void;
    afterLoad(): void;
    beforeRender(): boolean;
    render(): void;
    renderContent(html: String): void;
    afterRender(): void;
    resetScrollPosition(): void;
    getRequest(): void;
    sanitizeUrl(url: any): any;
    setInnerHTML(element: any, html: any): void;
    scrollTo(top: any, offset?: any): void;
    scrollToHash(): void;
    scrollToHashOffset(): number;
}
//# sourceMappingURL=router.d.ts.map