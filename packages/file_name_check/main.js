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
      let curProjectPath = null;
      let mainVersion =   this._getCocosCreatorMainVersion();
      if (mainVersion === 1) {
        curProjectPath = Editor.projectInfo.path;
      }

      if (mainVersion === 2) {
        curProjectPath = Editor.Project.path;
      }
      
      if (!curProjectPath) {
        Editor.error('没获取到项目路径');
      }

      const dirPath = path_1.join(curProjectPath, 'assets');
      NameCheckModule.NameCheck.findSync(dirPath);
  },

  /**获取cocos creator 主版本号 */
  _getCocosCreatorMainVersion() {
    let versionStr = Editor.App.version;
    let arr = versionStr.split('.');
    if (arr[0] == '1') {
      return 1;
    }

    if (arr[0] == '2') {
      return 2;
    }

  }
};
