export default class Nav {
    links: NodeListOf<HTMLLinkElement>;
    active: Array<HTMLLinkElement>;
    matchAll: boolean;
    constructor(config?: any);
    update(): void;
    updateByPathname(pathname: any): void;
}
//# sourceMappingURL=nav.d.ts.map