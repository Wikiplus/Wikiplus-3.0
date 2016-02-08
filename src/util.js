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
	static setLocalConfig(key, value = "", isObj = false){
		key = "Wikiplus-" + key;
		if(isObj){
			localStorage[key] = JSON.stringify(value);
		} else {
			localStorage[key] = value;
		}
	}
	//get local config
	static getLocalConfig(key, isObj = false){
		key = "Wikiplus-" + key;
		if(isObj){
			return JSON.parse(localStorage[key]);
		} else {
			return localStorage[key];
		}
	}
}