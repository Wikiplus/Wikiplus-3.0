/**
 * i18n for Wikiplus-3.0
 */
import {Util} from './util'
import {Version} from './version'

export default function i18n(value = "", scope = "default") {
    let i18nData = window.Wikiplus.__i18nCache;

    if (i18nData === undefined) {
        return value;
    } else {
        let scopeKey = scope + "Scope";
        let i18nScope = i18nData[scopeKey];
        if (i18nScope === undefined) {
            console.warn("i18n: 未知的Scope");
            return value;
        } else if (i18nScope[value] === undefined) {
            console.debug("i18n: 找不到对应翻译", value, "@" + scope + "Scope");
            return value;
        } else {
            return i18nScope[value];
        }
    }
}

export class I18n {
    constructor(lang, async = true) {
        this.lang = lang;
        this.async = async;
    }

    initI18n() {
        let i18nCache = Util.getLocalConfig("i18nCache", true);
        if (i18nCache === undefined) {
            this.load();
        } else if (i18nCache.language != this.lang) {
            this.load();
        } else {
            window.Wikiplus.__i18nCache = i18nCache;
        }
    }

    load() {
        let ajaxConfig = {
            url: `${Version.scriptURL}/backend/lang`,
            type: "GET",
            data: {
                "lang": this.lang
            },
            dataType: "json",
            success: data=> {
                if (data.language == this.lang) {
                    Util.setLocalConfig("i18nCache", data, true);
                    this.initI18n();
                } else {
                    console.warn("i18n: 似乎是载入了错误的语言文件。");
                }
            },
            error: function () {
                console.warn("i18n: 找不到此语言对应的语言文件，");
            }
        };
        if (!this.async) {
            ajaxConfig.async = false; // TODO: 同步AJAX将导致浏览器卡顿
        }

        $.ajax(ajaxConfig);
    }
}