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

    constructor(config: InstagramConfig | string) {
        const instagram = this;
        const request = new XMLHttpRequest();

        if (typeof config === 'string') {
            config = {url: config};
        }

        instagram.$container = config.$container || document.getElementById('instagram');
        instagram.maxItems = config.maxItems !== undefined ? config.maxItems : 6

        instagram.items = [];

        request.open('GET', config.url, true);
        request.onload = function () {
            instagram.items = JSON.parse(this.response).data;
            instagram.render();
        };

        request.send();
    }

    render() {
        const instagram = this;

        for (let i = 0; i < instagram.items.length; i++) {
            if (!instagram.maxItems || i <= instagram.maxItems) {
                instagram.$container.innerHTML += instagram.renderItem(instagram.items[i], i);
            }
        }
    }

    renderItem(item: FeedItem, key) {
        return `<div class="instagram-item instagram-${key}"><a href="${item.permalink}" rel="noopener" class="instagram-link" target="_blank"><img src="${item.media_url}" class="instagram-img" alt></a></div>`;
    }
}