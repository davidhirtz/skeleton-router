// noinspection JSUnusedGlobalSymbols
export default class Instagram {
    constructor(config) {
        const instagram = this;
        const request = new XMLHttpRequest();
        if (typeof config === 'string') {
            config = { url: config };
        }
        Object.assign(instagram, Object.assign({ maxItems: 6, linkCssClass: 'instagram-link', lazyload: true }, config));
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
    render(container) {
        const instagram = this;
        container = container || instagram.$container;
        for (let i = 0; i < instagram.items.length; i++) {
            if (!instagram.maxItems || i < instagram.maxItems) {
                container.innerHTML += instagram.renderItem(instagram.items[i], i + 1);
            }
        }
    }
    renderItem(item, position) {
        const instagram = this;
        return `<div class="instagram-item instagram-${position}"><a href="${item.permalink}" rel="noopener" class="${instagram.linkCssClass}" target="_blank">${instagram.renderMedia(item)}</a></div>`;
    }
    renderMedia(item) {
        const src = this.lazyload ? 'class="lazyload" data-src' : 'src';
        return item.media_type === 'VIDEO' ?
            `<video ${src}="${item.media_url}" autoplay loop muted playsinline></video>` :
            `<img ${src}="${item.media_url}" alt="${item.caption}">`;
    }
}
