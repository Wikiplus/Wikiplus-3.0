/**
 * Wikiplus-mmr
 */
import { Version } from './version'
import { Util } from './util'

export class ModuleManager {
    constructor() {
        //Load Config
        this.modulesConfig = Util.getLocalConfig('modules', true);
        if (this.modulesConfig == undefined) {
            this.modulesConfig = [];
        }
        this.modules = {};
        for (let moduleName of this.modulesConfig) {
            this.loadModule(moduleName);
        }
    }

    loadModule(moduleName) {
        let callbackName = "_wikiplus_mmr_cb" + (new Date().getTime());
        //主加载过程
        let self = this;
        
        //设置回调
        window[callbackName] = function (newModule) {
            self.loadModuleHelper(newModule, moduleName, self);
            delete window[callbackName];
        }
        
        //载入代码
        let jsurl = Version.scriptURL + "/backend/getmodule?name=" + moduleName + "&callback=" + callbackName;
        Util.loadJs(jsurl);
    }
    loadModuleHelper(newModule, moduleName, self) {
        let modules = self.modules;
        
        console.log("尝试读取模块 " + moduleName + " 基本信息。");
        if(newModule.manifest == undefined){
            console.error("无法解析模块。");
        }else if (newModule.manifest.name == moduleName) {
            console.log("加载 " + newModule.manifest.name + " 版本 " + newModule.manifest.version + "成功。");
            modules[moduleName] = newModule;
            console.log("正在分析所用依赖。");
            for (let dependencyName of newModule.manifest.dependencies) {
                if(self.modulesConfig.indexOf(dependencyName) == -1){
                    self.modulesConfig.push(dependencyName);
                    console.log("加载额外依赖：" + dependencyName);
                    self.loadModule(dependencyName);
                }
            }
        } else {
            console.error("载入模块失败：" + newModule.manifest.info);
        }
    }
}