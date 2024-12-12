import { ConsentModule } from './consent.js';
declare global {
    interface Window {
        dataLayer: any;
        gtag: Gtag.Gtag;
    }
}
export default class Gtag implements ConsentModule {
    _active: boolean;
    categories: Array<string>;
    consent: boolean;
    tags: Array<string> | null;
    options: Object;
    constructor(tags?: string[] | string | null, config?: Object);
    enable(): void;
    disable(): void;
    isActive(): string[];
    load(): void;
    init(): void;
}
//# sourceMappingURL=gtag.d.ts.map