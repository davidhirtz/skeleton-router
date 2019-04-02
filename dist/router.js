var Router = (function () {
    return function (o) {
        var _ = this;

        _.$container = $('main');
        _.$body = $('body');

        _.headers = {'X-Ajax-Request': 'route'};
        _.defaultRoute = 'home';

        _.onUnload = _.deconstruct = _.referrer = _.trackingId = null;

        _.loadingClass = 'loading';
        _.noXhrClass = 'no-xhr';
        _.noCacheClass = 'no-cache';

        _.cookieName = '_cc';
        _.$cookieContainer = $('#cc');
        _.$cookieAccept = $('.cc-accept');

        $.extend(_, o);

        _.cache = {};
        _.positions = {};

        _.gtag = _.isPopState = false;

        _.init();
        _.getRequest();

        _.loadAnalytics(_.trackingId);
        _.cookieConsent();

        _.render();
    };
}());

/**
 * Inits ajax routing events.
 */
Router.prototype.init = function () {
    var _ = this,
        win = window,
        doc = document,
        hist = history,
        loc = hist.location || win.location;

    $(win).on('popstate', function (e) {
        _.isPopState = true;
        _.load();

        e.preventDefault();
    });

    $(doc).on('click', 'a', function (e) {
        var t = this;

        _.onClick(e);

        if (e.isDefaultPrevented() || e.ctrlKey || e.metaKey || e.shiftKey || !t.hasAttribute('href') || t.hasAttribute('download') || t.classList.contains(_.noXhrClass) || t.target && t.target !== '_self' || t.href.indexOf(_.getHost()) === -1) {
            return;
        }

        if (t.href !== loc.href || _.noCacheClass) {
            hist.pushState(null, t.title || doc.title, _.sanitizeUrl(t.href));
            _.load(t.classList.contains(_.noCacheClass) ? {cache: false} : null);
        }

        e.preventDefault();
    });

    _.afterInit();
};

/**
 * Global link click event.
 */
Router.prototype.onClick = function () {
};

/**
 * Triggers after init before first render.
 */
Router.prototype.afterInit = function () {
};

/**
 * Loads page via ajax or from cache.
 */
Router.prototype.load = function (options) {
    var _ = this,
        redirect = null,
        request = null;

    _.positions[_.referrer] = {x: window.pageXOffset, y: window.pageYOffset};
    _.getRequest();

    if (_.beforeLoad()) {

        if (!_.cache[_.href] || options) {
            request = $.ajax($.extend({url: _.href, headers: _.headers}, options || {}))
                .done(function (body) {
                    _.cache[_.href] = body;
                })
                .fail(function (jqxhr) {
                    redirect = jqxhr.getResponseHeader('X-Redirect');
                });
        }

        // Wait till deconstruct (if needed) and request are done.
        $.when.apply($, [_.deconstruct, request].filter(function (v) {
            return v;
        }))
            .always(function () {
                _.afterLoad();
                _.updateAnalytics();

                if (redirect) {

                    if (redirect.indexOf(_.getHost()) === -1) {
                        window.location.href = redirect;
                    }

                    history.pushState(null, document.title, _.sanitizeUrl(redirect));
                    _.load({cache: false});
                    return;
                }

                _.render();
            });
    }
};

/**
 * Default implementation checks for onUnload deferred object for loading functionality.
 * If set onUnload needs to call _.deconstruct.resolve() to trigger render.
 *
 * @return boolean whether load request should be executed.
 */
Router.prototype.beforeLoad = function () {
    var _ = this;

    _.$body.addClass(_.loadingClass).trigger('unload');

    if (_.onUnload) {
        _.deconstruct = $.Deferred();
        _.onUnload();
    }

    return true;
};

/**
 * Is called before a ajax request is rendered. Default implementation removes loader elements
 * set in beforeLoad(). This can be overwritten if onUnload is not used.
 */
Router.prototype.afterLoad = function () {
    var _ = this;

    _.$body.removeClass(_.loadingClass);
    _.deconstruct = null;
};

/**
 * Renders page by first url parameter.
 */
Router.prototype.render = function () {
    var _ = this,
        func = (_.params[0] || _.defaultRoute);

    if (_.beforeRender()) {
        func = 'render' + func[0].toUpperCase() + func.slice(1);
        _[(typeof _[func] === 'function' ? func : 'renderContent')](_.cache[_.href]);

        _.afterRender();
    }

    _.referrer = _.href;
    _.isPopState = false;
};

/**
 * @return boolean whether the page or module should be rendered
 */
Router.prototype.beforeRender = function () {
    return true;
};

/**
 * Renders the content when no param specific render function was found.
 */
Router.prototype.renderContent = function (html) {
    var _ = this;

    _.$container.html(html);
    _.resetScrollPosition();
};

/**
 * Triggers after render.
 */
Router.prototype.afterRender = function () {
};

Router.prototype.resetScrollPosition = function () {
    var _ = this;

    if (_.isPopState && _.positions[_.href]) {
        window.scrollTo(_.positions[_.href].x, _.positions[_.href].y);
    } else {
        window.scrollTo(0, 0);
    }
};

Router.prototype.getRequest = function () {
    var _ = this;

    _.href = _.sanitizeUrl(window.location.href);
    _.params = window.location.pathname.replace(/^\//, '').split(/[/?#]/);
};

Router.prototype.getHost = function () {
    return window.location.href.match(/^.+?\/\/+[^/]+/)[0];
};

/**
 * Sanitizes url.
 */
Router.prototype.sanitizeUrl = function (url) {
    return url.replace(/\/$/, '');
};

Router.prototype.loadAnalytics = function (id) {
    // Disable for Google Page Speed Insights.
    if (id && navigator.userAgent.indexOf('Speed Insights') === -1) {
        var _ = this;

        $.getScript('https://www.googletagmanager.com/gtag/js?id=' + id, function () {
            window.dataLayer = window.dataLayer || [];

            _.gtag = function () {
                dataLayer.push(arguments);
            }

            _.gtag('js', new Date());
            _.trackingId = id;

            _.updateAnalytics();
        });
    }
};

// noinspection JSUnusedGlobalSymbols
Router.prototype.updateAnalytics = function () {
    var _ = this;

    if (_.gtag) {
        _.gtag('config', _.trackingId, {
            page_title : document.title,
            page_path: window.location.pathname
        });
    }
};

/**
 * Replaces cached route with AJAX post request.
 */
Router.prototype.post = function (url, data) {
    var _ = this;
    url = _.sanitizeUrl(url);

    history[url !== _.href ? 'pushState' : 'replaceState'](null, document.title, _.sanitizeUrl(url));
    _.load({method: 'post', data: data});
};

/**
 * Scrolls to target.
 */
Router.prototype.scrollTo = function (target, offset, speed) {
    var $target = $(target);

    if ($target.length) {
        $('html,body').animate({scrollTop: $target.offset().top + (offset || 0)}, speed || 300);
    }
};

/**
 * Inits cookie consent.
 */
Router.prototype.cookieConsent = function () {
    var _ = this;

    if (_.$cookieContainer && _.$cookieContainer.length) {
        if (!_.checkConsentCookie()) {
            _.$cookieAccept.one('click', function () {
                _.$cookieContainer.slideDown('fast', function () {
                    _.$cookieContainer.removeClass('active');
                });

                _.setConsentCookie();
            });

            _.$cookieContainer.addClass('active');
        }
    }
};

/**
 * Checks cookie consent cookie.
 */
Router.prototype.checkConsentCookie = function () {
    var _ = this,
        cookies = document.cookie ? document.cookie.split('; ') : [],
        i = 0;

    for (; i < cookies.length; i++) {
        if (cookies[i].split('=')[0] === _.cookieName) {
            return true;
        }
    }

    return false;
};

/**
 * Set cookie.
 */
Router.prototype.setConsentCookie = function () {
    var _ = this,
        date = new Date();

    date.setFullYear(date.getFullYear() + 1);
    document.cookie = _.cookieName + "=1; expires=" + date.toUTCString() + "; path=/";
};
