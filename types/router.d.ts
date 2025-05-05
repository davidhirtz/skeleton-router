export default class Router {
    a: string;
    cache: Map<string, string>;
    ev: string;
    headers: {
        [key: string]: string;
    };
    href: string;
    isPopState: boolean;
    l: Location;
    link: HTMLLinkElement | undefined | null;
    main: HTMLElement;
    noCacheClass: string;
    noXhrClass: string;
    params: string[];
    positions: Map<string, {
        x: number;
        y: number;
    }>;
    referrer: any;
    transition: boolean;
    constructor(config?: Object);
    init(): void;
    onClick(e: MouseEvent, $link: HTMLLinkElement): void;
    onUnhandledClick(_e: MouseEvent, _$target: HTMLLinkElement): void;
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
    scrollToPath(path: Location | URL): boolean;
    scrollToHashOffset(): number;
}
//# sourceMappingURL=router.d.ts.map