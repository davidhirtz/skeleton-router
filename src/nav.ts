export default class Nav {
    links: NodeListOf<HTMLLinkElement>;
    active: Array<HTMLLinkElement>;
    matchAll: boolean;

    constructor(config?) {
        const nav = this;
        const body = document.body;
        const adminButtons = body.querySelectorAll('.admin-toggle')

        Object.assign(nav, {
            active: [],
            links: body.querySelectorAll('.nav-link'),
            matchAll: false,
            ...config
        });

        adminButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                const root = document.documentElement;
                root.classList.toggle('is-admin');
                e.preventDefault();
            });
        });
    }

    update() {
        this.updateByPathname(location.pathname);
    }

    updateByPathname(pathname) {
        const nav = this;
        const host = `${location.protocol}//${location.hostname}`;
        const cssClass = 'active';

        let params = pathname.split('/');

        nav.active.forEach(active => active.classList.remove(cssClass));
        nav.active = [];

        while (params.length) {
            let href = host + params.join('/');
            params.pop();

            nav.links.forEach((link) => {
                if ((!nav.active.length || nav.matchAll) && link.href === href) {
                    nav.active.push(link);
                    link.classList.add(cssClass);
                    params = false;
                }
            });
        }
    }
}