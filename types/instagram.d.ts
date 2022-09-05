interface FeedItem {
    id: string;
    caption: string;
    media_url: string;
    permalink: string;
    media_type: string;
}
interface InstagramConfig {
    url: string;
    $container?: HTMLElement;
    lazyload?: boolean;
    linkCssClass?: string;
    maxItems?: number | boolean;
}
export default class Instagram {
    $container: HTMLElement;
    maxItems: number | boolean;
    items: FeedItem[];
    linkCssClass: string;
    lazyload: boolean;
    constructor(config: InstagramConfig | string);
    render(container?: HTMLElement): void;
    renderItem(item: FeedItem, position: number): string;
    renderMedia(item: FeedItem): string;
}
export {};
