/**
 * Wikiplus util library
 */
export class Util {
    //Load css (jQuery required)
    static loadCss(path) {
        var cssNode = document.createElement('link');
        $(cssNode).attr({
            rel: "stylesheet",
            type: "text/css",
            href: path
        })
        $("head").append(cssNode);
    }

    //Load js (jQuery required)
    static loadJs(path) {
        var jsnode = document.createElement('script');
        $(jsnode).attr({
            type: 'text/javascript',
            async: false,
            src: path
        })
        $("head").append(jsnode);
    }

    //save local config
    static setLocalConfig(key, value = "", isObj = false) {
        key = "Wikiplus-" + key;
        if (isObj) {
            localStorage[key] = JSON.stringify(value);
        } else {
            localStorage[key] = value;
        }
    }

    //get local config
    static getLocalConfig(key, isObj = false) {
        try {
            key = "Wikiplus-" + key;
            if (isObj) {
                return JSON.parse(localStorage[key]);
            } else {
                return localStorage[key];
            }
        }
        catch (e) {
            return undefined;
        }
    }

    //Run once at Wikiplus init.
    static scopeConfigInit() {
        String.prototype.seti18n = function () {
            let argc = arguments.length;
            let res = this;
            for (let i = 1; i <= argc && i <= 9; i++) {
                res = res.replace(new RegExp("\\$" + i, "g"), arguments[i - 1]);
            }
            return res;
        }
    }
}