
const fs = require('fs');
const path = require('path');


class SaveCustomSetting {

    static save(newReg, dirs, extendNames) {
        if (newReg != null) {
            this._json.custom_regular = newReg;
        }

        if (dirs) {
            this._json.ignor_dirs = dirs;
        }

        if (extendNames) {
            this._json.ignor_extend_name_flies = extendNames;
        }

        this._save(this._json);
        
    }
    
    static init() {
        this._json = JSON.parse( fs.readFileSync( path.join(__dirname, 'filter.json')) );
    }
    
    static _save(data) {
        fs.writeFileSync(path.join(__dirname, 'filter.json'), JSON.stringify(data));
        
        Editor.info('保存自定义设置成功');
        Editor.Ipc.sendToPackage('file_name_check', 'save_setting_success');
    }

    static getIgnorDirStr() {
        if (this._json.length == 0) {
            return '';
        }

        let result = ''
        for (let i=0; i< this._json.ignor_dirs.length; i++) {
            result += this._json.ignor_dirs[i] + ','
        }
        return result.substr(0, result.length-1);
    }

    static getLocalReg() {
        return this._json.custom_regular;
    }

    static getLocalExtends() {
        if (this._json.length == 0) {
            return '';
        }

        let result = '';
        for (let i =0; i< this._json.ignor_extend_name_flies.length; i++) {
            result += this._json.ignor_extend_name_flies[i] + ',';
        }

        return result.substr(0, result.length-1);
    }

}

exports.SaveCustomSetting = SaveCustomSetting;