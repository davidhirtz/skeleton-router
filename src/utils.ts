/**
 * Loads a script by adding it to the DOM.
 */
export function loadScript(src, callback) {
    interface Script extends HTMLScriptElement {
        onreadystatechange?: GlobalEventHandlers['onload'];
        readyState?: string;
    }

    let script: Script = document.createElement('script'),
        prior = document.getElementsByTagName('script')[0];

    script.async = true;

    script.onload = script.onreadystatechange = () => {
        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
            script.onload = script.onreadystatechange = null;
            script = undefined;

            callback && setTimeout(callback, 0);
        }
    };

    script.src = src;
    prior.parentNode.insertBefore(script, prior);
}