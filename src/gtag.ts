import {ConsentModule, categories} from './consent.js';
import {loadScript} from './utils.js';

declare global {
    // noinspection JSUnusedGlobalSymbols
    interface Window {
        dataLayer: any;
    }
}

/**
 * Google Analytics module.
 */
export default class Gtag implements ConsentModule {
    categories: Array<string>;
    _isActive: boolean;
    id: Array<string> | null;
    gtag: Gtag.Gtag;

    constructor(id?: any) {
        const module = this;

        Object.assign(module, {
            categories: [categories.ANALYTICS],
            id: null,
            gtag: null,
            _isActive: false,
        });

        if (id) {
            module.id = !Array.isArray(module.id) ? [id] : id;
        }
    }

    enable() {
        this._isActive = true;
    }

    disable() {
        this._isActive = false;
    }

    isActive() {
        const module = this;
        return module.isActive && module.gtag && module.id;
    }

    load() {
        const module = this;

        // Disable for Google Page Speed Insights.
        if (module.id && navigator.userAgent.indexOf('Speed Insights') === -1) {
            loadScript(`https://www.googletagmanager.com/gtag/js?id=${module.id[0]}`, () => {
                window.dataLayer = window.dataLayer || [];

                module.gtag = () => window.dataLayer.push(arguments);
                module.gtag('js', new Date());

                module.enable();
                module.sendPageView();
            });
        }
    }

    sendPageView(options?: Object) {
        const module = this;

        if (module.isActive()) {
            module.id.forEach(function (trackingId) {
                const location = window.location;

                module.gtag('event', 'page_view', {
                    page_title: document.title,
                    page_location: location.href,
                    page_path: location.pathname,
                    send_to: trackingId,
                    ...options
                });
            });
        }
    }
}