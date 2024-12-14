var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Consent_instances, _Consent_saniziteCategories;
export const categories = {
    ANALYTICS: 'analytics',
    EXTERNAL: 'external',
    MARKETING: 'marketing',
};
const doc = document;
const accpetedCategories = new Set();
class Consent {
    constructor(config) {
        _Consent_instances.add(this);
        this.setCookie = function (value, remove) {
            const consent = this;
            let expires = consent.expires;
            if (remove) {
                expires = 'Thu, 01 Jan 1970 00:00:01 GMT';
                value = '';
            }
            else if (!expires) {
                const date = new Date();
                date.setFullYear(date.getFullYear() + 1);
                expires = date.toUTCString();
                value = [...value].join(',');
            }
            doc.cookie = `${consent.cookieName}=${value}; expires=${expires}`
                + (consent.cookieDomain ? `; domain=${consent.cookieDomain}` : '')
                + '; path=/; sameSite=Lax';
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
        if (this.container) {
            this.container.classList.add('active');
        }
    }
    loadModules(categories) {
        categories = __classPrivateFieldGet(this, _Consent_instances, "m", _Consent_saniziteCategories).call(this, categories);
        this.modules.forEach((module) => {
            if (!module.categories || module.categories.every((category) => categories.has(category))) {
                module.load();
            }
        });
    }
    setCategories(categories) {
        const consent = this;
        categories = __classPrivateFieldGet(this, _Consent_instances, "m", _Consent_saniziteCategories).call(this, categories);
        consent.setCookie(categories);
        consent.loadModules(categories);
        if (consent.container) {
            consent.container.classList.remove('active');
        }
    }
    addCategories(categories) {
        const newCategories = [...__classPrivateFieldGet(this, _Consent_instances, "m", _Consent_saniziteCategories).call(this, categories)].filter((category) => !accpetedCategories.has(category));
        if (newCategories) {
            newCategories.forEach((category) => accpetedCategories.add(category));
        }
    }
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
_Consent_instances = new WeakSet(), _Consent_saniziteCategories = function _Consent_saniziteCategories(categories) {
    return new Set(typeof categories === 'string' ? categories.split(',') : categories);
};
export default Consent;
