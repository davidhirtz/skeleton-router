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
    buttons: Array<HTMLElement>;
    categories: Array<string>;
    container: HTMLElement
    cookieDomain?: string;
    cookieName: string;
    defaultValue: string;
    modules: Array<ConsentModule>;

    constructor(config?: Object) {
        const consent = this;

        Object.assign(consent, {
            buttons: document.querySelectorAll('.cc-button'),
            categories: [categories.ANALYTICS, categories.MARKETING, categories.SOCIAL],
            container: document.getElementById('cc'),
            cookieName: '_cc',
            defaultValue: 'none',
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

        if (consent.buttons) {
            consent.buttons.forEach((button) => {
                button.addEventListener('click', (e) => {
                    consent.setCategories(button.dataset.consent || consent.defaultValue);
                    e.preventDefault();
                });
            });
        }
    }

    initContainer() {
        const consent = this;
        consent.container.classList.add('active');
    }

    loadModules(categories) {
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

    setCategories(categories) {
        const consent = this;

        consent.setCookie(categories);
        consent.loadModules(categories);

        consent.container.classList.remove('active');
    }

    getCookie() {
        const cookies = document.cookie ? document.cookie.split('; ') : [];

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
        let expires = 'Thu, 01 Jan 1970 00:00:01 GMT';

        if (!remove) {
            const date = new Date();
            date.setFullYear(date.getFullYear() + 1);
            expires = date.toUTCString();
        }

        document.cookie = `${consent.cookieName}=${value}; expires=${expires}` +
            (consent.cookieDomain ? `; domain=${consent.cookieDomain}` : '') +
            '; path=/; sameSite=Lax';
    };
}