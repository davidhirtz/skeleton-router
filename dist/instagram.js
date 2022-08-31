export default class Instagram {
    constructor(config) {
        const instagram = this;
        const request = new XMLHttpRequest();
        if (typeof config === 'string') {
            config = { url: config };
        }
        instagram.$container = config.$container || document.getElementById('instagram');
        instagram.maxItems = config.maxItems !== undefined ? config.maxItems : 6;
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
            if (!instagram.maxItems || i <= instagram.maxItems) {
                container.innerHTML += instagram.renderItem(instagram.items[i], i);
            }
        }
    }
    renderItem(item, key) {
        return `<div class="instagram-item instagram-${key}"><a href="${item.permalink}" rel="noopener" class="instagram-link" target="_blank"><img src="${item.media_url}" class="instagram-img" alt></a></div>`;
    }
}
