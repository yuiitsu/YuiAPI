/**
 * 表单View
 * Created by Yuiitsu on 2018/05/22.
 */
View.extend('form', function() {
    /**
     * 表单行
     * @returns {string}
     */
    this.form = function() {
        return `
            <table class="form-data-table" cellspacing="0">
                <thead>
                    <tr>
                        <td colspan="4">
                            <label><input type="radio" name="form-data-type" value="form-data-true" /> form-data</label>
                            <label><input type="radio" name="form-data-type" checked="checked" value="form-data" /> x-www-form-urlencoded</label>
                            <label><input type="radio" name="form-data-type" value="raw" /> raw</label>
                            <select id="raw-content-type" class="hide">
                                <option value="text/plain">Text(text/plain)</option>
                                <option value="application/json">JSON(application/json)</option>
                                <option value="application/xml">XML(application/xml)</option>
                                <option value="text/html">HTML(text/html)</option>
                            </select>
                        </td>
                    </tr>
                    <tr class="form-data-title">
                        <td></td>
                        <td>Key</td>
                        <td>Value</td>
                        <td>Description</td>
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
                            <textarea style="padding:10px;width:100%;height:500px;"></textarea>
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
            {{ var value_type = typeof data[i] === 'object' ? data[i]['value_type'] : 'text' }}
            {{ var value_type_list = ['Text', 'File'] }}
            {{ var value = typeof data[i] === 'object' ? data[i]['value'] : data[i] }}
            {{ var description = typeof data[i] === 'object' ? data[i]['description'] : '' }}
            <tr>
                <td><input type="checkbox" class="form-select" checked="checked" /> </td>
                <td><input type="text" class="form-key form-data-item input-text" data-type="form-data-true" value="{{ item_key }}" /> </td>
                <td class="display-flex-row">
                    <select class="w-50 radius-small-all border-normal form-value-data-type">
                        {{ for var j in value_type_list }}
                        {{ var is_selected = value_type === value_type_list[j].toLowerCase() ? 'selected=selected' : '' }}
                        <option value="{{ value_type_list[j] }}" {{ is_selected }}>{{ value_type_list[j] }}</option>
                        {{ end }}
                    </select>
                    <input type="{{ value_type }}" class="form-value form-data-item input-text display-flex-auto" data-type="form-data-true" value="{{ value }}" />
                </td>
                <td><input type="text" class="form-description form-data-item input-text" data-type="form-data-true" value="{{ description }}" /> </td>
            </tr>
            {{ end }}
            <tr>
                <td><input type="checkbox" class="form-select" checked="checked" /> </td>
                <td><input type="text" class="form-key form-data-item input-text" data-type="form-data-true" /> </td>
                <td class="display-flex-row">
                    <select class="w-50 radius-small-all border-normal form-value-data-type">
                        <option value="text">Text</option>
                        <option value="file">File</option>
                    </select>
                    <input type="text" class="form-value form-data-item input-text display-flex-auto" data-type="form-data-true" />
                </td>
                <td><input type="text" class="form-description form-data-item input-text" data-type="form-data-true" /> </td>
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
            {{ var description = typeof data[i] === 'object' ? data[i]['description'] : '' }}
            <tr>
                <td><input type="checkbox" class="form-select" checked="checked" /> </td>
                <td><input type="text" class="form-key form-data-item input-text" data-type="form-data" value="{{ item_key }}" /> </td>
                <td><input type="text" class="form-value form-data-item input-text" data-type="form-data" value="{{ value }}" /> </td>
                <td><input type="text" class="form-description form-data-item input-text" data-type="form-data" value="{{ description }}" /> </td>
            </tr>
            {{ end }}
            <tr>
                <td><input type="checkbox" class="form-select" checked="checked" /> </td>
                <td><input type="text" class="form-key form-data-item input-text" data-type="form-data" /> </td>
                <td><input type="text" class="form-value form-data-item input-text" data-type="form-data" /> </td>
                <td><input type="text" class="form-description form-data-item input-text" data-type="form-data" /> </td>
            </tr>
        `;
    }
});
