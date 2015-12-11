/**
 * Wikiplus util library
 */
export class Util {
	//Load css (jQuery required)
	static loadCss(path) {
		$("head").append("<link>");
		$("head").children(":last").attr({
			rel: "stylesheet",
			type: "text/css",
			href: path
		});
	}
	//save local config
	static setLocalConfig(key, value, isObj = false){
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