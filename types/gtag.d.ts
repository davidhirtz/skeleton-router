import { ConsentModule } from './consent.js';
declare global {
    interface Window {
        dataLayer: any;
    }
}
/**
 * Google Analytics module.
 */
export default class Gtag implements ConsentModule {
    categories: Array<string>;
    _isActive: boolean;
    id: Array<string> | null;
    gtag: Gtag.Gtag;
    constructor(id?: any);
    enable(): void;
    disable(): void;
    isActive(): string[];
    load(): void;
    sendPageView(options?: Object): void;
}
//# sourceMappingURL=gtag.d.ts.map