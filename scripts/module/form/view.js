/**
 * 表单View
 * Created by Yuiitsu on 2018/05/22.
 */
View.extend('form', function() {

    this.layout = function() {
        return `
            <div class="tab-line">
                <div class="api-name-line display-inline">
                    <input type="text" class="input-text" placeholder="Enter api name" id="api-name" />
                    <div class="form-group-selector group-selector" id="group-selector">
                    {{ App.group.get_select_view() }}
                    </div>
                </div>
            </div>
            <div class="form">
                <div class="form-line">
                    <div class="request-type-box display-inline vertical-middle">
                        <select id="request-type">
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="OPTIONS">OPTIONS</option>
                        </select>
                    </div>
                    <div class="url-box vertical-middle">
                        <input type="text" id="url" class="input-text" placeholder="Enter api URL" />
                        <i class="mdi mdi-format-list-bulleted font-color-dark" id="host-select" title="host history"></i>
                    </div>
                    <div class="display-inline request-button vertical-middle">
                        <button id="send" class="btn btn-primary">Send</button>
                    </div>
                </div>
                <div class="form-params-type">
                    <ul>
                        <li>headers</li>
                        <li class="focus">body</li>
                        <li>assertion</li>
                        <li>format</li>
                    </ul>
                </div>
                <div class="form-data bg-light">
                    <!-- form data headers -->
                    <table class="form-data-table hide" cellspacing="0">
                        <thead>
                            <tr>
                                <td><input type="checkbox" class="form-select" checked="checked" /></td>
                                <td>Key</td>
                                <td>Value</td>
                                <td>description</td>
                                <td></td>
                            </tr>
                        </thead>
                        <tbody id="form-data-headers" class="form-data-input">
                            {{ this.get_view('form', 'form_header_line', {}) }}
                        </tbody>
                    </table>
                    <!-- form data body -->
                    <form id="form-data-form">{{ this.get_view('form', 'form', {}) }}</form>
                    <!-- assert -->
                    <table class="form-data-table hide" cellspacing="0">
                        <thead>
                            <tr>
                                <td>
                                    <!--
                                    <label><input type="radio" name="form-data-assert-type" value="String" /> String</label>
                                    -->
                                    <label><input type="radio" name="form-data-assert-type" checked="checked" value="Json" /> Json</label>
                                    <!--
                                    <label><input type="radio" name="form-data-assert-type" value="Xml" /> Xml</label>
                                    -->
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <textarea style="padding:10px;width:100%;height:500px;" id="form-data-assert"></textarea>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <!-- format -->
                    <table class="form-data-table hide" cellspacing="0">
                        <tbody>
                            <tr>
                                <td>
                                    <textarea style="padding:10px;width:100%;height:300px;" id="form-data-format-content" placeholder="eg. key=some key&username=Yuiitsu"></textarea>
                                </td>
                            </tr>
                            <tr>
                                <td style="height:60px;"><button class="btn btn-primary" id="form-data-format">Format</button></td>
                            </tr>
                        </tbody>
                    </table>
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
            <table class="form-data-table font-color-white" cellspacing="0">
                <thead>
                    <tr>
                        <td colspan="4" class="border-bottom-light">
                            <label class="form-request-data-type"><input type="radio" name="form-data-type" value="form-data-true" /> form-data</label>
                            <label class="form-request-data-type"><input type="radio" name="form-data-type" checked="checked" value="form-data" /> x-www-form-urlencoded</label>
                            <label class="form-request-data-type"><input type="radio" name="form-data-type" value="raw" /> raw</label>
                            <select id="raw-content-type" class="hide">
                                <option value="text/plain">Text(text/plain)</option>
                                <option value="application/json">JSON(application/json)</option>
                                <option value="application/xml">XML(application/xml)</option>
                                <option value="text/html">HTML(text/html)</option>
                            </select>
                        </td>
                    </tr>
                    <tr class="form-data-title">
                        <td class="border-bottom-light"><input type="checkbox" class="form-select-all" checked="checked" /></td>
                        <td class="border-bottom-light">Key</td>
                        <td class="border-bottom-light">Value</td>
                        <td class="border-bottom-light">Description</td>
                        <td class="border-bottom-light"></td>
                    </tr>
                </thead>
                <tbody id="form-data-true" class="form-data-input form-data-type hide" data-type="form-data-true">
                    {{ this.get_view('form', 'form_data_line', {}) }}
                </tbody>
                <tbody id="form-data" class="form-data-input form-data-type" data-type="form-data">
                    {{ this.get_view('form', 'urlencoded_line', []) }}
                </tbody>
                <tbody id="form-data-raw" class="form-data-input form-data-type hide" data-type="raw">
                    <tr>
                        <td colspan="3">
                            <textarea style="padding:10px;width:100%;height:300px;"></textarea>
                        </td>
                    </tr>
                </tbody>
            </table>
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
                <td class="cursor-pointer"><i class="mdi mdi-close" /></td>
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
                <td class="cursor-pointer"><i class="mdi mdi-close" /></td>
            </tr>
            {{ end }}
            <tr>
                <td><input type="checkbox" class="form-select" checked="checked" /> </td>
                <td><input type="text" class="form-key form-data-item input-text" data-type="form-data-headers" /> </td>
                <td><input type="text" class="form-value form-data-item input-text" data-type="form-data-headers" /> </td>
                <td><input type="text" class="form-description form-data-item input-text" data-type="form-data-headers" /> </td>
            </tr>
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
                <td><input type="checkbox" class="form-select" checked="checked" /> </td>
                <td><input type="text" class="form-key form-data-item input-text" data-type="form-data" value="{{ item_key }}" /> </td>
                <td><input type="text" class="form-value form-data-item input-text" data-type="form-data" value="{{ value_format }}" /> </td>
                <td><input type="text" class="form-description form-data-item input-text" data-type="form-data" value="{{ description }}" /> </td>
                <td class="cursor-pointer"><i class="mdi mdi-close" /></td>
            </tr>
            {{ end }}
            <tr>
                <td><input type="checkbox" class="form-select" checked="checked" /> </td>
                <td><input type="text" class="form-key form-data-item input-text" data-type="form-data" /> </td>
                <td><input type="text" class="form-value form-data-item input-text" data-type="form-data" /> </td>
                <td><input type="text" class="form-description form-data-item input-text" data-type="form-data" /> </td>
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
            {{ var status = data['status'] ? data['status'] : 'None' }}
            {{ var status_class = data['status'] ? (data['status'] === 200 ? 'color-success' : 'color-failed') : '' }}
            {{ var use_time = data['use_time'] ? data['use_time'] : 'None' }}
            {{ var response = data['response'] ? data['response'] : 'click the send button for a response' }}
            <div class="tabs-bottom">
                <ul class="response-type">
                    <li class="focus" data-id="result">body</li>
                    <li data-id="response-headers">headers</li>
                </ul>
                <div class="display-inline send-time">
                    <label>status:</label> 
                    <span id="response-status" class="{{ status_class }} font-bold">{{ status }}</span> 
                    <label>time:</label> 
                    <span id="send-time" class="font-bold">{{ use_time }}</span> ms
                </div>
            </div>
            <pre id="result" class="result-box response-body">{{ response }}</pre>
            <pre id="response-headers" class="result-box hide">{{ headers }}</pre>
        `;
    };
});
