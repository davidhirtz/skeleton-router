export interface ConsentModule {
    categories: Array<string>;
    load: () => void;
}

export const categories = {
    ANALYTICS: 'analytics',
    EXTERNAL: 'external',
    MARKETING: 'marketing',
}

const doc = document;
const accpetedCategories = new Set();

export default class Consent {
    categories: Array<string>;
    container: HTMLElement
    cookieDomain?: string;
    cookieName: string;
    expires?: string;
    modules: Array<ConsentModule>;

    constructor(config?: Object) {
        const consent = this;

        Object.assign(consent, {
            categories: [categories.ANALYTICS, categories.MARKETING, categories.EXTERNAL],
            container: doc.getElementById('cc'),
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
            $btn.onclick = (e) => {
                if ($btn.hasAttribute('data-consent')) {
                    consent.setCategories($btn.dataset.consent);
                } else {
                    let categories = [];

                    consent.getCheckboxes().forEach(($check: HTMLInputElement) => {
                        if ($check.checked && !$check.disabled) {
                            const newCategories: string[] = ($check.dataset.consent || '').split(',')

                            newCategories.forEach((category) => {
                                if (!categories.includes(category)) {
                                    categories.push(category);
                                }
                            })
                        }
                    });

                    consent.setCategories(categories ? categories.join(',') : null);
                }

                e.preventDefault();
            };
        });
    }

    initContainer() {
        if (this.container) {
            this.container.classList.add('active');
        }
    }

    loadModules(categories: Set<string> | string) {
        categories = this.#saniziteCategories(categories);

        this.modules.forEach((module) => {
            if (!module.categories || module.categories.every((category) => categories.has(category))) {
                module.load();
            }
        });
    }

    setCategories(categories: Set<string> | string) {
        const consent = this;
        categories = this.#saniziteCategories(categories);

        consent.setCookie(categories);
        consent.loadModules(categories);

        if (consent.container) {
            consent.container.classList.remove('active');
        }
    }

    addCategories(categories: Set<string> | string) {
        const newCategories = [...this.#saniziteCategories(categories)].filter((category) => !accpetedCategories.has(category));

        if (newCategories) {
            newCategories.forEach((category) => accpetedCategories.add(category));
        }
    }

    hasCategory(category: string) {
        const cookie = this.getCookie();
        return cookie && cookie.split(',').includes(category);
    }

    getCookie() {
        const cookies = doc.cookie
            ? doc.cookie.split('; ')
            : [];

        for (let i = 0; i < cookies.length; i++) {
            const params = cookies[i].split('=');

            if (params[0] === this.cookieName) {
                return params[1];
            }
        }

        return false;
    };

    setCookie = function (value: Set<string> | string, remove?: boolean) {
        const consent = this;
        let expires: string = consent.expires;

        if (remove) {
            expires = 'Thu, 01 Jan 1970 00:00:01 GMT';
            value = '';
        } else if (!expires) {
            const date = new Date();
            date.setFullYear(date.getFullYear() + 1);
            expires = date.toUTCString();
            value = [...value].join(',');
        }

        doc.cookie = `${consent.cookieName}=${value}; expires=${expires}`
            + (consent.cookieDomain ? `; domain=${consent.cookieDomain}` : '')
            + '; path=/; sameSite=Lax';
    };

    getButtons(): NodeListOf<HTMLButtonElement> {
        return doc.querySelectorAll('.cc-confirm');
    }

    getCheckboxes(): NodeListOf<HTMLInputElement> {
        return doc.querySelectorAll('.cc-checkbox');
    }

    #saniziteCategories(categories: Array<string> | Set<string> | string): Set<string> {
        return new Set(typeof categories === 'string' ? categories.split(',') : categories);
    }
}