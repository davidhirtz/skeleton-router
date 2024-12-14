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

export default class Consent {
    accepted: Set<string>;
    categories: Set<string>;
    container: HTMLElement
    cookieDomain?: string;
    cookieName: string;
    expires?: string;
    modules: Array<ConsentModule>;
    version: string;

    constructor(config?: Object) {
        const consent = this;

        Object.assign(consent, {
            categories: new Set(Object.values(categories)),
            container: doc.getElementById('cc'),
            cookieName: '_cc',
            modules: [],
            version: 'v1',
            ...config
        });

        consent.init();
    }

    init() {
        const consent = this;
        const categories = consent.#saniziteCategories(consent.getCookie());

        consent.accepted = categories.delete(consent.version) ? consent.#saniziteCategories(categories) : new Set();

        if (consent.accepted.size) {
            consent.loadModules(consent.accepted);
        } else {
            consent.initContainer();
        }

        consent.initButtons();
    }

    initButtons() {
        const consent = this;

        consent.getButtons().forEach(($btn: HTMLButtonElement) => {
            $btn.onclick = (e) => {
                const categories = $btn.dataset.consent === 'all'
                    ? consent.categories
                    : new Set($btn.dataset.consent.split(',').filter(v => v));

                if (!categories.size) {
                    consent.getCheckboxes().forEach(($check: HTMLInputElement) => {
                        if ($check.checked) {
                            const newCategories: string[] = ($check.dataset.consent || '').split(',')
                            newCategories.forEach((category) => categories.add(category))
                        }
                    });
                }

                consent.setCategories(categories);

                e.preventDefault();
            };
        });
    }

    initContainer() {
        this.container?.classList.add('active');
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
        consent.accepted = this.#saniziteCategories(categories);

        consent.setCookie();
        consent.loadModules(consent.accepted);

        consent.container?.classList.remove('active');
    }

    addCategories(categories: Set<string> | string) {
        const consent = this;
        const newCategories = new Set([...consent.#saniziteCategories(categories)].filter((category) => !consent.accepted.has(category)));

        if (newCategories) {
            newCategories.forEach((category) => consent.accepted.add(category));
        }

        consent.setCookie();
        consent.loadModules(newCategories);
    }

    hasCategory(category: string) {
        return this.accepted.has(category);
    }

    getCookie(): string {
        const cookies = doc.cookie
            ? doc.cookie.split('; ')
            : [];

        for (let i = 0; i < cookies.length; i++) {
            const params = cookies[i].split('=');

            if (params[0] === this.cookieName) {
                return params[1];
            }
        }

        return '';
    };

    setCookie = function (remove?: boolean) {
        const consent = this;
        const value: string = remove ? '' : [consent.version,...consent.accepted].join(',');

        let expires: string = consent.expires;

        if (remove) {
            expires = 'Thu, 01 Jan 1970 00:00:01 GMT';
        } else if (!expires) {
            const date = new Date();
            date.setFullYear(date.getFullYear() + 1);
            expires = date.toUTCString();
        }

        doc.cookie = `${consent.cookieName}=${value}; expires=${expires}`
            + (consent.cookieDomain ? `; domain=${consent.cookieDomain}` : '')
            + '; path=/; sameSite=Lax';
    };

    getButtons(): NodeListOf<HTMLButtonElement> {
        return doc.querySelectorAll('button[data-consent]');
    }

    getCheckboxes(): NodeListOf<HTMLInputElement> {
        return doc.querySelectorAll('input[data-consent]');
    }

    #saniziteCategories(categories: Array<string> | Set<string> | string): Set<string> {
        return new Set(typeof categories === 'string' ? categories.split(',') : categories);
    }
}