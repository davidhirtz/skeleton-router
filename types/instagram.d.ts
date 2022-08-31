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
    maxItems?: number | boolean;
}
export default class Instagram {
    $container: HTMLElement;
    maxItems: number | boolean;
    items: FeedItem[];
    constructor(config: InstagramConfig | string);
    render(): void;
    renderItem(item: FeedItem, key: any): string;
}
export {};
