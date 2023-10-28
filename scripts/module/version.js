/**
 * 版本更新记录
 * Created by Yuiitsu on 2018/05/22.
 */
const Version = {
    //
    current_version: 'v1.3.0',

    /**
     * 更新记录
     */
    update_logs: {
        'v2.0.0': [
            'You can now log in with your github account. Turn on sync and the historical data will be saved to the cloud and shared across multiple computers or browsers. Supports Chrome / Firefox / Edge.'
        ],
        'v1.3.0': [
            'Added tabbar'
        ],
        'v1.2.2': [
            'Fixed some bugs.'
        ],
        'v1.2.1': [
            'Fixed some bugs.'
        ],
        'v1.2.0': [
            'Support Manifest v3'
        ],
        'v1.1.17': [
            'Now you can convert a request to cURL.'
        ],
        'v1.1.16': [
            'Fixed some bugs.'
        ],
        'v1.1.15': [
            'Fixed some bugs.'
        ],
        'v1.1.14': [
            'Fixed some bugs.'
        ],
        'v1.1.13': [
            'Removed unused permissions: tabs.'
        ],
        'v1.1.12': [
            'Fixed some bugs.'
        ],
        'v1.1.11': [
            'Fixed some bugs.'
        ],
        'v1.1.10': [
            'Fixed some bugs.'
        ],
        'v1.1.9': [
            'Fixed blob data display error.'
        ],
        'v1.1.8': [
            'Added PATCH request method.'
        ],
        'v1.1.7': [
            'Fixed some ui bugs.'
        ],
        'v1.1.6': [
            'Fixed some bugs.'
        ],
        'v1.1.5': [
            'Added tools module',
            'Moved JSON parse into tools',
            'Added unicode parse tool',
            'Removed the eval method during template parsing.'
        ],
        'v1.1.1': [
            'Fixed missing groupid when sending a request',
            'Adjusted UI.',
            'Added light theme.',
            // 'Added github login'
        ],
        'v1.0.5': [
            'Fixed some bugs.'
        ],
        'v1.0.4': [
            'Fixed some bugs.'
        ],
        'v1.0.3': [
            'Fixed headers bug.'
        ],
        'v1.0.2': [
            'Fixed flex bug.'
        ],
        'v1.0.1': [
            'Added copy response body. <a href="https://github.com/yuiitsu/YuiAPI/wiki/Copy-response-body" target="_blank">view usage</a>',
            'Added JSON handler to format JSON string. <a href="https://github.com/yuiitsu/YuiAPI/wiki/Format-JSON-string" target="_blank">view usage</a>'
        ],
        'v1.0.0': [
            'Rebuild UI'
        ],
        'v0.10.0': [
            'Added code theme.',
            'Added code folding.',
            'Adjusted history tab.'
        ],
        'v0.9.5': [
            'Fixed some bugs.'
        ],
        'v0.9.4': [
            'Fixed some bugs.'
        ],
        'v0.9.3': [
            'Fixed headers content-type does not work.'
        ],
        'v0.9.2': [
            'Fixed display error when the response type is img.'
        ],
        'v0.9.1': [
            'Adjusted history tab.'
        ],
        'v0.9.0': [
            'Supported history tab.'
        ],
        'v0.8.1': [
            'Fixed an issue that request data display error when the request headers not in request data.'
        ],
        'v0.8.0': [
            'Added Authentication and url params edit',
            'Adjusted UI'
        ],
        'v0.7.0': [
            'Adjusted UI',
            'Added new function, Edit Parameter',
        ],
        'v0.6.0':[
            'Added a second format.',
            'Delete the record while deleting the host.',
            'Fixed some bugs.'
        ],
        'v0.5.1': ['Fixed some bugs'],
        'v0.5.0': [
            'Adjusted UI',
            'Fixed some bugs.',
            'Added format and raw type for response data.'
        ],
        'v0.4.0': [
            'Fixed an issue that response could not display when the the http status was not 200',
            'Fixed an issue that request headers not saved',
            'Fixed an issue that response could not display when the response data was img blob.'
        ],
        'v0.3.0': [
            //'Added api test from group or host',
            'Added drag the history to group and sort.',
            'Fixed an issue that the raw data failed to be saved.',
            'Fixed some bugs.'
        ],
        'v0.2.1': [
            'Adjusted UI',
            'Improved operation mode of grouping',
            'Added cookies manager',
            'Added history move up/down',
            'Fixed an issue that the request content type not executed correctly when selecting the raw type.'
        ],
        'v0.2.0': [
            'Adjusted UI',
            'Added deletion of history host',
            'Improved operation mode of grouping',
            'Fixed some bugs'
        ],
        'v0.1.1': [
            'Adjusted UI',
            'Added display when the response content_type is img',
            'Added display when the response content_type is xml',
            'Added history group',
        ],
        'v0.1.0': [
            'fixed an issue that the json data display error in arguments'
        ],
        'v0.0.5': [
            'Adjusted UI',
            'Added form-data request',
            'Added upload file function',
            'Added the record of the response headers',
            'Added the description to request arguments',
            'fixed an issue that the form could not be changed when selecting the history record',
            'fixed an issue that the response could not display when the http status was not 200',
        ]
    },

    /**
     * 检查版本，如果缓存中的版本与当前版本不匹配，显示当前版本对应的更新记录
     */
    check: function() {
        let version = localStorage.getItem('version');
        if (version !== this.current_version) {
            // 将新版本号写入缓存
            localStorage.setItem('version', this.current_version);
            // 显示更新记录
            App.module.common.module('Update log', App.view.getView('setting', 'version_update_logs', {
                list:this.update_logs[this.current_version],
                current_version: this.current_version
            }), '<button class="btn btn-primary module-close js-handler">Close</button>');
        }
    }
};

$(function() {
    Version.check();
});
