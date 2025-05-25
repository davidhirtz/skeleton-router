export default class Nav {
    $links: NodeListOf<HTMLLinkElement>;
    $active: Set<HTMLLinkElement>;
    matchAll: boolean;
    constructor(config?: Object);
    update(): void;
    updateByPathname(pathname: string): void;
}
//# sourceMappingURL=nav.d.ts.map