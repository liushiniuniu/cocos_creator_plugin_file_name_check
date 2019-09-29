
"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path_1 = require("path");
const dirPath = path_1.join(Editor.projectPath, 'assets');

var ignoreDir = ['.svn', '.DS_Store', '.git'];
var ignorExtends = ['DS_Store', 'meta'];
var defaultReg =  '/^\w+$/';

/**
 *
 */
class NameCheck {

    static reset() {
        ignoreDir = ['.svn', '.DS_Store', '.git'];
        ignorExtends = ['DS_Store', 'meta'];
        defaultReg =  /^\w+$/;
        this.isInit = false;
        this.init();
    }

    static init() {
        if (!this.isInit) {
            this._getLocalSettings();
            this.isInit = true;
        }
    }

    static _getLocalSettings() {
        let panelPath = path_1.join(__dirname, 'panel');
        
        this._settings = JSON.parse( fs.readFileSync( path_1.join(panelPath, 'filter.json')) );
        ignorExtends = ignorExtends.concat( this._settings.ignor_extend_name_flies);
        ignoreDir = ignoreDir.concat( this._settings.ignor_dirs );
        if (this._settings.custom_regular.trim() == '') {
            defaultReg =  /^\w+$/;
            return;
        } else {
            defaultReg = eval (this._settings.custom_regular);
        }
    }

    /**
     * 查找文件
     * @param startPath
     */
    static findSync(startPath) {
        this.init();
        let result = [];
        function finder(path) {
            let files = fs.readdirSync(path);
            files.forEach((originFileName, index) => {
                let splitNames = originFileName.split('.');
                const fileName = splitNames[0];
                const extendName = splitNames[splitNames.length - 1];
                // 去掉 后缀名
                if (!NameCheck._isIgnoreDir(path)) {
                    let fPath = path_1.join(path, originFileName);
                    let stats = fs.statSync(fPath);
                    if (stats.isDirectory()) {
                        finder(fPath);
                    }
                    if (stats.isFile() && !NameCheck._isIgnorFilesByExtends(extendName)) {
                        NameCheck.isStandered(fileName, fPath);
                        result.push(fPath);
                    }
                }
            });
        }
        finder(startPath);
        return result;
    }
    /**
     * 文件名是否标准
     * @param fileName 文件名
     */
    static isStandered(fileName, filePath) {
        let result = defaultReg.test(fileName);
        result ? null : Editor.error('文件命名不规范，路径为： ', filePath);
        return result;
    }
    /**
     * 是否是忽略文件夹
     */
    static _isIgnoreDir(path) {
        for (let i = 0; i < ignoreDir.length; i++) {
            let curDir = ignoreDir[i];
            if (path.indexOf(curDir) != -1) {
                return true;
            }
        }
        return false;
    }
    /**
     * 判断是否是忽略的文件
     */
    static _isIgnorFilesByExtends(fileExtendName) {
        for (let i = 0; i < ignorExtends.length; i++) {
            if (fileExtendName == ignorExtends[i]) {
                return true;
            }
        }
        return false;
    }
}
exports.NameCheck = NameCheck;
