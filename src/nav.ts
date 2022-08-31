export default class Nav {
    links: NodeListOf<HTMLLinkElement>;
    active: HTMLLinkElement|null;

    constructor() {
        const nav = this;
        const body = document.body;
        const adminButtons = body.querySelectorAll('.admin-toggle');

        nav.links = body.querySelectorAll('.nav-link');
        nav.active = null;

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

        nav.active && nav.active.classList.remove(cssClass);
        nav.active = null;

        while (params.length) {
            let href = host + params.join('/');
            params.pop();

            nav.links.forEach((link) => {
                if (!nav.active && link.href === href) {
                    nav.active = link;
                    link.classList.add(cssClass);
                    params = false;
                }
            });
        }
    }
}