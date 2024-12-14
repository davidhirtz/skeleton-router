import Consent from '../src/consent';

describe('Consent module', () => {
    it('should load correct config', () => {
        const consent = new Consent({
            categories: ['analytics'],
        });

        expect(consent.categories).toEqual(['analytics']);
    });
});