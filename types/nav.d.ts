export default class Nav {
    links: NodeListOf<HTMLLinkElement>;
    active: HTMLLinkElement | null;
    constructor();
    update(): void;
    updateByPathname(pathname: any): void;
}
