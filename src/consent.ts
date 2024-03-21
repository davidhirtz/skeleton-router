export interface ConsentModule {
    categories: Array<string>;
    load: () => void;
}

export const categories = {
    ANALYTICS: 'analytics',
    MARKETING: 'marketing',
    SOCIAL: 'social',
}

export default class Consent {
    buttons: NodeListOf<HTMLButtonElement>;
    categories: Array<string>;
    container: HTMLElement
    cookieDomain?: string;
    cookieName: string;
    expires?: string;
    modules: Array<ConsentModule>;

    constructor(config?: Object) {
        const consent = this;

        Object.assign(consent, {
            categories: [categories.ANALYTICS, categories.MARKETING, categories.SOCIAL],
            container: document.getElementById('cc'),
            cookieName: '_cc',
            modules: [],
            ...config
        });

        consent.init();
    }

    init() {
        const consent = this;
        const categories = consent.getCookie();

        if (categories) {
            consent.loadModules(categories);
        } else {
            consent.initContainer();
        }

        consent.initButtons();
    }

    initButtons() {
        const consent = this;

        consent.getButtons().forEach(($btn: HTMLButtonElement) => {
            $btn.addEventListener('click', (e) => {
                if ($btn.hasAttribute('data-consent')) {
                    consent.setCategories($btn.dataset.consent);
                } else {
                    let categories = [];

                    consent.getCheckboxes().forEach(($check: HTMLInputElement) => {
                        const newCategories: Array<string> = ($btn.dataset.consent || '').split(',')

                        newCategories.forEach((category) => {
                            if (!categories.includes(category)) {
                                categories.push(category);
                            }
                        })
                    });

                    consent.setCategories(categories.join(','));
                }

                e.preventDefault();
            });
        });
    }

    initContainer() {
        const consent = this;

        consent.container?.classList.add('active');
    }

    loadModules(categories: Array<string> | string) {
        const consent = this;

        if (typeof categories === 'string') {
            categories = categories.split(',');
        }

        consent.modules.forEach((module) => {
            if (module.categories.every((category) => categories.includes(category))) {
                module.load();
            }
        });
    }

    setCategories(categories: string) {
        const consent = this;

        consent.setCookie(categories);
        consent.loadModules(categories);

        consent.container?.classList.remove('active');
    }

    // noinspection JSUnusedGlobalSymbols
    hasCategory(category: string) {
        const cookie = this.getCookie();
        return cookie && cookie.split(',').includes(category);
    }

    getCookie() {
        const cookies = document.cookie
            ? document.cookie.split('; ')
            : [];

        for (let i = 0; i < cookies.length; i++) {
            const params = cookies[i].split('=');

            if (params[0] === this.cookieName) {
                return params[1];
            }
        }

        return false;
    };

    setCookie = function (value: string, remove?: boolean) {
        const consent = this;
        let expires: string = consent.expires;

        if (remove) {
            expires = 'Thu, 01 Jan 1970 00:00:01 GMT';
        } else if (!expires) {
            const date = new Date();
            date.setFullYear(date.getFullYear() + 1);
            expires = date.toUTCString();
        }

        document.cookie = `${consent.cookieName}=${value}; expires=${expires}` +
            (consent.cookieDomain ? `; domain=${consent.cookieDomain}` : '') +
            '; path=/; sameSite=Lax';
    };

    getButtons(): NodeListOf<HTMLButtonElement> {
        return document.querySelectorAll('.cc-button');
    }

    getCheckboxes(): NodeListOf<HTMLInputElement> {
        return document.querySelectorAll('.cc-checkbox');
    }
}