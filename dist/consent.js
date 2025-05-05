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
class Consent {
    constructor(config) {
        _Consent_instances.add(this);
        this.setCookie = function (remove) {
            const consent = this;
            const value = remove ? '' : [consent.version, ...consent.accepted].join(',');
            let expires = consent.expires;
            if (remove) {
                expires = 'Thu, 01 Jan 1970 00:00:01 GMT';
            }
            else if (!expires) {
                const date = new Date();
                date.setFullYear(date.getFullYear() + 1);
                expires = date.toUTCString();
            }
            doc.cookie = `${consent.cookieName}=${value}; expires=${expires}`
                + (consent.cookieDomain ? `; domain=${consent.cookieDomain}` : '')
                + '; path=/; sameSite=Lax';
        };
        const consent = this;
        Object.assign(consent, Object.assign({ categories: new Set(Object.values(categories)), container: doc.getElementById('cc'), cookieName: '_cc', modules: [], version: 'v1' }, config));
        consent.init();
    }
    init() {
        const consent = this;
        const categories = __classPrivateFieldGet(consent, _Consent_instances, "m", _Consent_saniziteCategories).call(consent, consent.getCookie());
        consent.accepted = categories.delete(consent.version) ? __classPrivateFieldGet(consent, _Consent_instances, "m", _Consent_saniziteCategories).call(consent, categories) : new Set();
        if (consent.accepted.size) {
            consent.loadModules(consent.accepted);
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
                const categories = $btn.dataset.consent === 'all'
                    ? consent.categories
                    : new Set($btn.dataset.consent.split(',').filter(v => v));
                if (!categories.size) {
                    consent.getCheckboxes().forEach(($check) => {
                        if ($check.checked) {
                            const newCategories = ($check.dataset.consent || '').split(',');
                            newCategories.forEach((category) => categories.add(category));
                        }
                    });
                }
                consent.setCategories(categories);
                e.preventDefault();
            };
        });
    }
    initContainer() {
        var _a;
        (_a = this.container) === null || _a === void 0 ? void 0 : _a.classList.add('active');
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
        var _a;
        const consent = this;
        consent.accepted = __classPrivateFieldGet(this, _Consent_instances, "m", _Consent_saniziteCategories).call(this, categories);
        consent.setCookie();
        consent.loadModules(consent.accepted);
        (_a = consent.container) === null || _a === void 0 ? void 0 : _a.classList.remove('active');
    }
    addCategories(categories) {
        const consent = this;
        const newCategories = new Set([...__classPrivateFieldGet(consent, _Consent_instances, "m", _Consent_saniziteCategories).call(consent, categories)].filter((category) => !consent.accepted.has(category)));
        if (newCategories) {
            newCategories.forEach((category) => consent.accepted.add(category));
        }
        consent.setCookie();
        consent.loadModules(newCategories);
    }
    hasCategory(category) {
        return this.accepted.has(category);
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
        return '';
    }
    ;
    getButtons() {
        return doc.querySelectorAll('button[data-consent]');
    }
    getCheckboxes() {
        return doc.querySelectorAll('input[data-consent]');
    }
}
_Consent_instances = new WeakSet(), _Consent_saniziteCategories = function _Consent_saniziteCategories(categories) {
    return new Set(typeof categories === 'string' ? categories.split(',') : categories);
};
export default Consent;
