import Consent, {categories} from '../src/consent';

const clearCookies = () => document.cookie.split(";").forEach(c => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

const setBodyHtml = () =>
    document.body.innerHTML = `<div id="cc"></div>`
        + `<button id="all" data-consent="all"></button>`
        + `<button id="selected" data-consent="external,analytics"></button>`
        + `<button id="none" data-consent="none"></button>`
        + `<button id="checkboxes" data-consent=""></button>`
        + `<input type="checkbox" id="external" data-consent="external">`
        + `<input type="checkbox" id="analytics" data-consent="analytics">`;

describe('Consent module', () => {
    it('Load config', () => {
        const consent = new Consent({
            categories: [categories.ANALYTICS],
        });

        expect(consent.categories).toEqual([categories.ANALYTICS]);
        expect(consent.hasCategory(categories.ANALYTICS)).toBe(false);
        expect(consent.container).toBe(null);
    });

    it('Set categories directly', () => {
        const consent = new Consent();
        consent.setCategories(categories.ANALYTICS);

        expect(consent.hasCategory(categories.ANALYTICS)).toBe(true);
        expect(consent.accepted.size).toBe(1);
        expect(consent.getCookie()).toBe(consent.version + ',' + categories.ANALYTICS);

        expect(consent.hasCategory(categories.EXTERNAL)).toBe(false);

        consent.addCategories(categories.EXTERNAL + ',' + categories.ANALYTICS);

        expect(consent.hasCategory(categories.EXTERNAL)).toBe(true);
        expect(consent.accepted.size).toBe(2);
        expect(consent.getCookie()).toBe(consent.version + ',' + categories.ANALYTICS + ',' + categories.EXTERNAL);
    });

    it('Verify version', () => {
        let analyticsCount = 0;

        const consent = new Consent({
            modules: [
                {
                    load: () => analyticsCount++,
                    categories: [categories.ANALYTICS],
                },
            ],
            version: 'v2',
        });

        expect(analyticsCount).toBe(0);
        expect(consent.accepted.size).toBe(0);

    });

    it('Run modules', () => {
        let analyticsCount = 0;
        let externalCount = 0;

        new Consent({
            modules: [
                {
                    load: () => analyticsCount++,
                    categories: [categories.ANALYTICS],
                },
            ],
        });

        expect(analyticsCount).toBe(1);

        clearCookies();

        const consent = new Consent({
            modules: [
                {
                    load: () => analyticsCount++,
                    categories: [categories.ANALYTICS],
                },
                {
                    load: () => externalCount++,
                    categories: [categories.EXTERNAL],
                },
            ],
        });

        consent.setCategories(categories.ANALYTICS);

        expect(analyticsCount).toBe(2);
        expect(externalCount).toBe(0);

        consent.addCategories(categories.EXTERNAL + ',' + categories.ANALYTICS);

        expect(analyticsCount).toBe(2);
        expect(externalCount).toBe(1);
    });

    it('Click "accept all" button', () => {
        clearCookies();
        setBodyHtml();

        const consent = new Consent();
        expect(consent.accepted.size).toBe(0);

        expect(document.getElementById('cc').classList).toContain('active');

        document.getElementById('all').click();

        expect(consent.accepted.size).toBe(3);
        expect(consent.getCookie()).toBe(consent.version + ',' + Object.values(categories).join(','));
        expect(document.getElementById('cc').classList).not.toContain('active');
    });

    it('Click "none" and "selected" button', () => {
        clearCookies();
        setBodyHtml();

        let analyticsLoaded = false;

        const consent = new Consent({
            modules: [
                {
                    load: () => analyticsLoaded = true,
                    categories: [categories.ANALYTICS],
                },
            ],
        });

        expect(document.getElementById('cc').classList).toContain('active');

        document.getElementById('none').click();

        expect(consent.accepted.size).toBe(1);
        expect(analyticsLoaded).toBe(false);

        expect(document.getElementById('cc').classList).not.toContain('active');

        document.getElementById('selected').click();

        expect(consent.accepted.size).toBe(2);
        expect(analyticsLoaded).toBe(true);
    });

    it('Click "checkboxes" button', () => {
        clearCookies();
        setBodyHtml();

        let analyticsLoaded = false;

        const consent = new Consent({
            modules: [
                {
                    load: () => analyticsLoaded = true,
                    categories: [categories.ANALYTICS],
                },
            ],
        });

        expect(document.getElementById('cc').classList).toContain('active');

        const $submit = document.getElementById('checkboxes');
        $submit.click();

        expect(consent.accepted.size).toBe(0);
        expect(analyticsLoaded).toBe(false);

        (document.getElementById('analytics') as HTMLInputElement).checked = true;
        $submit.click();

        expect(consent.accepted.size).toBe(1);
        expect(analyticsLoaded).toBe(true);
    });
});