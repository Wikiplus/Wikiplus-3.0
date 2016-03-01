/* global mw */
/**
 * Wikiplus Core
 */
import _ from './i18n'
import { Version } from './version'
import { Util } from './util'
import { UI } from './ui'
import { ModuleManager } from './moduleManager'

import { API } from './api'
import { Wikipage } from './Wikipage'

export class Wikiplus {
	//初始化
	constructor(notice) {
        this.UI = UI;
        this.Util = Util;
        this.Version = Version;
        this.notice = notice;
		this.API = API;
		this.Wikipage = Wikipage;
        
        console.log(`Wikiplus-3.0 v${Version.VERSION}`);
        Util.scopeConfigInit();
		Util.loadCss(Version.scriptURL + "/Wikiplus.css");
		this.checkInstall();
	}
	start() {
        this.mmr = new ModuleManager();
        this.loadCoreFunctions();
		this.notice.create.success(_("Test Run"));
	}
	checkInstall() {
		let self = this;
		let isInstall = Util.getLocalConfig('isInstall');
		if (isInstall === "True") {
			//Updated Case
			if (Util.getLocalConfig('Version') !== Version.VERSION) {
				this.notice.create.success("Wikiplus-3.0 v" + Version.VERSION);
				this.notice.create.success(Version.releaseNote);
				Util.setLocalConfig('Version', Version.VERSION);
			}
		} else {
			//安装
			let install = function () {
				Util.setLocalConfig('isInstall', 'True');
				Util.setLocalConfig('Version', Version.VERSION);
				Util.setLocalConfig('StartUseAt', '' + new Date().valueOf());
				Util.setLocalConfig('StartEditCount', mw.config.values.wgUserEditCount);
				self.notice.create.success(_('Wikiplus installed, enjoy it'));
			};

			UI.createDialog({
				title: _('Install Wikiplus'),
				info: _('Do you allow WikiPlus to collect insensitive data to help us develop WikiPlus and improve suggestion to this site: $1 ?').replace(/\$1/ig, mw.config.values.wgSiteName),
				mode: [
					{ id: "Yes", text: _("Yes"), res: true },
					{ id: "No", text: _("No"), res: false }
				]
			}).then(res => {
				console.log("用户选择：" + (res ? "接受" : "拒绝"));
				Util.setLocalConfig('SendStatistics', res ? "True" : "False");
				install();
			});
		}
	}
    loadCoreFunctions(){
        let coreConfig = new CoreConfig();
        coreConfig.init();
    }
}

class CoreConfig{
    init(){
        let self = this;
        
        if(API.getThisPageName().substr(5) == API.getUsername()){
            UI.addLinkInToolbox({
                name: _("Wikiplus Config"),
                title: _("Configurations for global Wikiplus."),
                callback: function(){
                    self.drawConfigBox();
                }
            })
        }
    }
    drawConfigBox(){
        UI.createBox({
            title: _("Wikiplus Config"),
            content: $(`<div id="wikiplus-config-area"><p>${_("You could change Wikiplus settings here. These settings will work on the whole Wiki.")}</p><br></div>`)
                .append($(`<p><b>${_("Language")}</b>: <input type="text" id="wikiplus-config-it-language"></p>`))
                .append($(`<p><b>${_("Send Statistics")}</b>: <label><input type="radio" id="wikiplus-config-ir-stat" value="true" name="wikiplus-config-stat">${_("Allow")}</label><label><input name="wikiplus-config-stat" value="false" type="radio" id="wikiplus-config-ir-nostat">${_("Disallow")}</label></p>`))
                .append($(`<p><b>${_("Loaded Modules")}</b>:</p><p>${_("Type comma \",\" saparated module names here.")}</p><textarea id="wikiplus-config-it-modules"></textarea>`)),
            callback: function(){
                console.log("~Test")
            }
        })
    }
}