export default class Router {
    a!: string;
    cache!: Map<string, string>;
    ev!: string
    headers!: { [key: string]: string };
    href!: string;
    isPopState!: boolean;
    l!: Location;
    link: HTMLLinkElement | undefined | null;
    main!: HTMLElement;
    noCacheClass!: string;
    noXhrClass!: string;
    params!: string[];
    positions!: Map<string, { x: number, y: number }>;
    referrer: any;
    transition!: boolean

    constructor(config?: Object) {
        const router = this;

        Object.assign(router, {
            a: 'active',
            cache: new Map(),
            ev: 'afterRender',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-Ajax-Request': 'route',
            },
            l: window.location,
            main: document.querySelector('main'),
            noCacheClass: 'no-cache',
            noXhrClass: 'no-xhr',
            positions: new Map(),
            referrer: null,
            transition: false,
            ...config
        });

        if (router.transition && !document.startViewTransition) {
            router.transition = false;
        }

        router.init();
    }

    init() {
        const router = this;

        window.addEventListener('popstate', function (e: PopStateEvent) {
            router.onPopState.call(router, e);
        }, false);

        document.addEventListener('click', (e: MouseEvent) => {
            let target = e.target as HTMLElement | null;
            router.link = null;

            while (target) {
                if (target.matches('a')) {
                    router.link = target as HTMLLinkElement;
                    router.onClick.call(router, e, (target as HTMLLinkElement));
                    break;
                }

                target = target.parentElement;
            }
        }, false);

        router.scrollToHash();
    }

    onClick(e: MouseEvent, $link: HTMLLinkElement) {
        const router = this;
        const url = $link.href ? new URL($link.href) : false;

        if (e.defaultPrevented
            || e.ctrlKey
            || e.metaKey
            || e.shiftKey
            || !url
            || $link.hasAttribute('download')
            || $link.classList.contains(router.noXhrClass)
            || $link.hasAttribute('target') && $link.getAttribute('target') !== '_self'
            || url.host !== router.l.host
        ) {
            return;
        }

        e.preventDefault();

        if (url.pathname !== router.l.pathname || url.search !== router.l.search) {
            history.pushState(null, $link.title || document.title, router.sanitizeUrl($link.href));
            router.load($link.classList.contains(router.noCacheClass));
            return
        }

        if (router.scrollToPath(url)) {
            return
        }

        router.onUnhandledClick(e, $link);
    }

    onUnhandledClick(_e: MouseEvent, _$target: HTMLLinkElement): void {
    }

    onPopState(e: PopStateEvent) {
        const router = this;

        router.isPopState = true;
        router.load();

        e.preventDefault();
    }

    beforeLoad() {
        return true;
    }

    load(disableCache?: boolean) {
        const router = this;

        router.positions.set(router.referrer, {x: window.scrollX, y: window.scrollY});
        router.getRequest();

        if (router.beforeLoad()) {
            if (disableCache || !router.cache.has(router.href)) {
                const request = new XMLHttpRequest();
                request.open('GET', router.href, true);

                Object.keys(router.headers).forEach((key) => {
                    request.setRequestHeader(key, router.headers[key]);
                });

                request.onload = function () {
                    if (this.status >= 300 && this.status < 400) {
                        const redirect = request.getResponseHeader('X-Redirect');

                        if (redirect) {
                            if (redirect.indexOf(router.l.host) === -1) {
                                router.l.replace(redirect);
                            } else {
                                history.replaceState(null, document.title, router.sanitizeUrl(redirect));
                                router.load(false);
                            }
                        }
                    } else {
                        router.cache.set(router.href, this.response);
                        router.afterLoad();
                    }
                };

                request.send();
            } else {
                router.afterLoad();
            }
        }
    }

    afterLoad() {
        const _ = this;
        _.render();
    }

    beforeRender() {
        return true;
    }

    render(): void {
        const router = this;
        const renderInternal = () => {
            router.renderContent(router.cache.get(router.href)!);
            router.afterRender();
        }

        if (router.beforeRender()) {
            if (router.transition) {
                document.startViewTransition(() => renderInternal());
            } else {
                renderInternal();
            }
        }

        router.referrer = router.href;
        router.isPopState = false;
    }

    renderContent(html: string): void {
        const router = this;

        if (html && html.trim().startsWith('<!DOC')) {
            location.reload();
        } else {
            router.setInnerHTML(router.main, html);
            router.resetScrollPosition();
            router.scrollToHash();
        }
    }

    afterRender(): void {
        document.dispatchEvent(new Event(this.ev));
    }

    resetScrollPosition(): void {
        const router = this;
        const hasPrevPos = router.isPopState && router.positions.has(router.href);
        const position = hasPrevPos ? router.positions.get(router.href)! : {x: 0, y: 0};
        window.scrollTo(position.x, position.y);
    }

    getRequest() {
        const router = this;

        router.href = router.sanitizeUrl(router.l.href);
        router.params = router.l.pathname.replace(/^\//, '').split(/[/?#]/);
    }

    sanitizeUrl(url: string) {
        return url.replace(/\/$/, '');
    };

    setInnerHTML(element: HTMLElement, html: string) {
        element.innerHTML = html;

        // Replace script tags with executable script tags, this executes javascript loaded as text via XMLHttpRequest
        (Array.from(element.querySelectorAll('script')) as Array<HTMLElement>).forEach(oldScript => {
            const newScript = document.createElement('script');

            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));

            oldScript.parentNode!.replaceChild(newScript, oldScript);
        });
    }

    scrollTo(top: number | HTMLElement, offset?: number) {
        scroll({
            top: (typeof top === 'number' ? top : (top.offsetTop ?? 0)) + (offset || 0),
            behavior: "smooth"
        });
    }

    scrollToHash() {
        this.scrollToPath(this.l);
    }

    scrollToPath(path: Location | URL) {
        const router = this;
        const target = path.hash ? document.getElementById(path.hash.substring(1)) : null;

        if (target) {
            router.scrollTo(target, router.scrollToHashOffset());
            return true;
        }

        return false;
    }

    scrollToHashOffset() {
        return 0;
    }
}