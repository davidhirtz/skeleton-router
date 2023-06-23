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

// noinspection JSUnusedGlobalSymbols
export default class Instagram {
    $container: HTMLElement;
    maxItems: number | boolean;
    items: FeedItem[];
    linkCssClass: string;
    lazyload: boolean;

    constructor(config: InstagramConfig | string) {
        const instagram = this;
        const request = new XMLHttpRequest();

        if (typeof config === 'string') {
            config = {url: config};
        }

        Object.assign(instagram, {
            maxItems: 6,
            linkCssClass: 'instagram-link',
            lazyload: true,
            ...config
        });

        if (!config.$container) {
            config.$container = document.getElementById('instagram');
        }

        instagram.items = [];

        request.open('GET', config.url, true);
        request.onload = function () {
            instagram.items = JSON.parse(this.response).data;
            instagram.render();
        };

        request.send();
    }

    render(container?: HTMLElement) {
        const instagram = this;
        container = container || instagram.$container;

        for (let i = 0; i < instagram.items.length; i++) {
            if (typeof instagram.maxItems == 'boolean' || i < instagram.maxItems) {
                container.innerHTML += instagram.renderItem(instagram.items[i], i + 1);
            }
        }
    }

    renderItem(item: FeedItem, position: number) {
        const instagram = this;
        return `<div class="instagram-item instagram-${position}"><a href="${item.permalink}" rel="noopener" class="${instagram.linkCssClass}" target="_blank">${instagram.renderMedia(item)}</a></div>`;
    }

    renderMedia(item: FeedItem) {
        return item.media_type === 'VIDEO' ?
            `<video src="${item.media_url}" ${this.lazyload ? 'class="lazyload" preload="none" data-autoplay=""' : 'autoplay'} loop muted playsinline></video>` :
            `<img ${this.lazyload ? 'class="lazyload" data-src' : 'loading="lazy" src'}="${item.media_url}" alt="${item.caption}">`;
    }
}