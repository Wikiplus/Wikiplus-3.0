/**
 * Mediawiki API Wrapper
 */
export class API{
	/**
	 * 返回当前页页面名。
	 */
	static getThisPageName(){
		return new Promise((resolve, reject) => {
			let pageName = window.mw.config.values.wgPageName;
			if(pageName == undefined){
				reject(new Error('Can not read this page title.'));
			}else{
				resolve(pageName);
			}
		});
	}
}