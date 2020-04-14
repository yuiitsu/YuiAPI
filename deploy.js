/**
 * Builder.js
 * @type {{}}
 */
const Fs = require('fs');
const Path = require('path');
const uglify = require('uglify-js');
const babel = require('babel-core');
const cheerio = require('cheerio');

// 发布文件夹
let distDir = 'dist';
// 排除文件夹或文件
// excludes.copy 不复制文件夹或文件列表
// excludes.mini 不压缩文件列表。需要目录文件相对根目录的全路径，如：./script/xx/xx.js
let excludes = {
    'copy': [
        '.gitignore',
        '.DS_Store',
        'deploy.js',
        'package.json',
        'package-lock.json',
        'README.md',
        '.git',
        '.idea',
        'node_modules',
        'dist'
    ],
    'mini': [
    ]
};

//
let App = {
    view: {
        /**
         * 继承
         * @param name
         * @param func
         */
        extend: function(name, func) {
            func.prototype = App;
            this[name] = new func();
        },

        /**
         * 创建View方法
         * @param model
         * @param name
         */
        buildViewContent: function(model, name) {
            let key = model + "." + name;
            if (!this.hasOwnProperty(key)) {
                let content = this[model][name](),
                    _html = [];
                let txt = ["App.view.extend('"+ model +"."+name+"', function() {"];
                txt.push("this.init = function(data) {");
                txt.push("var html = '';");
                content = content.split('\n');
                for (let i in content) {
                    _html.push(this.parse(content[i]));
                }
                txt.push(_html.join(""));
                txt.push("return html;");
                txt.push("}");
                txt.push("});");
                return txt.join('');
            }
        },

        /**
         * 解析模板
         * @param line 行代码
         */
        parse: function(line) {
            if (!line || line === '') {
                return null;
            }
            let result = line.trim().replace(new RegExp(/'/g), "\\'"),
                parseStatus = false;

            /**
             * 解析变量
             */
            let parseData = function() {

                let item,
                    patt = /\{\{ (.+?) \}\}/i;
                while (item = patt.exec(result)) {
                    result = result.replace(item[0], "'+" + item[1].replace(new RegExp(/\\/g), "") + "+'");
                }
            };

            /**
             * 解析定义
             */
            let parseVer = function() {
                let item,
                    patt = /\{\{ var (.+?) \}\}/i;
                while (item = patt.exec(result)) {
                    parseStatus = true;
                    result = result.replace(item[0], "var " + item[1].replace(new RegExp(/\\/g), "") + ";");
                }
            };

            /**
             * 解析条件
             */
            let parseCondition = function() {
                let item,
                    patt = /\{\{ if (.+?) \}\}/i;
                while (item = patt.exec(result)) {
                    parseStatus = true;
                    result = result.replace(item[0], "if("+ item[1].replace(new RegExp(/\\/g), "") +"){");
                }

                patt = /\{\{ else if (.+?) \}\}/i;
                while (item = patt.exec(result)) {
                    parseStatus = true;
                    result = result.replace(item[0], "} else if("+ item[1].replace(new RegExp(/\\/g), "") +"){");
                }

                patt = /\{\{ else \}\}/i;
                while (item = patt.exec(result)) {
                    parseStatus = true;
                    result = result.replace(item[0], "} else {");
                }
            };

            /**
             * 解析循环
             */
            let parseLoop = function() {
                let item,
                    patt = /\{\{ for (.+?) \}\}/i;
                while (item = patt.exec(result)) {
                    parseStatus = true;
                    result = result.replace(item[0], "for("+ item[1].replace(new RegExp(/\\/g), "") +"){");
                }
            };

            /**
             * 解析结束
             */
            let parseEnd = function() {
                let item,
                    patt = /\{\{ end \}\}/i;
                while (item = patt.exec(result)) {
                    parseStatus = true;
                    result = result.replace(item[0], "}");
                }
            };


            parseLoop();
            parseCondition();
            parseEnd();
            parseVer();
            parseData();

            if (!parseStatus) {
                result = "html += '" + result + "';";
            }

            return result;
        }
    }
};

(function() {
    /**
     * 清空目录
     * @param targetDir
     */
    let delDir = function (targetDir) {
        let paths = Fs.readdirSync(targetDir);
        if (paths) {
            paths.forEach(function (path) {
                let targetPath = targetDir + '/' + path,
                    stat = Fs.lstatSync(targetPath);

                if (stat.isFile()) {
                    // 如果是文件，直接删除
                    console.log('删除文件: ' + targetPath);
                    Fs.unlinkSync(targetPath);
                } else if (stat.isDirectory()) {
                    delDir(targetPath);
                }
            });
            Fs.rmdirSync(targetDir);
        }
    };

    /**
     * 压缩JS
     * @params sourceList 来源JS文件
     * @params target 输出目标JS
     */
    let jsMini = function (sourceList, target) {

        try {
            let r = babel.transformFileSync(sourceList, {presets: ['es2015']});
            let result = uglify.minify(r.code);
            Fs.writeFileSync(target, result['code'], 'utf8');
        } catch (e) {
            console.error(e);
        }
    };

    /**
     * 拷贝目录
     * @param sourceDir 源目录
     * @param targetDir 目标目录
     */
    let deploy = function (sourceDir, targetDir) {
        let paths = Fs.readdirSync(sourceDir);
        if (paths) {
            paths.forEach(function (path) {
                if (excludes.copy.indexOf(path) !== -1) {
                    return false;
                }
                let sourcePath = sourceDir + '/' + path,
                    targetPath = targetDir + '/' + path,
                    stat = Fs.lstatSync(sourcePath);

                if (stat.isFile()) {
                    let extName = Path.extname(sourcePath).slice(1);
                    let readable, writeable;
                    if (Fs.existsSync(targetDir)) {
                        if (!sourcePath.endsWith('view.js') && !sourcePath.endsWith('index.html') && !sourcePath.endsWith('manifest.json')) {
                            console.log('Copy file: ' + sourcePath + ' => ' + targetPath);
                            if (extName === 'js' && excludes.mini.indexOf(sourcePath) === -1) {
                                jsMini(sourcePath, targetPath);
                            } else {
                                readable = Fs.createReadStream(sourcePath);
                                writeable = Fs.createWriteStream(targetPath);
                                readable.pipe(writeable);
                            }
                        }
                    } else {
                        console.log('Mkdir: ' + targetDir);
                        Fs.mkdirSync(targetDir);
                        readable = Fs.createReadStream(sourcePath);
                        writeable = Fs.createWriteStream(targetPath);
                        readable.pipe(writeable);
                    }
                } else if (stat.isDirectory()) {

                    if (!Fs.existsSync(targetPath)) {
                        console.log('Mkdir: ' + targetPath);
                        Fs.mkdirSync(targetPath);
                    }
                    deploy(sourcePath, targetPath);
                }
            });
        }
    };

    let getStructure = function() {
        let indexText = Fs.readFileSync('index.html', 'utf-8'), 
            $ = cheerio.load(indexText), 
            views = [], 
            viewContents = [];
        //
        if (!$) {
            console.log('build index dom failed');
            return false;
        }
        $('head').find('script').each(function() {
            let modulePath = $(this).attr('src');
            if (modulePath.endsWith('view.js')) {
                views.push(modulePath);
            }
        });
        //
        for (var i = 0; i < views.length; i++) {
            let content = Fs.readFileSync(views[i], 'utf-8');
            eval(content);
        }
        //
        for (var module in App.view) {
            if (App.view.hasOwnProperty(module) && ['exend', 'buildViewContent', 'parse'].indexOf(module) === -1) {
                let ms = App.view[module];
                for (var name in ms) {
                    if (ms.hasOwnProperty(name)) {
                        let c = App.view.buildViewContent(module, name);
                        viewContents.push(c);
                    }
                }
            }
        }
        //
        return viewContents;
    };

    let buildView = function() {
        console.log('build view start...');
        let viewContents = getStructure();
        Fs.writeFileSync(distDir + '/scripts/view.js', viewContents.join(''), 'utf-8');
        console.log('build view sucess.');
    };

    let buildManifest = function() {
        console.log('build manifest.json start...');
        let f = Fs.readFileSync('manifest.json', 'utf-8');
        f = JSON.parse(f);
        //
        delete f.content_security_policy;
        //
        Fs.writeFileSync(distDir + '/manifest.json', JSON.stringify(f), 'utf-8');
        console.log('build manifest.json success.');
    };

    this.buildIndex = function() {
        console.log('build index.html start...');
        let indexText = Fs.readFileSync('index.html', 'utf-8'), 
            $ = cheerio.load(indexText);
        //
        if (!$) {
            console.log('build index dom failed');
            return false;
        }
        //
        $('head').find('script').each(function() {
            let modulePath = $(this).attr('src');
            if (modulePath.endsWith('view.js')) {
                $(this).remove();
            }
        });
        $('head').append('<script src="scripts/view.js" type="text/javascript"></script>');
        Fs.writeFileSync(distDir + '/index.html', $.html(), 'utf-8');
        console.log('build index.html success.');
    };

    (function() {
        console.log('Builder run.');
        //
        // check dir
        if (Fs.existsSync(distDir)) {
            //
            delDir(distDir);
        }

        Fs.mkdirSync(distDir);
        
        //
        deploy('.', './' + distDir);
        //
        buildView();
        //
        buildIndex();
        //
        buildManifest();
    })();
})();