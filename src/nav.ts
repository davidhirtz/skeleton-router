export default class Nav {
    $links!: NodeListOf<HTMLLinkElement>;
    $active!: Set<HTMLLinkElement>;
    matchAll!: boolean;

    constructor(config?: Object) {
        const nav = this;
        const body = document.body;

        Object.assign(nav, {
            $active: new Set(),
            $links: body.querySelectorAll('.nav-link'),
            matchAll: false,
            ...config
        });
    }

    update() {
        this.updateByPathname(location.pathname);
    }

    updateByPathname(pathname: string) {
        const $nav = this;
        const host = `${location.protocol}//${location.hostname}`;
        const cssClass = 'active';

        let params: string[] = pathname.split('/');

        $nav.$active.forEach(active => active.classList.remove(cssClass));
        $nav.$active.clear();

        while (params.length) {
            let href = host + params.join('/');
            params.pop();

            $nav.$links.forEach(($link) => {
                if ((!$nav.$active.size || $nav.matchAll) && $link.href === href) {
                    $nav.$active.add($link);
                    $link.classList.add(cssClass);
                    params = [];
                }
            });
        }
    }
}