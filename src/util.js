/**
 * Wikiplus util library
 */
export class Util {
	//Load css (jQuery required)
	static addCss(path) {
		$("head").append("<link>");
		$("head").children(":last").attr({
			rel: "stylesheet",
			type: "text/css",
			href: path
		});
	}
}