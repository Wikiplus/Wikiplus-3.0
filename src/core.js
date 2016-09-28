/* global mw */
/**
 * Wikiplus Core
 */
import _ from './i18n'
import {Version} from './version'
import {Util} from './util'
import {UI} from './ui'
import {ModuleManager} from './moduleManager'

import {API} from './api'
import {Wikipage} from './Wikipage'
import {I18n} from './i18n'
import {Log} from './log'

export class Wikiplus {
    //初始化
    constructor(notice) {
        this.UI = UI;
        this.Util = Util;
        this.Version = Version;
        this.notice = notice;
        this.API = API;
        this.Wikipage = Wikipage;
        this.coreConfig = new CoreConfig(this.notice);
        this.Log = new Log();

        console.log(`Wikiplus-3.0 v${Version.VERSION}`);
        Util.scopeConfigInit();
        Util.loadCss(Version.scriptURL + "/Wikiplus.css");
    }

    start() {
        //检查更新
        this.checkInstall();
        //载入模块
        this.mmr = new ModuleManager();
        this.loadCoreFunctions();
        this.notice.create.success(_("Test Run"));
    }

    checkInstall() {
        let self = this;
        let isInstall = this.coreConfig.isInstall;
        if (isInstall === "True") {
            //加载并初始化i18n
            let i18n = new I18n(this.coreConfig.language);
            i18n.initi18n();
            //Updated Case
            if (this.coreConfig.Version !== Version.VERSION) {
                this.notice.create.success("Wikiplus-3.0 v" + Version.VERSION);
                this.notice.create.success(Version.releaseNote);
                this.coreConfig.Version = Version.VERSION;
                //检查语言更新
                i18n.load();
            }
        } else {
            //首次加载并初始化i18n（使用系统语言）
            let i18n = new I18n(window.navigator.language.toLowerCase(), false);
            i18n.initi18n();
            //安装
            let install = function () {
                self.coreConfig.isInstall = 'True';
                self.coreConfig.Version = Version.VERSION;
                self.coreConfig.StartUseAt = '' + new Date().valueOf();
                self.coreConfig.StartEditCount = mw.config.values.wgUserEditCount;
                self.coreConfig.language = window.navigator.language.toLowerCase();
                self.notice.create.success(_('Wikiplus installed, enjoy it'));
            };

            this.coreConfig.loadConfigHelper().then(data=> {
                delete data["updatetime"];
                this.coreConfig.saveConfigToLocal(data);
                install();
            }).catch(err=> {
                UI.createDialog({
                    title: _('Install Wikiplus'),
                    info: _('Do you allow WikiPlus to collect insensitive data to help us develop WikiPlus and improve suggestion to this site: $1 ?').seti18n(mw.config.values.wgSiteName),
                    mode: [
                        {id: "Yes", text: _("Yes"), res: true},
                        {id: "No", text: _("No"), res: false}
                    ]
                }).then(res => {
                    console.log("用户选择：" + (res ? "接受" : "拒绝"));
                    this.coreConfig.SendStatistics = res ? "True" : "False";
                    install();
                });
            });
        }
    }

    /**
     * 初始化快速编辑
     */
    initQuickEdit(){
        // 分析网页链接
        if (!(mw.config.values.wgIsArticle && mw.config.values.wgAction === "view" && mw.config.values.wgIsProbablyEditable)) {
            console.log('该页面无法编辑 快速编辑界面加载终止');
            return false;
        }
        this.generateQuickEditButtons();
    }

    /**
     * 生成快速编辑按钮
     */
    generateQuickEditButtons(){
        // 顶部按钮
        let self = this;
        let topBtn = $('<li>').attr('id', 'Wikiplus-Edit-TopBtn').append(
            $('<span>').append(
                $('<a>').attr('href', 'javascript:void(0)').text(`${_('QuickEdit')}`)
            )
        ).data({
            sectionNumber: -1,
            target: this.API.getThisPageName(),
        }).addClass('Wikiplus-QuickEdit-Entrance');

        if ($('#ca-edit').length > 0 && $('#Wikiplus-Edit-TopBtn').length == 0) {
            $('#ca-edit').before(topBtn);
        }

        // 段落按钮
        if ($('.mw-editsection').length > 0) {
            //段落快速编辑按钮
            var sectionBtn = $('<span>').append(
                $('<span>').attr('id', 'mw-editsection-bracket').text('[')
            ).append(
                $('<a>').addClass('Wikiplus-Edit-SectionBtn').attr('href', 'javascript:void(0)').text(_('QuickEdit'))
            ).append(
                $('<span>').attr('id', 'mw-editsection-bracket').text(']')
            );
            $('.mw-editsection').each(function (i) {
                try {
                    let editURL = $(this).find("a").last().attr('href');
                    // Attention: RegExp Magic. DO NOT MODIFY UNLESS YOU HAVE THOUGHT CAREFULLY.
                    // 注意：此处的正则表达式经过了长期的实践检验，请不要轻易更改除非你已经深思熟虑。
                    let sectionNumber = editURL.match(/&[ve]*section\=([^&]+)/)[1].replace(/T-/ig, '');
                    let sectionTargetName = decodeURI(editURL.match(/title=(.+?)&/)[1]);

                    let cloneNode = $(this).prev().clone();
                    cloneNode.find('.mw-headline-number').remove();
                    let sectionName = $.trim(cloneNode.text());
                    let _sectionBtn = sectionBtn.clone();
                    _sectionBtn.find('.Wikiplus-Edit-SectionBtn').data({
                        sectionNumber: sectionNumber,
                        sectionName: sectionName,
                        target: sectionTargetName
                    }).addClass('Wikiplus-QuickEdit-Entrance');
                    $(this).append(_sectionBtn);
                }
                catch (e) {
                    self.Log.error('fail_to_init_quickedit');
                }
            });
        }

        this.bindQuickEditEvents();
    }

    /**
     * 绑定QuickEdit入口事件
     */
    bindQuickEditEvents(){
        let self = this;
        $('.Wikiplus-QuickEdit-Entrance').click(function(){
            self.generateQuickEditUI({
                "editSettings": $(this).data()
            });
        })
    }

    /**
     * 向页面插入Wikiplus快速编辑界面
     */
    generateQuickEditUI(options = {}){
        let title = options.title || _('QuickEdit');
        let summary = options.summary || _('default_summary');

        let backBtn = $('<span>').attr('id', 'Wikiplus-Quickedit-Back').addClass('Wikiplus-Btn').text(`${_('back')}`);//返回按钮
        let jumpBtn = $('<span>').attr('id', 'Wikiplus-Quickedit-Jump').addClass('Wikiplus-Btn').append(
            $('<a>').attr('href', '#Wikiplus-Quickedit').text(`${_('goto_editbox')}`)
        );//到编辑框
        let inputBox = $('<textarea>').attr('id', 'Wikiplus-Quickedit');//主编辑框
        let previewBox = $('<div>').attr('id', 'Wikiplus-Quickedit-Preview-Output');//预览输出
        let summaryBox = $('<input>').attr('id', 'Wikiplus-Quickedit-Summary-Input').attr('placeholder', `${_('summary_placehold')}`).val(summary);//编辑摘要输入
        let editSubmitBtn = $('<button>').attr('id', 'Wikiplus-Quickedit-Submit').text(`${_('submit')}(Ctrl+S)`);//提交按钮
        let previewSubmitBtn = $('<button>').attr('id', 'Wikiplus-Quickedit-Preview-Submit').text(`${_('preview')}`);//预览按钮
        let isMinorEdit = $('<div>').append(
            $('<input>').attr({ 'type': 'checkbox', 'id': 'Wikiplus-Quickedit-MinorEdit' })
        )
            .append(
                $('<label>').attr('for', 'Wikiplus-Quickedit-MinorEdit').text(`${_('mark_minoredit')}(Ctrl+Shift+S)`)
            )
            .css({ 'margin': '5px 5px 5px -3px', 'display': 'inline' });
        //DOM定义结束
        let editBody = $('<div>').append(backBtn, jumpBtn, previewBox, inputBox, summaryBox, $('<br>'), isMinorEdit, editSubmitBtn, previewSubmitBtn);

        this.UI.createBox({
            "title": title,
            "content": editBody,
            "width": 1000,
            "callback": ()=>{
            }
        })
    }


    loadCoreFunctions() {
        this.coreConfig.init();
        this.initQuickEdit();
    }
}

class CoreConfig {
    constructor(notice) {
        this.notice = notice;
    }

    init() {
        if (API.getThisPageName().substr(5) == API.getUsername()) {
            UI.addLinkInToolbox({
                name: _("Wikiplus Config"),
                title: _("Configurations for global Wikiplus."),
                callback: () => {
                    this.drawConfigBox();
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
        let modulesConfig = Util.getLocalConfig("modules", true);
        if (modulesConfig === undefined) {
            modulesConfig = [];
        }
        let modulesInput = $(`<textarea id="wikiplus-config-it-modules"></textarea>`)
            .val(modulesConfig.join(", "));
        boxContent.append(
            $(`<p><b>${_("Loaded Modules") }</b>:<br>${_("Type comma-saparated module names here.") }</p>`)
                .append(modulesInput)
        );

        //从服务器恢复设置
        let loadConfigBtn = $(`<input type="button" id="wikiplus-config-btn-loadconfig" value="${_("Load Config") }">`)
        loadConfigBtn.click(() => {
            this.notice.create.success(_("Checking if had configuration on this wiki."));
            this.loadConfig();
        });
        boxContent.append($("<hr>"))
            .append($(`<p><b>${_("Load Config from server") }</b>: </p>`).append(loadConfigBtn));

        //保存和取消按钮
        boxContent.append(
            $(`<hr><p>${_("Your configuration will save at User:$1/Wikiplus-config.json on this wiki.")
                .seti18n(API.getUsername()) }</p>`)
        );
        let saveConfigBtn = $(`<input type="button" id="wikiplus-config-btn-save" class="Wikiplus-InterBox-Btn" value="${_("Save") }">`);
        let cancelConfigBtn = $(`<input type="button" id="wikiplus-config-btn-cancel" class="Wikiplus-InterBox-Btn" value="${_("Cancel") }">`);
        cancelConfigBtn.click(() => {
            UI.closeBox();
        });
        saveConfigBtn.click(() => {
            let config = {};
            config['language'] = languageInput.val();
            config['SendStatistics'] = statInput.find("input")[0].checked ? "True" : "False";
            config['modules'] = modulesInput.val().split(',').map(i=> $.trim(i));

            this.saveConfig(config);
        });

        boxContent.append(cancelConfigBtn).append(saveConfigBtn);

        //显示对话框
        UI.createBox({
            title: _("Wikiplus Config"),
            content: boxContent
        })
    }

    saveConfig(config) {
        //保存至本地
        this.saveConfigToLocal(config);
        //保存至本Wiki的User:当前用户名/Wikiplus-config.json页面
        config["updatetime"] = (new Date()).getTime();
        let configString = JSON.stringify(config);
        let configPage = new Wikipage(`User:${API.getUsername() }/Wikiplus-config.json`);
        configPage.setContent({content: configString, summary: "Update Config via Wikiplus"}).then(data=> {
            this.notice.create.success(_("Save config to Server successfully."));
            UI.closeBox();
        }).catch(e=> {
            this.notice.create.error(_("Save config to Server failed."));
        })
    }

    saveConfigToLocal(config) {
        for (let confKey of config) {
            if (CoreConfig.objectiveConfig[confKey]) {
                Util.setLocalConfig(confKey, config[confKey], true);
            } else {
                Util.setLocalConfig(confKey, config[confKey], false);
            }
        }
        this.notice.create.success(_("Save config to local successfully."));
    }

    loadConfig() {
        this.loadConfigHelper().then(config=> {
            UI.createDialog({
                info: _("Find a uploaded configuration of $1. Do you want to import this config now?").seti18n((new Date(config.updatetime).toLocaleString())),
                title: _("Confirm Import"),
                mode: [
                    {id: "Yes", text: _("Yes"), res: true},
                    {id: "No", text: _("No"), res: false}
                ]
            }).then(res=> {
                if (res) {
                    delete config["updatetime"];
                    this.saveConfigToLocal(config);
                }
                UI.closeBox();
            });
        }).catch(res=> {
            let errorInfo = "";
            switch (res) {
                case "invaild":
                case "cannotparse":
                    errorInfo = _("Saved configuration on server is invaild.");
                    break;
                case "empty":
                    errorInfo = _("Can not find any configuration for you on this wiki.");
                    break;
            }
            this.notice.create.error(errorInfo);
        });
    }

    loadConfigHelper() {
        return new Promise((res, rej) => {
            let configPage = new Wikipage(`User:${API.getUsername() }/Wikiplus-config.json`);
            configPage.getWikiText().then(data=> {
                if (data) {
                    try {
                        let config = JSON.parse(data);
                        if (config.updatetime) {
                            res(config);
                        } else {
                            rej("invaild");
                        }
                    } catch (err) {
                        rej("cannotparse");
                    }
                } else {
                    rej("empty");
                }
            }).catch(err => {
                rej("empty");
            })
        });
    }

    get isInstall() {
        return Util.getLocalConfig('isInstall');
    }

    set isInstall(value) {
        Util.setLocalConfig('isInstall', value);
    }

    get Version() {
        return Util.getLocalConfig('Version');
    }

    set Version(value) {
        Util.setLocalConfig('Version', value);
    }

    get language() {
        return Util.getLocalConfig('language');
    }

    set language(value) {
        Util.setLocalConfig('language', value);
    }

    get StartUseAt() {
        return Util.getLocalConfig('StartUseAt');
    }

    set StartUseAt(value) {
        Util.setLocalConfig('StartUseAt', value);
    }

    get StartEditCount() {
        return Util.getLocalConfig('StartEditCount');
    }

    set StartEditCount(value) {
        Util.setLocalConfig('StartEditCount', value);
    }

    get SendStatistics() {
        return Util.getLocalConfig('SendStatistics');
    }

    set SendStatistics(value) {
        Util.setLocalConfig('SendStatistics', value);
    }

    get modules() {
        return Util.getLocalConfig('modules', true);
    }

    set modules(object) {
        Util.setLocalConfig('modules', object, true);
    }
}
//需要对象化存入的设置项列表，未设置或设置值为false的将以字符串形式存取。
CoreConfig.objectiveConfig = {
    "modules": true
};