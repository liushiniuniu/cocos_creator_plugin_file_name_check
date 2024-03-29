
'use strict';

const Fs = require('fs');
const FFs = require('fire-fs');
const Path = require('path');
const cp = require('child_process');

var PATH = {
    html: Editor.url('packages://file_name_check/panel/index.html'),
    style: Editor.url('packages://file_name_check/panel/index.css'),
    ignore: Editor.url('packages://file_name_check/panel/filter.json')
};

var saveModule = Editor.require("packages://file_name_check/panel/save_custom_setting.js");
saveModule.SaveCustomSetting.init();

var createVM = function (elem) {
    return new Vue({
        el: elem,
        data: {
            input_reg: saveModule.SaveCustomSetting.getLocalReg(),
            input_dir: saveModule.SaveCustomSetting.getIgnorDirStr(),
            input_extend: saveModule.SaveCustomSetting.getLocalExtends(),
        },

        watch: {
            resources() {
                this.refresh();
            },
        },
        methods: {

            jumpRes(uuid) {
                Editor.Ipc.sendToAll('assets:hint', uuid);
                Editor.Selection.select('asset', uuid, true);
            },


            goHub() {
                cp.exec('start https://github.com/liushiniuniu/cocos_creator_plugin_file_name_check');
            },

            /**保存设置 */
            save() {
                if (this.input_dir.trim() == ""  && this.input_reg.trim() == "" && this.input_extend.trim() == "" ) {
                    Editor.log('无任何自定义，使用默认设置')
                }

                if (this.input_reg.trim() != '' && !this._isReg(this.input_reg.trim())) {
                    Editor.warn(`${this.input_reg}  为无效正则表达式，此项设置不生效`);
                    this.input_reg = '';
                }

                if (!saveModule) {
                    saveModule = Editor.require("packages://file_name_check/panel/save_custom_setting.js");
                }

                let dirs = this.input_dir.trim().split(',');
                let extendsStr = this.input_extend.trim().split(',');

                if (dirs.length == 1 && dirs[0] == '') {
                    dirs = [];
                }
                if (extendsStr.length == 1 && extendsStr[0] == '') {
                    extendsStr = [];
                }

                saveModule.SaveCustomSetting.save(this.input_reg.trim(), dirs, extendsStr);
            },

            _isReg(regStr) {
                var isreg;
                try {
                    isreg = eval(regStr) instanceof RegExp;
                } catch(e) {
                    isreg = false;
                }

                return isreg;
            }
        }
    });
};

Editor.Panel.extend({
    template: Fs.readFileSync(PATH.html, 'utf-8'),
    style: Fs.readFileSync(PATH.style, 'utf-8'),

    $: {
        'warp': '#warp'
    },

    ready() {
        this.vm = createVM(this.$warp);
        this.vm.ignore = FFs.readJsonSync(PATH.ignore);
    },

    // ipc
    messages: {
        'scene:ready'() {
        }
    }
});