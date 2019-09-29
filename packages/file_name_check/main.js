'use strict';

const path_1 = require("path");
var NameCheckModule = null;
module.exports = {
  load () {
     NameCheckModule =  Editor.require("packages://file_name_check/name_check")

  },

  unload () {
    // 当 package 被正确卸载的时候执行
  },

  messages: {
    'check'() {
      this._check();
    },

    'asset-db:asset-changed' ()  {
      this._check();
    },

    'asset-db:assets-created' ()  {
        this._check();
    },

    'custom_set'() {
        Editor.Panel.open('file_name_check');
    },

    'save_setting_success'() {
        Editor.log('重新设置生效，开始重新检查...');
        NameCheckModule =  Editor.require("packages://file_name_check/name_check")
        NameCheckModule.NameCheck.reset();
        this._check();
    }

  },

  _check() {
      const dirPath = path_1.join(Editor.projectPath, 'assets');
      NameCheckModule.NameCheck.findSync(dirPath);
  }
};
