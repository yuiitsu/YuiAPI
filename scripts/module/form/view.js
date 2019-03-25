/**
 * 表单View
 * Created by Yuiitsu on 2018/05/22.
 */
App.view.extend('form', function() {

    /**
     * 
     */
    this.form_api_name_line = function() {
        return `
            <div class="tab-line">
                <div class="api-name-line display-inline">
                    {{ var api_name = data['name'] ? data['name'] : '' }}
                    <input type="text" class="input-text" placeholder="Enter API Name" id="api-name" value="{{ api_name }}" />
                    <div class="form-group-selector group-selector" id="group-selector">
                    {{ App.group.get_select_view() }}
                    </div>
                </div>
            </div>
        `;
    };

    this.form_api_url_line = function() {
        return `
            <div class="form-line">
                <div class="request-type-box display-inline vertical-middle">
                    {{ var type_list = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }}
                    {{ var type = data['type'] ? data['type'] : '' }}
                    <select id="request-type">
                        {{ for var i in type_list }}
                        {{ var selected = type_list[i] === type ? 'selected="selected"' : '' }}
                        <option value="{{ type_list[i] }}" {{ selected }}>{{ type_list[i] }}</option>
                        {{ end }}
                    </select>
                </div>
                <div class="url-box vertical-middle">
                    {{ var api_url = data['url'] ? data['url'] : '' }}
                    <input type="text" id="url" class="input-text" placeholder="Enter API URL" value="{{ api_url }}" />
                    <i class="mdi mdi-format-list-bulleted font-color-dark" id="host-select" title="host history"></i>
                </div>
                <div class="display-inline request-button vertical-middle">
                    <button id="send" class="btn btn-primary">Send</button>
                </div>
            </div>
        `;
    };

    this.headers_layout = function() {
        return `
            <div class="form-headers-title js-form-headers-title">
                <!-- 检查headers/authentication/params是否有值，如果有显示提示icon -->
                <!-- 处理默认headers的显示，如果有request_headers时，显示headers表单 -->
                {{ var headers_line_type = data['headers_line_type'] }}
                {{ var request_headers = data['request_headers'] }}
                {{ if request_headers && Object.keys(request_headers).length > 0 }}
                    {{ var headers_body_hide = 'show' }}
                    {{ var has_headers = true }}
                {{ else }}
                    {{ var headers_body_hide = headers_line_type ? '' : 'hide' }}
                {{ end }}
                <!-- 检查authentication是否有值，有显示icon -->
                {{ var authentication = data['authentication'] }}
                {{ if authentication && authentication['type'] }}
                    {{ var has_authentication = true }}
                {{ end }}
                <!-- 检查params是否有值，有显示icon -->
                {{ var params = data['url_params'] }}
                {{ if params && params.list && params.list.length > 0 }}
                    {{ var has_params = true }}
                {{ end }}
                <!-- headers/authentication/params -->
                {{ var view_name = headers_line_type ? 'headers_' + headers_line_type.toLowerCase() : 'headers_headers' }}
                {{ var types = ['Headers', 'Authentication', 'Params'] }}
                {{ for var i in types }}
                {{ var class_focus = headers_line_type && types[i] === headers_line_type ? 'focus' : '' }}
                <span class="{{ class_focus }}">
                    {{ types[i] }}
                    {{ if (types[i] === 'Headers' && has_headers) || (types[i] === 'Authentication' && has_authentication) || (types[i] === 'Params' && has_params) }}
                    <i class="form-headers-line-type-icon"></i>
                    {{ end }}
                </span>
                {{ if i < types.length - 1 }}
                | 
                {{ end }}
                {{ end }}
            </div>
            <div class="form-headers-body {{ headers_body_hide }}">
                {{ this.get_view('form', view_name, data) }}
            </div>
        `;
    };

    this.headers_headers = function() {
        return `
            <table class="form-data-table" cellspacing="0" id="js-form-headers-body">
                <thead>
                    <tr>
                        <td><input type="checkbox" class="form-select-all" checked="checked" /></td>
                        <td>Key</td>
                        <td>Value</td>
                        <td>Description</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody id="form-data-headers" class="form-data-input">
                    {{ this.get_view('form', 'form_header_line', data['request_headers']) }}
                </tbody>
            </table>
        `;
    };

    this.headers_authentication = function() {
        return `
            {{ var type = data['authentication'] && data['authentication']['type'] ? data['authentication']['type'] : '' }}
            <table cellspacing="0" id="js-form-authentication">
                <thead>
                    <tr>
                        <td>Type</td>
                        <td>
                            <select id="js-form-authentication-type-selector">
                                {{ var type_list = ['None', 'Basic'] }}
                                {{ for var i in type_list }}
                                {{ var value = type_list[i] === 'None' ? '' : type_list[i] }}
                                {{ var selected = value === type ? 'selected="selected"' : '' }}
                                <option class="{{ value }}" {{ selected }}>{{ type_list[i] }}</option>
                                {{ end }}
                            </select>
                        </td>
                    </tr>
                </thead>
                {{ var basic_hide = type === 'Basic' ? '' : 'hide' }}
                {{ var user = data['authentication'] && data['authentication']['data']['user'] ? data['authentication']['data']['user'] : '' }}
                {{ var pass = data['authentication'] && data['authentication']['data']['pass'] ? data['authentication']['data']['pass'] : '' }}
                <tbody data-type="Basic" class="{{ basic_hide }}" id="js-form-authentication-basic">
                    <tr>
                        <td>User</td>
                        <td><input type="text" class="input-text" data-type="user" value="{{ user }}" /></td>
                    </tr>
                    <tr>
                        <td>Pass</td>
                        <td><input type="password" class="input-text" data-type="pass" value="{{ pass }}" /></td>
                    </tr>
                </tbody>
            </table>
        `;
    };

    /**
     * url params, not headers params
     */
    this.headers_params = function() {
        return `
            <table class="form-data-table" cellspacing="0" id="js-form-url-params">
                <thead>
                    <tr>
                        <td><input type="checkbox" class="form-select-all" checked="checked" /></td>
                        <td>Key</td>
                        <td>Value</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody id="js-url-params" class="form-data-input">
                    {{ this.get_view('form', 'headers_params_line', data['url_params']) }}
                </tbody>
            </table>
        `;
    };

    this.headers_params_line = function() {
        return `
            {{ for var i in data['list'] }}
            {{ var item_key = data['list'][i]['key'].replace(/\"/g, '&#34;').replace(/\'/g, '&#39;') }}
            {{ var value_format = data['list'][i]['val'].replace(/\\"/g, '&#34;').replace(/\\'/g, '&#39;'); }}
            <tr>
                <td><input type="checkbox" class="form-select" checked="checked" /> </td>
                <td><input type="text" class="form-key form-data-item input-text" data-type="js-url-params" value="{{ item_key }}" /> </td>
                <td><input type="text" class="form-value form-data-item input-text" data-type="js-url-params" value="{{ value_format }}" /> </td>
                <td class="cursor-pointer form-line-del-box"><i class="mdi mdi-close" data-type="url-params-line" /></td>
            </tr>
            {{ end }}
            <tr>
                <td><input type="checkbox" class="form-select" checked="checked" /> </td>
                <td><input type="text" class="form-key form-data-item input-text" data-type="js-url-params" /> </td>
                <td><input type="text" class="form-value form-data-item input-text" data-type="js-url-params" /> </td>
                <td class="cursor-pointer form-line-del-box"></td>
            </tr>
        `;
    };

    /**
     * layout
     */
    this.layout = function() {
        return `
            {{ var name = data['name'] ? data['name'] : '' }}
            {{ var url = data['url'] ? data['url'] : '' }}
            {{ var dataType = data['data_type'] ? data['data_type'] : 'form-data' }}
            <div class="form-header display-flex-row">
                <input type="text" 
                    class="input-text form-name bg-level-3 border-level-0 display-flex-auto" 
                    placeholder="API Name" value="{{ name }}" />
            </div>

            <div class="form-url-line display-flex-row">
                <div class="form-request-type">
                    {{ var requestTypeList = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }}
                    <select id="request-type" class="bg-level-3 border-level-0">
                        {{ for var i in requestTypeList }}
                        {{ var selected = requestTypeList[i] === data['type'] ? 'selected="selected"' : '' }}
                        <option value="{{ requestTypeList[i] }}" {{ selected }}>{{ requestTypeList[i] }}</option>
                        {{ end }}
                    </select>
                </div>
                <div class="display-flex-auto form-request-url-container display-flex-row bg-level-3 border-level-0">
                    <div class="display-flex">
                        <i class="mdi mdi-alpha-h-box form-host-selector"></i>
                    </div>
                    <input type="text" 
                        class="input-text form-name bg-level-3 display-flex-auto" 
                        placeholder="API URL" value="{{ url }}" />
                </div>
                <div class="form-request-send-container">
                    <button id="send" class="btn btn-primary">Send</button>
                </div>
            </div>

            <div class="form-request-headers-line">
                <nav>
                    <span class=""><strong>Headers</strong></span>
                    <span><strong>Authentication</strong></span>
                    <span><strong>Params</strong></span>
                </nav>
                <!--
                <table class="form-data-table border-top-level-1" cellspacing="0" id="js-form-headers-body">
                    <thead>
                    <tr>
                        <td class="border-bottom-level-1"><input type="checkbox" class="form-select-all" checked="checked"></td>
                        <td class="border-bottom-level-1">Key</td>
                        <td class="border-bottom-level-1">Value</td>
                        <td class="border-bottom-level-1">Description</td>
                        <td class="border-bottom-level-1"></td>
                    </tr>
                    </thead>
                    <tbody id="form-data-headers" class="form-data-input">
                    <tr>
                        <td><input type="checkbox" class="form-select" checked="checked" /></td>
                        <td><input type="text" class="bg-level-3 border-level-0 form-key form-data-item input-text" data-type="form-data-headers"></td>
                        <td><input type="text" class="bg-level-3 border-level-0 form-value form-data-item input-text" data-type="form-data-headers"></td>
                        <td><input type="text" class="bg-level-3 border-level-0 form-description form-data-item input-text" data-type="form-data-headers"></td>
                        <td class="cursor-pointer form-line-del-box">
                        </td>
                    </tr>
                    </tbody>
                </table>
                -->
            </div>

            <div class="form-request-headers-line display-flex-column display-flex-auto">
                <nav>
                    <span class="bg-level-0"><strong>Body</strong></span>
                </nav>
                <div class="form-request-data-type-container display-flex-row border-top-level-1">
                    <div class="display-flex-auto">
                        {{ var dataTypeList = [{'key': 'form-data-true', 'value': 'form-data'}, {'key': 'form-data', 'value': 'x-www-form-urlencoded'}, {'key': 'raw', 'value': 'raw'}] }}
                        {{ for var i in dataTypeList }}
                        {{ var item = dataTypeList[i] }}
                        {{ var checked = item['key'] === dataType ? 'mdi-checkbox-marked-circle' : '' }}
                        <label class="form-request-data-type"><i class="mdi mdi-checkbox-blank-circle {{ checked }}" value="{{ item['key'] }}"></i> {{ item['value'] }}</label>
                        {{ end }}
                    </div>
                    <span>
                        <i class="mdi mdi-square-edit-outline"></i> Edit Parameter
                    </span>
                </div>
                <div class="display-flex-auto overflow-y-auto">
                {{ this.view.getView('form', 'form', data) }}
                </div>
            </div>
        `;
    };
    /**
     * 表单行
     * @returns {string}
     */
    this.form = function() {
        return `
            {{ var data_type = data['data_type'] ? data['data_type'] : 'form-data' }}
            {{ var view_name = data_type === 'form-data-true' ? 'form_data_box' : (data_type === 'raw' ? 'raw' : 'urlencoded_box') }}
            {{ var form_data_list = data['data'] }}
            <table class="form-data-table border-top-level-1" cellspacing="0">
                <tbody id="form-data" class="form-data-input form-data-type" data-type="form-data">
                    {{ this.view.getView('form', view_name, form_data_list) }}
                </tbody>
            </table>
        `;
    };

    /**
     *
     * @returns {string}
     */
    this.form_data_box = function() {
        return `
            <tr class="form-data-title">
                <td class="border-bottom-light"><input type="checkbox" class="form-select-all" checked="checked" /></td>
                <td class="border-bottom-light">Key</td>
                <td class="border-bottom-light">Value</td>
                <td class="border-bottom-light">Description</td>
                <td class="border-bottom-light"></td>
            </tr>
            {{ View.get_view('form', 'form_data_line', data) }}
        `;
    };

    /**
     * 表单的一行 form-data
     */
    this.form_data_line = function() {
        return `
            {{ for var i in data }}
            {{ var item_key = i.replace(/\"/g, '&#34;').replace(/\'/g, '&#39;') }}
            {{ var value_type = typeof data[i] === 'object' ? data[i]['value_type'] : 'Text' }}
            {{ var value_type_list = ['Text', 'File'] }}
            {{ var value = typeof data[i] === 'object' ? data[i]['value'] : data[i] }}
            {{ var value_format = value.replace(/\\"/g, '&#34;').replace(/\\'/g, '&#39;'); }}
            {{ var description = typeof data[i] === 'object' ? data[i]['description'] : '' }}
            <tr>
                <td><input type="checkbox" class="form-select" checked="checked" /> </td>
                <td><input type="text" class="form-key form-data-item input-text" data-type="form-data-true" value="{{ item_key }}" /> </td>
                <td class="display-flex-row">
                    <select class="w-60 radius-small-all border-normal form-value-data-type">
                        {{ for var j in value_type_list }}
                        {{ var is_selected = value_type.toLowerCase() === value_type_list[j].toLowerCase() ? 'selected=selected' : '' }}
                        <option value="{{ value_type_list[j] }}" {{ is_selected }}>{{ value_type_list[j] }}</option>
                        {{ end }}
                    </select>
                    <input type="{{ value_type }}" class="form-value form-data-item input-text display-flex-auto" data-type="form-data-true" value="{{ value_format }}" />
                </td>
                <td><input type="text" class="form-description form-data-item input-text" data-type="form-data-true" value="{{ description }}" /> </td>
                <td class="cursor-pointer form-line-del-box"><i class="mdi mdi-close" /></td>
            </tr>
            {{ end }}
            <tr>
                <td><input type="checkbox" class="form-select" checked="checked" /> </td>
                <td><input type="text" class="form-key form-data-item input-text" data-type="form-data-true" /> </td>
                <td class="display-flex-row">
                    <select class="w-60 radius-small-all border-normal form-value-data-type">
                        <option value="Text">Text</option>
                        <option value="File">File</option>
                    </select>
                    <input type="text" class="form-value form-data-item input-text display-flex-auto" data-type="form-data-true" />
                </td>
                <td><input type="text" class="form-description form-data-item input-text" data-type="form-data-true" /> </td>
                <td class="cursor-pointer form-line-del-box"></td>
            </tr>
        `;
    };

    /**
     * 表单header的一行
     */
    this.form_header_line = function() {
        return `
            {{ for var i in data }}
            {{ var item_key = i.replace(/\"/g, '&#34;').replace(/\'/g, '&#39;') }}
            {{ var value_format = data[i]['value'].replace(/\\"/g, '&#34;').replace(/\\'/g, '&#39;'); }}
            <tr>
                <td><input type="checkbox" class="form-select" checked="checked" /> </td>
                <td><input type="text" class="form-key form-data-item input-text" data-type="form-data-headers" value="{{ item_key }}" /> </td>
                <td><input type="text" class="form-value form-data-item input-text" data-type="form-data-headers" value="{{ value_format }}" /> </td>
                <td><input type="text" class="form-description form-data-item input-text" data-type="form-data-headers" value="{{ data[i]['description'] }}" /> </td>
                <td class="cursor-pointer form-line-del-box"><i class="mdi mdi-close" /></td>
            </tr>
            {{ end }}
            <tr>
                <td><input type="checkbox" class="form-select" checked="checked" /> </td>
                <td><input type="text" class="form-key form-data-item input-text" data-type="form-data-headers" /> </td>
                <td><input type="text" class="form-value form-data-item input-text" data-type="form-data-headers" /> </td>
                <td><input type="text" class="form-description form-data-item input-text" data-type="form-data-headers" /> </td>
                <td class="cursor-pointer form-line-del-box"></td>
            </tr>
        `;
    };

    /**
     *
     * @returns {string}
     */
    this.urlencoded_box = function() {
        return `
            <tr class="form-data-title">
                <td class="border-bottom-light"><i class="mdi mdi-checkbox-blank-outline mdi-checkbox-marked form-select"></i></td>
                <td class="border-bottom-light">Key</td>
                <td class="border-bottom-light">Value</td>
                <td class="border-bottom-light">Description</td>
                <td class="border-bottom-light"></td>
            </tr>
            {{ this.view.getView('form', 'urlencoded_line', data) }}
        `;
    };

    /**
     * 表单一行 x-www-form-urlencoded
     * @returns {string}
     */
    this.urlencoded_line = function() {
        return `
            {{ for var i in data }}
            {{ var item_key = i.replace(/\"/g, '&#34;').replace(/\'/g, '&#39;') }}
            {{ var value = typeof data[i] === 'object' ? data[i]['value'] : data[i] }}
            {{ var value_format = value.replace(/\\"/g, '&#34;').replace(/\\'/g, '&#39;'); }}
            {{ var description = typeof data[i] === 'object' ? data[i]['description'] : '' }}
            <tr>
                <td><i class="mdi mdi-checkbox-blank-outline mdi-checkbox-marked form-select"></i></td>
                <td><input type="text" class="form-key bg-level-3 border-level-0 form-key form-data-item input-text" data-type="form-data" value="{{ item_key }}" /> </td>
                <td><input type="text" class="form-value bg-level-3 border-level-0 form-key form-data-item input-text" data-type="form-data" value="{{ value_format }}" /> </td>
                <td><input type="text" class="form-description bg-level-3 border-level-0 form-key form-data-item input-text" data-type="form-data" value="{{ description }}" /> </td>
                <td class="cursor-pointer form-line-del-box"><i class="mdi mdi-close" /></td>
            </tr>
            {{ end }}
            <tr>
                <td><i class="mdi mdi-checkbox-blank-outline mdi-checkbox-marked form-select"></i></td>
                <td><input type="text" class="form-key bg-level-3 border-level-0 form-key form-data-item input-text" data-type="form-data" /> </td>
                <td><input type="text" class="form-value bg-level-3 border-level-0 form-key form-data-item input-text" data-type="form-data" /> </td>
                <td><input type="text" class="form-description bg-level-3 border-level-0 form-key form-data-item input-text" data-type="form-data" /> </td>
                <td class="cursor-pointer form-line-del-box"></td>
            </tr>
        `;
    };

    /**
     * raw表单
     * @returns {string}
     */
    this.raw = function() {
        return `
            <tr>
                <td colspan="4">
                    {{ var raw_content_type_list = [{'k': 'text/plain', 'v': 'Text(text/plain)'}, {'k': 'application/json', 'v': 'JSON(application/json)'}, {'k': 'application/xml', 'v': 'XML(application/xml)'}, {'k': 'text/html', 'v': 'HTML(text/html)'}] }}
                    <select id="raw-content-type" class="bg-level-3 border-level-0">
                        {{ var content_type = data ? data['content_type'] : '' }}
                        {{ for var i in raw_content_type_list }}
                        {{ var item = raw_content_type_list[i] }}
                        {{ var selected = item['k'] === content_type ? 'selected="selected"' : '' }}
                        <option value="{{ item['k'] }}" {{ selected }}>{{ item['v'] }}</option>
                        {{ end }}
                    </select>
                </td>
            </tr>
            <tr>
                <td colspan="4">
                    {{ var raw_data = data['data'] ? data['data'] : '' }}
                    <textarea style="padding:10px;width:100%;height:200px;" class="bg-level-3 border-level-0 color-level-0">{{ raw_data }}</textarea>
                </td>
            </tr>
        `;
    };

    /**
     * 响应结果
     * @returns {string}
     */
    this.response_layout = function() {
        return `
            {{ var headers = data['headers'] ? data['headers'] : 'click the send button for a response' }}
            {{ var status = (data['status'] || data['status'] === 0) ? data['status'] : 'None' }}
            {{ var status_class = data['status'] ? (data['status'] === 200 ? 'color-success' : 'color-failed') : 'color-failed' }}
            {{ var use_time = data['use_time'] ? data['use_time'] : 'None' }}
            {{ var response = data['response'] ? data['response'] : 'click the send button for a response' }}
            {{ var codeThemeClass = 'code-theme-' + data['codeTheme'] }}
            <div class="output-content">
                <div class="tabs-bottom display-flex-row">
                    <ul class="response-type">
                        <li class="focus" data-id="result">body</li>
                        <li data-id="response-headers">headers</li>
                    </ul>
                    <div class="display-flex-auto response-code-theme-selector">
                        <span class="light"></span>
                        <span class="dark"></span>
                    </div>
                </div>
                <div class="result-box {{ codeThemeClass }}">
                    <div class="result-top">
                        <div id="result-format">
                            <span class="focus">format</span>          
                            <span>raw</span>          
                            <div class="display-inline hide" id="result-copy">
                                <button class="btn btn-primary">copy</button>
                            </div>
                        </div>
                        <div class="display-inline send-time">
                            <label>status:</label> 
                            <span id="response-status" class="{{ status_class }} font-bold">{{ status }}</span> 
                            <label>time:</label> 
                            <span id="send-time" class="font-bold">{{ use_time }}</span> ms
                        </div>
                    </div>
                    <div class="response-box display-flex-auto display-flex-column">
                        <pre id="result" class="result-box-pre response-body">{{ response }}</pre>
                        <pre id="response-headers" class="result-box-pre hide">{{ headers }}</pre>
                        <input type="text" id="result-copy-input" />
                    </div>
                </div>
            </div>
        `;
    };

    /**
     * 编辑请求参数
     * @returns {string}
     */
    this.edit_parameter = function() {
        return `
            <div class="form-edit-parameter-box">
                <div class="form-edit-parameter-content">
                    <textarea id="form-data-format-content" placeholder="Example:&#10;key=some key&username=Yuiitsu&#10;or&#10;key1: val1&#10;key2: val2">
                        {{ if data }}
                        {{ for var k in data }}
                        {{ k }}: {{ data[k]['value'] }}&#10;
                        {{ end }}
                        {{ end }}
                    </textarea>
                </div>
                <div class="h-30">
                    <button class="btn btn-primary js-handler" id="form-data-format">OK</button>
                </div>
            </div>
        `;
    };
});
