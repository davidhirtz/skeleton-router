export default class Router {
    constructor(config) {
        const router = this;
        Object.assign(router, Object.assign({ l: window.location, main: document.querySelector('main'), a: 'active', headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-Ajax-Request': 'route',
            }, cache: {}, positions: {}, referrer: null, noXhrClass: 'no-xhr', noCacheClass: 'no-cache' }, config));
        router.init();
    }
    init() {
        const router = this;
        window.addEventListener('popstate', function (e) {
            router.onPopState.call(router, e);
        }, false);
        document.addEventListener('click', (e) => {
            let target = e.target;
            while (target) {
                if (target.matches('a')) {
                    router.onClick.call(router, e, target);
                    break;
                }
                target = target.parentElement;
            }
        }, false);
        router.scrollToHash();
    }
    onClick(e, $link) {
        const router = this, url = $link.href ? new URL($link.href) : false;
        if (e.defaultPrevented
            || e.ctrlKey
            || e.metaKey
            || e.shiftKey
            || !url
            || $link.hasAttribute('download')
            || $link.classList.contains(router.noXhrClass)
            || $link.target && $link.target !== '_self'
            || url.host !== router.l.host) {
            return;
        }
        e.preventDefault();
        if (url.pathname !== router.l.pathname || url.search !== router.l.search) {
            history.pushState(null, $link.title || document.title, router.sanitizeUrl($link.href));
            router.load($link.classList.contains(router.noCacheClass));
            return;
        }
        if (url.hash) {
            const element = document.getElementById(url.hash.substring(1));
            if (element) {
                router.scrollTo(element, router.scrollToHashOffset());
                return;
            }
        }
        router.onUnhandledClick(e, $link);
    }
    onUnhandledClick(_e, _$target) {
    }
    onPopState(e) {
        const router = this;
        router.isPopState = true;
        router.load();
        e.preventDefault();
    }
    beforeLoad() {
        return true;
    }
    load(disableCache) {
        const router = this;
        router.positions[router.referrer] = { x: window.scrollX, y: window.scrollY };
        router.getRequest();
        if (router.beforeLoad()) {
            if (disableCache || !router.cache[router.href]) {
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
                            }
                            else {
                                history.replaceState(null, document.title, router.sanitizeUrl(redirect));
                                router.load(false);
                            }
                        }
                    }
                    else {
                        router.cache[router.href] = this.response;
                        router.afterLoad();
                    }
                };
                request.send();
            }
            else {
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
    render() {
        const router = this;
        if (router.beforeRender()) {
            router.renderContent(router.cache[router.href]);
            router.afterRender();
        }
        router.referrer = router.href;
        router.isPopState = false;
    }
    renderContent(html) {
        const router = this;
        // Fixes iOS Safari bug which loads full page on browser startup, check for "<!DOCTYPE html>" and
        // reload full page if needed
        if (html && html.trim().startsWith('<!DOC')) {
            location.reload();
        }
        else {
            router.setInnerHTML(router.main, html);
            router.resetScrollPosition();
            router.scrollToHash();
        }
    }
    afterRender() {
    }
    resetScrollPosition() {
        const router = this;
        const hasPrevPos = router.isPopState && router.positions[router.href];
        window.scrollTo(hasPrevPos ? router.positions[router.href].x : 0, hasPrevPos ? router.positions[router.href].y : 0);
    }
    getRequest() {
        const router = this;
        router.href = router.sanitizeUrl(router.l.href);
        router.params = router.l.pathname.replace(/^\//, '').split(/[/?#]/);
    }
    sanitizeUrl(url) {
        return url.replace(/\/$/, '');
    }
    ;
    setInnerHTML(element, html) {
        element.innerHTML = html;
        // Replace script tags with executable script tags, this executes javascript loaded as text via XMLHttpRequest
        Array.from(element.querySelectorAll('script')).forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }
    scrollTo(top, offset) {
        var _a;
        scroll({
            top: (typeof top === 'number' ? top : ((_a = top.offsetTop) !== null && _a !== void 0 ? _a : 0)) + (offset || 0),
            behavior: "smooth"
        });
    }
    scrollToHash() {
        const router = this;
        const target = location.hash ? document.getElementById(location.hash.substring(1)) : null;
        if (target) {
            router.scrollTo(target, router.scrollToHashOffset());
        }
    }
    scrollToHashOffset() {
        return 0;
    }
}
