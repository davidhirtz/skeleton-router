class Router {
    constructor(config) {
        const _ = this;

        _.l = window.location;
        _.d = document;
        _.main = _.d.getElementsByTagName('main')[0];
        _.b = _.d.getElementsByTagName('body')[0];

        _.a = 'active';

        _.headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'X-Ajax-Request': 'route',
        };

        _.defaultRoute = 'home';
        _.cache = {};
        _.positions = {};

        _.isPopState = false;

        _.referrer = null;
        _.trackingIds = [];

        _.noXhrClass = 'no-xhr';
        _.noCacheClass = 'no-cache';
        _.consentCookie = '_cc';

        if (config) {
            Object.keys(config).forEach(key => {
                _[key] = config[key];
            });
        }

        _.init();
    }

    init() {
        const _ = this;

        if (_.consentCookie) {
            _.cc = document.querySelector(_.cc || '#cc');
            _.ccAccept = document.querySelectorAll(_.ccAccept || '.cc-accept');
        }

        if (_.checkConsentCookie()) {
            _.loadAnalytics();
        }

        window.addEventListener('popstate', function (e) {
            _.onPopState.call(_, e);
        }, false);

        document.addEventListener('click', function (e) {
            for (let target = e.target; target && target !== this; target = target.parentNode) {
                if (target.matches('a')) {
                    _.onClick.call(_, e, target);
                    break;
                }
            }
        }, false);

        _.afterRender();
    }

    onClick(e, target) {
        const _ = this,
            hist = history,
            loc = hist.location || window.location,
            url = target.href ? new URL(target.href) : false;

        if (e.defaultPrevented ||
            e.ctrlKey ||
            e.metaKey ||
            e.shiftKey ||
            !url ||
            target.hasAttribute('download') ||
            target.classList.contains(_.noXhrClass) ||
            target.target && target.target !== '_self' ||
            url.host !== _.l.host) {
            return;
        }

        if (url.pathname !== loc.pathname) {
            hist.pushState(null, target.title || document.title, _.sanitizeUrl(target.href));
            _.load(target.classList.contains(_.noCacheClass) ? {cache: false} : null);
        } else if (url.hash) {
            _.scrollTo(_.d.getElementById(url.hash.substr(1)));
        }

        e.preventDefault();
    }

    onPopState(e) {
        const _ = this;
        _.isPopState = true;
        _.load();
        e.preventDefault();
    }

    beforeLoad() {
        return true;
    }

    load(options) {
        const _ = this;

        _.positions[_.referrer] = {x: window.pageXOffset, y: window.pageYOffset};
        _.getRequest();

        if (_.beforeLoad()) {
            if (!_.cache[_.href] || options) {
                const request = new XMLHttpRequest();
                request.open('GET', _.href, true);

                Object.keys(_.headers).forEach(key => {
                    request.setRequestHeader(key, _.headers[key]);
                });

                request.onload = function () {
                    if (this.status >= 300 && this.status < 400) {
                        const redirect = request.getResponseHeader('X-Redirect');

                        if (redirect) {
                            if (redirect.indexOf(_.l.host) === -1) {
                                _.l.replace(redirect);
                            } else {
                                history.replaceState(null, document.title, _.sanitizeUrl(redirect));
                                _.load({cache: false});
                            }
                        }
                    } else {
                        _.cache[_.href] = this.response;
                        _.afterLoad();
                    }
                };

                request.send();
            } else {
                _.afterLoad();
            }
        }
    }

    afterLoad() {
        const _ = this;
        _.updateAnalytics();
        _.render();
    }


    beforeRender() {
        return true;
    }

    render() {
        const _ = this;

        _.renderContent(_.cache[_.href]);
        _.afterRender();

        _.referrer = _.href;
        _.isPopState = false;
    }

    renderContent(html) {
        const _ = this;

        _.setInnerHTML(_.main, html);
        _.resetScrollPosition();
    }

    afterRender() {
    }

    resetScrollPosition() {
        const _ = this,
            hasPrevPos = _.isPopState && _.positions[_.href];

        window.scrollTo(hasPrevPos ? _.positions[_.href].x : 0, hasPrevPos ? _.positions[_.href].y : 0)
    }

    loadAnalytics() {
        const _ = this;

        // Disable for Google Page Speed Insights.
        if (_.trackingIds && navigator.userAgent.indexOf('Speed Insights') === -1) {
            _.getScript('https://www.googletagmanager.com/gtag/js?id=' + (Array.isArray(_.trackingIds) ? _.trackingIds[0] : _.trackingIds), function () {
                window.dataLayer = window.dataLayer || [];

                _.gtag = function () {
                    dataLayer.push(arguments);
                };

                _.gtag('js', new Date());
                _.updateAnalytics();
            });
        }
    }

    updateAnalytics() {
        const _ = this;

        if (_.gtag) {
            (!Array.isArray(_.trackingIds) ? [_.trackingIds] : _.trackingIds).forEach(function (trackingId) {
                _.gtag('event', 'page_view', {
                    page_title: document.title,
                    page_location: _.l.href,
                    page_path: _.l.pathname,
                    send_to: trackingId
                });
            });
        }
    }

    checkConsentCookie() {
        const _ = this,
            cookies = document.cookie ? document.cookie.split('; ') : [];

        if (_.cc) {
            for (let i = 0; i < cookies.length; i++) {
                if (cookies[i].split('=')[0] === _.consentCookie) {
                    return true;
                }
            }
        }

        _.requestConsent();
        return false;
    }

    requestConsent() {
        const _ = this;

        _.ccAccept.forEach(function (element) {
            element.addEventListener('click', () => {
                _.loadAnalytics();
                _.setConsentCookie();

                _.removeClass(_.cc);
                element.removeEventListener('click', this);
            })
        });

        _.addClass(_.cc);
    }

    setConsentCookie() {
        const _ = this,
            date = new Date();

        date.setFullYear(date.getFullYear() + 1);
        document.cookie = _.consentCookie + "=1; expires=" + date.toUTCString() + "; path=/; sameSite=Lax";
    }

    getRequest() {
        const _ = this;

        _.href = _.sanitizeUrl(_.l.href);
        _.params = _.l.pathname.replace(/^\//, '').split(/[/?#]/);
    }

    getScript(source, callback) {
        const _ = this;

        let script = _.d.createElement('script'),
            prior = _.d.getElementsByTagName('script')[0];

        script.async = true;

        script.onload = script.onreadystatechange = function (_, isAbort) {
            if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
                script.onload = script.onreadystatechange = null;
                script = undefined;

                if (!isAbort && callback) {
                    setTimeout(callback, 0);
                }
            }
        };

        script.src = source;
        prior.parentNode.insertBefore(script, prior);
    }

    sanitizeUrl(url) {
        return url.replace(/\/$/, '');
    };

    setInnerHTML(element, html) {
        element.innerHTML = html;

        Array.from(element.querySelectorAll('script')).forEach(oldScript => {
            const newScript = document.createElement('script');

            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));

            // noinspection JSCheckFunctionSignatures
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }

    /**
     * https://pawelgrzybek.com/page-scroll-in-vanilla-javascript/
     * @param destination
     * @param duration
     * @param easing
     * @param callback
     * @returns {number|*}
     */
    scrollTo(destination, duration = 200, easing, callback) {
        const easeInQuad = (t) => {
            return t * t;
        }

        const start = window.pageYOffset;
        const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

        const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
        const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
        const destinationOffset = typeof destination === 'number' ? destination : destination.offsetTop;
        const destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset);

        if (!('requestAnimationFrame' in window)) {
            window.scroll(0, destinationOffsetToScroll);
            if (callback) {
                callback();
            }
            return;
        }

        function scroll() {
            const now = 'now' in window.performance ? performance.now() : new Date().getTime();
            const time = Math.min(1, ((now - startTime) / duration));
            const timeFunction = (easing || easeInQuad)(time);

            window.scroll(0, Math.ceil((timeFunction * (destinationOffsetToScroll - start)) + start));

            if (window.pageYOffset === destinationOffsetToScroll) {
                if (callback) {
                    callback();
                }
                return;
            }

            requestAnimationFrame(scroll);
        }

        scroll();
    }

    /**
     * @param element
     * @param {String?} className
     */
    addClass(element, className) {
        element && element.classList.add(className || this.a);
    }

    /**
     * @param element
     * @param {String?} className
     */
    removeClass(element, className) {
        element && element.classList.remove(className || this.a);
    }

    toggleClass(element, className) {
        const _ = this;
        _[_.hasClass(element, className) ? 'removeClass' : 'addClass'](element, className);
    }

    hasClass(element, className) {
        return element && element.classList.contains(className || this.a);
    }

    debounce(funcName) {
        setTimeout(funcName, 1);
    }
}