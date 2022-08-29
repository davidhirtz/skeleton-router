import { categories } from './consent.js';
import { loadScript } from './utils.js';
export default class Gtag {
    constructor(config) {
        const module = this;
        if (typeof config === 'string') {
            config = { id: config };
        }
        Object.assign(module, Object.assign({ categories: [categories.ANALYTICS], id: [] }, config));
        if (!Array.isArray(module.id)) {
            module.id = [module.id];
        }
        module.gtag = null;
        module._isActive = false;
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
    sendPageView(options) {
        const module = this;
        if (module.isActive()) {
            module.id.forEach(function (trackingId) {
                const location = window.location;
                module.gtag('event', 'page_view', Object.assign({ page_title: document.title, page_location: location.href, page_path: location.pathname, send_to: trackingId }, options));
                console.log(Object.assign({ page_title: document.title, page_location: location.href, page_path: location.pathname, send_to: trackingId }, options));
            });
        }
    }
}
