// noinspection JSUnusedGlobalSymbols

import {ConsentModule, categories} from './consent.js';
import {loadScript} from './utils.js';

declare global {
    // noinspection JSUnusedGlobalSymbols
    interface Window {
        dataLayer: any;
        gtag: Gtag.Gtag;
    }
}

export default class Gtag implements ConsentModule {
    _active: boolean;
    categories: Array<string>;
    consent: boolean;
    tags: Array<string> | null;
    options: Object;

    constructor(tags?: string[] | string | null, config?: Object) {
        const module = this;

        Object.assign(module, {
            categories: [categories.ANALYTICS],
            consentMode: true,
            options: {
                'anonymize_ip': true,
            },
            ...config,
        });

        module.tags = !Array.isArray(tags) ? tags.split(',') : tags;
        module._active = false;
    }

    enable() {
        this._active = true;
    }

    disable() {
        this._active = false;
    }

    isActive() {
        const module = this;
        return module.isActive && window.gtag && module.tags;
    }

    load() {
        if (this.tags) {
            loadScript(`https://www.googletagmanager.com/gtag/js?id=${this.tags[0]}`, () => this.init());
        }
    }

    init() {
        const module = this;
        const denied = 'denied';
        const granted = 'granted';

        window.dataLayer = window.dataLayer || [];

        window.gtag = function () {
            window.dataLayer.push(arguments);
        }

        if (module.consent) {
            window.gtag('consent', 'default', {
                'ad_storage': denied,
                'ad_user_data': denied,
                'ad_personalization': denied,
                'analytics_storage': denied
            });
        }

        window.gtag('js', new Date());

        module.tags.forEach(trackingId => window.gtag('config', trackingId, module.options));

        if (module.consent) {
            window.gtag('consent', 'update', {
                'ad_user_data': granted,
                'ad_personalization': granted,
                'ad_storage': granted,
                'analytics_storage': granted
            });
        }

        module.enable();
    }
}