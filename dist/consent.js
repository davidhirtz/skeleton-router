const doc = document;
export const categories = {
    ANALYTICS: 'analytics',
    EXTERNAL: 'external',
    MARKETING: 'marketing',
};
export default class Consent {
    constructor(config) {
        this.setCookie = function (value, remove) {
            const consent = this;
            let expires = consent.expires;
            if (remove) {
                expires = 'Thu, 01 Jan 1970 00:00:01 GMT';
            }
            else if (!expires) {
                const date = new Date();
                date.setFullYear(date.getFullYear() + 1);
                expires = date.toUTCString();
            }
            doc.cookie = `${consent.cookieName}=${value}; expires=${expires}` +
                (consent.cookieDomain ? `; domain=${consent.cookieDomain}` : '') +
                '; path=/; sameSite=Lax';
        };
        const consent = this;
        Object.assign(consent, Object.assign({ categories: [categories.ANALYTICS, categories.MARKETING, categories.EXTERNAL], container: doc.getElementById('cc'), cookieName: '_cc', modules: [] }, config));
        consent.init();
    }
    init() {
        const consent = this;
        const categories = consent.getCookie();
        if (categories) {
            consent.loadModules(categories);
        }
        else {
            consent.initContainer();
        }
        consent.initButtons();
    }
    initButtons() {
        const consent = this;
        consent.getButtons().forEach(($btn) => {
            $btn.onclick = (e) => {
                if ($btn.hasAttribute('data-consent')) {
                    consent.setCategories($btn.dataset.consent);
                }
                else {
                    let categories = [];
                    consent.getCheckboxes().forEach(($check) => {
                        if ($check.checked && !$check.disabled) {
                            const newCategories = ($check.dataset.consent || '').split(',');
                            newCategories.forEach((category) => {
                                if (!categories.includes(category)) {
                                    categories.push(category);
                                }
                            });
                        }
                    });
                    consent.setCategories(categories ? categories.join(',') : null);
                }
                e.preventDefault();
            };
        });
    }
    initContainer() {
        const consent = this;
        if (consent.container) {
            consent.container.classList.add('active');
        }
    }
    loadModules(categories) {
        const consent = this;
        if (typeof categories === 'string') {
            categories = categories.split(',');
        }
        consent.modules.forEach((module) => {
            if (!module.categories || module.categories.every((category) => categories.includes(category))) {
                module.load();
            }
        });
    }
    setCategories(categories) {
        const consent = this;
        consent.setCookie(categories);
        consent.loadModules(categories);
        if (consent.container) {
            consent.container.classList.remove('active');
        }
    }
    // noinspection JSUnusedGlobalSymbols
    hasCategory(category) {
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
    }
    ;
    getButtons() {
        return doc.querySelectorAll('.cc-confirm');
    }
    getCheckboxes() {
        return doc.querySelectorAll('.cc-checkbox');
    }
}
