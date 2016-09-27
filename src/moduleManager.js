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
        
        if(newModule.manifest == undefined){
            console.error("无法解析模块 " + moduleName);
        }else if (newModule.manifest.name == moduleName) {
            console.log("加载 " + newModule.manifest.name + " 版本 " + newModule.manifest.version + " 成功。");
            modules[moduleName] = newModule;
            for (let dependencyName of newModule.manifest.dependencies) {
                if(self.modulesConfig.indexOf(dependencyName) == -1){
                    self.modulesConfig.push(dependencyName);
                    console.log(`准备加载${moduleName}的额外依赖: ${dependencyName}`);
                    self.loadModule(dependencyName);
                }
            }
            this.modulesInit();
        } else {
            console.error("载入模块失败：" + moduleName);
        }
    }
    modulesInit(){
        for(let moduleName in this.modules){
            let module = this.modules[moduleName];
            
            if(module['__wikiplus_mmr_init_status'] == 'loaded' || module['__wikiplus_mmr_init_status'] == 'skipped'){
                continue;
            }
            
            console.log("初始化模块: " + moduleName);
            //检查依赖
            let dpdOk = true;
            let dpds = {};
            for(let dpdName of module.manifest.dependencies){
                if(this.modules[dpdName] == undefined){
                    dpdOk = false;
                    break;
                }else{
                    dpds[dpdName] = this.modules[dpdName];
                }
            }
            if(dpdOk){
                if(module.init(module, dpds)){
                    console.log(`模块${moduleName}初始化成功。`);
                    module['__wikiplus_mmr_init_status'] = 'loaded';
                }else{
                    console.log(`模块${moduleName}认为它自己不应该被初始化。`);
                    module['__wikiplus_mmr_init_status'] = 'skipped';
                }
            }else{
                console.log(`模块${moduleName}依赖不满足，等待下次再初始化。`)
            }
        }
    }
}