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
    loadCoreFunctions() {
        let coreConfig = new CoreConfig();
        coreConfig.init();
    }
}

class CoreConfig {
    init() {
        let self = this;

        if (API.getThisPageName().substr(5) == API.getUsername()) {
            UI.addLinkInToolbox({
                name: _("Wikiplus Config"),
                title: _("Configurations for global Wikiplus."),
                callback: function () {
                    self.drawConfigBox();
                }
            })
        }
    }
    drawConfigBox() {
        let boxContent = $(`<div id="wikiplus-config-area"><p>${_("You could change Wikiplus settings here. These settings will work on the whole Wiki.") }</p><br></div>`);
        
        //语言设置
        let languageInput = $(`<input type="text" id="wikiplus-config-it-language">`).val(Util.getLocalConfig("language"));
        boxContent.append($(`<p><b>${_("Language") }</b>: </p>`).append(languageInput));
        
        //是否发送统计信息
        let statInput = $(`<label><input type="radio" id="wikiplus-config-ir-stat" value="true" name="wikiplus-config-stat">${_("Allow") }</label>`);
        let noStatInput = $(`<label><input name="wikiplus-config-stat" value="false" type="radio" id="wikiplus-config-ir-nostat">${_("Disallow") }</label>`);
        if (Util.getLocalConfig("SendStatistics") == "True") {
            statInput.find("input")[0].checked = true;
            noStatInput.find("input")[0].checked = false;
        } else {
            statInput.find("input")[0].checked = false;
            noStatInput.find("input")[0].checked = true;
        }
        boxContent.append($(`<p><b>${_("Send Statistics") }</b>: </p>`).append(statInput).append(noStatInput));
        
        //需载入的模块
        let modulesInput = $(`<textarea id="wikiplus-config-it-modules"></textarea>`)
            .val(Util.getLocalConfig("modules", true).join(", "));
        boxContent.append(
            $(`<p><b>${_("Loaded Modules") }</b>:<br>${_("Type comma \",\" saparated module names here.") }</p>`)
            .append(modulesInput)
        );
        
        //从服务器恢复设置
        let loadConfigBtn = $(`<input type="button" id="wikiplus-config-btn-loadconfig" value="${_("Load Config")}">`)
        boxContent.append($("<hr>"))
            .append($(`<p><b>${_("Load Config from server")}</b>: </p>`).append(loadConfigBtn));
        
        //保存和取消按钮
        boxContent.append(
            $(`<hr><p>${_("Your configuration will save at User:$1/Wikiplus-config.json on this wiki.")
                .seti18n(API.getUsername())}</p>`)
        );
        let saveConfigBtn = $(`<input type="button" id="wikiplus-config-btn-save" class="Wikiplus-InterBox-Btn" value="${_("Save")}">`);
        let cancelConfigBtn = $(`<input type="button" id="wikiplus-config-btn-cancel" class="Wikiplus-InterBox-Btn" value="${_("Cancel")}">`);
        cancelConfigBtn.click(function(){
            UI.closeBox();
        });
        
        boxContent.append(cancelConfigBtn).append(saveConfigBtn);
        
        //显示对话框
        UI.createBox({
            title: _("Wikiplus Config"),
            content: boxContent
        })
    }
}