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
    constructor(config?: Object);
    init(): void;
    onClick(e: MouseEvent, $link: HTMLLinkElement): void;
    onUnhandledClick(e: MouseEvent, target: HTMLLinkElement): void;
    onPopState(e: PopStateEvent): void;
    beforeLoad(): boolean;
    load(disableCache?: boolean): void;
    afterLoad(): void;
    beforeRender(): boolean;
    render(): void;
    renderContent(html: string): void;
    afterRender(): void;
    resetScrollPosition(): void;
    getRequest(): void;
    sanitizeUrl(url: string): string;
    setInnerHTML(element: HTMLElement, html: string): void;
    scrollTo(top: number | HTMLElement, offset?: number): void;
    scrollToHash(): void;
    scrollToHashOffset(): number;
}
//# sourceMappingURL=router.d.ts.map