module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    function arrayunique(arr1) {
        arr1.sort(); //先排序
        var res = [arr1[0]];
        for (var i = 1; i < arr1.length; i++) {
            if (arr1[i] !== res[res.length - 1]) {
                res.push(arr1[i]);
            }
        }
        return res;
    }

    function objLength(obj1) {
        var len = 0;
        for (var key in obj1) {
            len++;
        }
        return len;
    }

    var banner_tmpl = grunt.file.read('./banner.part');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        babel: {
            options: {
                sourceMap: false,
                presets: ['es2015']
            },
            dist: {
                files: {
                    'dist/version.js': 'src/version.js',
                    'dist/main.js': 'src/main.js',
                    'dist/core.js': 'src/core.js',
                    'dist/moenotice.js': 'src/moenotice.js',
                    'dist/util.js': 'src/util.js',
                    'dist/ui.js': 'src/ui.js',
                    'dist/i18n.js': 'src/i18n.js',
                    'dist/api.js': 'src/api.js',
                    'dist/moduleManager.js': 'src/moduleManager.js',
                    'dist/Wikipage.js': 'src/Wikipage.js',
                    'dist/log.js': 'src/log.js'
                }
            }
        },
        browserify: {
            options: {
                banner: banner_tmpl
            },
            dist: {
                src: "dist/main.js",
                dest: "./Wikiplus.js"
            }
        },
        uglify: {
            options: {
                banner: banner_tmpl
            },
            dist: {
                files: {
                    './Wikiplus.min.js': './Wikiplus.js'
                }
            }
        },
        watch: {
            dist: {
                files: ['./src/*.js'],
                tasks: ['babel', 'browserify', 'uglify'],
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('build', ['babel', 'browserify', 'uglify']);

    grunt.registerTask('gi18n', 'generate i18n basic language files.', function () {
        grunt.log.writeln("正在扫描整个src文件夹中的js文件。");
        var i18nCount = 0;
        var defaultScope = [];
        var Scopes = {};
        grunt.file.recurse('./src/', function (abspath) {
            grunt.log.subhead("正在扫描：" + abspath);
            var sourceContent = grunt.file.read(abspath);
            var loopIndex = 0;
            while (true) {
                //查询下一“_(”位置
                var i = sourceContent.indexOf("_(", loopIndex);
                if (i < 0) {
                    break;
                }

                grunt.log.debug(i);
                var restr = "";
                var j = i + 2;
                var vaild = true; //有效性
                var jchar; //单字符缓存
                var stringBorder;
                //查找字符串边界。
                while (true) {
                    jchar = sourceContent[j];
                    if (jchar == '\'') {
                        stringBorder = '\'';
                        break;
                    }
                    if (jchar == '"') {
                        stringBorder = '"';
                        break;
                    }
                    if (jchar != ' ' && jchar != '\t' && jchar != '\n') {
                        vaild = false;
                        break;
                    }
                    j++;
                }

                //遇到无效字符，直接进入下一轮查找
                if (!vaild) {
                    loopIndex = i + 1;
                    grunt.log.debug("Invaild p1");
                    continue;
                }

                //查找第一参数
                j++;
                while (sourceContent[j] != stringBorder[0]) {
                    restr += sourceContent[j];
                    j++;
                }

                //查找下一个分界符
                j++;
                var nextType = '';
                while (true) {
                    jchar = sourceContent[j];
                    //default scope
                    if (jchar == ')') {
                        nextType = "end";
                        break;
                    }
                    if (jchar == ',') {
                        nextType = "scope";
                        break;
                    }
                    if (jchar != ' ' && jchar != '\t' && jchar != '\n') {
                        nextType = "invaild";
                        break;
                    }
                    j++;
                }

                grunt.log.debug(nextType);
                //判断分界符情况
                if (nextType == "end") {
                    defaultScope.push(restr);
                    grunt.log.writeln("defaultScope$$" + restr);
                    i18nCount++;
                } else if (nextType == "invaild") {
                    loopIndex = i + 1;
                    continue;
                } else if (nextType == "scope") {
                    //找下个边界。
                    vaild = true;
                    j++;
                    while (true) {
                        jchar = sourceContent[j];
                        if (jchar == '\'') {
                            stringBorder = '\'';
                            break;
                        }
                        if (jchar == '"') {
                            stringBorder = '"';
                            break;
                        }
                        if (jchar != ' ' && jchar != '\t' && jchar != '\n') {
                            grunt.log.debug("---Invaild Char: " + jchar);
                            vaild = false;
                            break;
                        }
                        j++;
                    }

                    //遇到无效字符，continue
                    if (!vaild) {
                        grunt.log.debug("Invaild p2");
                        loopIndex = i + 1;
                        continue;
                    }

                    //查找第二参数
                    j++;
                    var scopeStr = "";
                    while (sourceContent[j] != stringBorder[0]) {
                        scopeStr += sourceContent[j];
                        j++;
                    }

                    //查找函数结束
                    while (sourceContent[j] != ')') j++;
                    if (Scopes[scopeStr] == undefined) {
                        Scopes[scopeStr] = [];
                    }
                    Scopes[scopeStr].push(restr);
                    grunt.log.writeln(scopeStr + "Scope$$" + restr);
                    i18nCount++;
                } else {
                    grunt.log.error("真是见鬼了。");
                }
                loopIndex = i + 1;
            }
        });

        //整理文件
        grunt.log.ok("共找到 " + i18nCount + " 个i18n引用。");
        //排序去重
        defaultScope = arrayunique(defaultScope);
        var scopeCount = 0; //scope计数
        var scope;
        for (scope in Scopes) {
            Scopes[scope] = arrayunique(Scopes[scope]);
            scopeCount++;
        }

        //生成
        var languageDefaultContent = {};
        languageDefaultContent.language = "default";
        languageDefaultContent.update_time = grunt.template.today("yyyy-mm-dd HH:MM:ss");
        languageDefaultContent.defaultScope = {};
        for (var stri in defaultScope) {
            languageDefaultContent.defaultScope[defaultScope[stri]] = "<Translate Here>";
        }
        for (scope in Scopes) {
            var scopeTemp = {};
            for (var strj in Scopes[scope]) {
                scopeTemp[Scopes[scope][strj]] = "<Translate Here>";
            }
            languageDefaultContent[scope + "Scope"] = scopeTemp;
        }

        //格式化工厂
        function formatLanguageFile(languageContent) {
            var formattedContent = '{\n' +
                '    "language": "' + languageContent.language + '",\n' +
                '    "update_time": "' + languageContent.update_time + '",\n';

            var scopeLength = objLength(languageContent) - 2;
            var scopeCount = 0;
            for (var scopeName in languageContent) {
                if (scopeName.substr(-5) == "Scope") {
                    formattedContent += '    "' + scopeName + '": {\n';
                    var thisScope = languageContent[scopeName];
                    var thisScopeLength = objLength(thisScope);
                    var stri = 0;
                    for (var strKey in thisScope) {
                        formattedContent += '       "' + strKey + '":';
                        if (stri != thisScopeLength - 1) {
                            formattedContent += '"' + thisScope[strKey] + '",\n';
                        } else {
                            formattedContent += '"' + thisScope[strKey] + '"\n';
                        }
                        stri++;
                    }
                    if (scopeCount != scopeLength - 1) {
                        formattedContent += '    },\n';
                    } else {
                        formattedContent += '    }\n';
                    }
                    scopeCount++;
                }
            }
            formattedContent += "}";

            return formattedContent;
        }

        grunt.log.subhead("开始写入语言文件：");
        //扫描所有已存在的语言文件
        grunt.file.recurse('./backend/languages/', function (abspath) {
            var languageFileContent = grunt.file.read(abspath);
            var languageContent = JSON.parse(languageFileContent);
            var mergedContent = {};
            mergedContent.language = languageContent.language;
            mergedContent.update_time = grunt.template.today("yyyy-mm-dd HH:MM:ss");
            for (var scope in languageDefaultContent) {
                if (scope.substr(-5) == "Scope") {
                    var thisScope = languageDefaultContent[scope];
                    mergedContent[scope] = {};
                    for (var str in thisScope) {
                        var translatedStr = "<Translate Here>";
                        if (languageContent[scope] != undefined && languageContent[scope][str] != undefined) {
                            translatedStr = languageContent[scope][str];
                        }
                        mergedContent[scope][str] = translatedStr;
                    }
                }
            }
            grunt.file.write(abspath, formatLanguageFile(mergedContent));
            grunt.log.writeln("更新文件：" + languageContent.language + ".json");
        });

        //强制更新default
        grunt.file.write("backend/languages/default.json", formatLanguageFile(languageDefaultContent));
        grunt.log.ok("Done.");
    });
};