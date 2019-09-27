
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

var createVM = function (elem) {
    return new Vue({
        el: elem,
        data: {
            resources: true,
            input: "",
            items: [],
            ignore: null,
            type: ['sprite-frame'],
        },
        watch: {
            resources() {
                this.refresh();
            },
        },
        methods: {

            refresh() {
                let adb = Editor.assetdb;
                let self = this;
                let custIngnore = this.splitInput(this.input)

                this.items.length = 0;
                this.items = [];
                let callback = function (objs, results) {
                    objs.forEach(function (obj) {
                        if (self.ignore.prefab.indexOf(obj.url) != -1) {
                            return;
                        }

                        let json = null;
                        if (obj.type != 'bitmap-font') {
                            json = FFs.readJsonSync(obj.path);
                        }
                        else {
                            json = FFs.readFileSync(obj.path, 'utf-8');
                        }

                        results.forEach(function (result) {
                            if (result.url.indexOf('/default_') !== -1) {
                                result.contain = true;
                                return;
                            }

                            for (let i = 0; i < custIngnore.length; i++) {
                                if (result.url.indexOf(custIngnore[i]) !== -1) {
                                    result.contain = true;
                                    return;
                                }
                            }

                            if (
                                self.resources &&
                                result.url.indexOf('db://assets/resources') !== -1
                            ) {
                                result.contain = true;
                                return;
                            }
                            
                            if (
                                (typeof json) === 'string' &&
                                self.searchBf(json, result.url)
                            ) {
                                result.contain = true;
                                return;
                            }

                            if (
                                json['__type__'] === 'cc.AnimationClip' &&
                                self.searchClip(json, result.uuid)
                            ) {
                                result.contain = true;
                                return;
                            }


                            result.contain =
                                result.contain ?
                                    true :
                                    self.search(json, result.uuid);
                        });
                    });

                    results.forEach(function (result) {
                        result.contain == true ? '' : self.items.push({
                            url: result.url,
                            uuid: result.uuid
                        });
                    });
                };

                adb.queryAssets(
                    null,
                    ['scene', 'prefab', 'animation-clip', 'bitmap-font'],
                    function (err, objs) {
                        adb.queryAssets(
                            null,
                            self.type,
                            function (err, results) {
                                callback(objs, results);
                            }
                        );
                    }
                );
            },

            jumpRes(uuid) {
                Editor.Ipc.sendToAll('assets:hint', uuid);
                Editor.Selection.select('asset', uuid, true);
            },


            goHub() {
                cp.exec('start https://github.com/liushiniuniu/cocos_creator_plugin_file_name_check');
            },

            /**保存设置 */
            save() {
                Editor.log('保存自定义设置成功')
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
        // this.vm.refresh();
    },

    // ipc
    messages: {
        'scene:ready'() {
        }
    }
});