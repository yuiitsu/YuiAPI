/**
 * Created by onlyfu on 2017/9/6.
 */
let Common = {

    cache: {
        /**
         * 获取列表数据
         * @param key
         * @returns {Array}
         */
        getListData: function(key) {
            let result = null;
            try {
                result =  JSON.parse(localStorage.getItem(key));
            } catch (e) {
            }

            return result ? result : [];
        }
    },

    /**
     * 提示
     * @param focus
     * @param content
     */
    tips: function(focus, content) {
        let obj = $('#tips-box');
        if (obj.length) {
            obj.html(content).show();
        } else {
            let _html = '<div id="tips-box">'+ content +'</div>';
            $('body').append(_html);
            obj = $('#tips-box');
        }

        let tips_timer = setTimeout(function() {
            $('#tips-box').hide();
        }, 3000);

        let focus_offset = focus.offset(),
            focus_width = focus.outerWidth(),
            focus_height = focus.outerHeight(),
            obj_top = focus_offset.top,
            obj_left = focus_offset.left,
            obj_width = obj.outerWidth(),
            obj_height = obj.outerHeight(),
            client_width = this.clientSize('clientWidth'),
            client_height = this.clientSize('clientHeight');

        // 检查位置和宽度，如果超出屏幕，向右显示
        if (obj_left + obj_width > client_width) {
            obj_left = obj_left - obj_width + focus_width;
        }

        // 检查位置和调试，如果超出屏幕，向上显示
        if (obj_top + obj_height > client_height) {
            obj_top = obj_top - obj_height;
        }

        $('#tips-box').css({'top': obj_top + focus_height, 'left': obj_left})
            .off('mouseenter').on('mouseenter', function() {
                clearTimeout(tips_timer);
        }).off('mouseleave').on('mouseleave', function() {
            $(this).hide();
        });
    },

    /**
     * 通知
     * @param text
     * @param type
     */
    notification: function(text, type) {
        // 初始化
        let notification_timer = null;
        $('#notification-box').remove();
        clearTimeout(notification_timer);
        //
        let bg = type ? type : 'success';
        let _html = '<div id="notification-box" class="bg-'+ bg +'">'+
                text +
            '</div>';
        $('body').append(_html);

        notification_timer = setTimeout(function() {
            $('#notification-box').fadeOut();
        }, 2000);
    },

    module: function(name, content, action) {
        let _html = '<div id="module-box">'+
                '<div class="module-mask"></div>'+
                '<div class="module-content">'+
                    '<div class="module-header">'+ name +
                        '<i class="mdi mdi-close fr module-close"></i>'+
                    '</div>'+
                    '<div class="module-main">'+ content +'</div>'+
                    '<div class="module-actions">'+ action +'</div>'+
                '</div>'+
            '</div>';
        $('body').append(_html);

        $('.module-close').off('click').on('click', function() {
            $('#module-box').remove();
        });
    },

    /**
     * 获取表单数据
     * @returns {{}}
     */
    getFormParams: function() {
        return {
            /**
             * 从表单中获取参数与值
             * @param parent_obj 父对象
             * @param is_form_data 类型是否为form-data
             * @returns {{data, history_data}}
             */
            get_data: function(parent_obj, is_form_data) {
                let form_data = is_form_data ? new FormData() : {},
                    history_data = {},
                    i = 0,
                    select_obj = parent_obj.find('.form-select'),
                    key_obj = parent_obj.find('.form-key'),
                    value_type_obj = parent_obj.find('.form-value-data-type'),
                    value_obj = parent_obj.find('.form-value'),
                    description_obj = parent_obj.find('.form-description');

                select_obj.each(function () {
                    if ($(this).is(":checked")) {
                        let key = $.trim(key_obj.eq(i).val());
                        if (key) {
                            let value = $.trim(value_obj.eq(i).val()),
                                value_type = 'Text';
                            if (is_form_data) {
                                if (value_type_obj.eq(i).val() === 'File') {
                                    form_data.append(key, value_obj.eq(i)[0].files[0]);
                                    value_type = 'File';
                                } else {
                                    form_data.append(key, value);
                                }
                            } else {
                                form_data[key] = value;
                            }
                            history_data[key] = {
                                value: value,
                                value_type: value_type,
                                description: $.trim(description_obj.eq(i).val())
                            };
                        }
                    }
                    i++;
                });

                return {
                    data: form_data,
                    history_data: history_data
                };
            },
            header: function() {
                return this.get_data($('#form-data-headers'));
            },
            form: function() {
                return this.get_data($('#form-data'));
            },
            form_data: function() {
                return this.get_data($('#form-data-true'), true);
            }
        };
    },

    /**
     * 高亮显示代码
     * @param json
     * @returns {string}
     */
    syntaxHighlight: function(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'code-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'code-key';
                } else {
                    cls = 'code-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'code-boolean';
            } else if (/null/.test(match)) {
                cls = 'code-null';
            }
            return '<span class="'+ cls +'">' + match + '</span>';
        });
    },

    /**
     * 获取链接地址中的host
     * @param url
     * @returns {string}
     */
    getHost: function(url) {
        var parselUrl = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
        var urlResult = parselUrl.exec(url);
        return urlResult[1] + ':' + urlResult[2] + urlResult[3] + (urlResult[4] ? ':' + urlResult[4] : '');
    },

    /**
     * 发起请求
     * @param strUrl 请求地址
     * @param objParams 请求类型
     * @param objData 请求数据
     * @param callBack 回调函数
     */
    request: function(strUrl, objParams, objData, callBack){
        let options = {
            url: strUrl,
            type: objParams.type ? objParams.type : "GET",
            data: objData,
            async: objParams.async !== 'false',
            dataType: objParams.data_type ? objParams.data_type : "json",
            headers: objParams['headers'],
            processData: objParams.processData === undefined ? true : objParams.processData
        };

        if (objParams.hasOwnProperty('contentType')) {
            options['contentType'] = objParams.contentType;
        }

        let objJgbAjaxHandler = $.ajax(options);
        objJgbAjaxHandler.fail(function(jqXHR, text_status, d){
            if($.isFunction(callBack)){
                callBack(jqXHR.responseText, jqXHR);
            }
        });
        objJgbAjaxHandler.done(function(d, text_status, jqXHR){
            if($.isFunction(callBack)){
                callBack(d, jqXHR);
            }
        });
    },

    /**
     * 屏幕/文档/滚动宽高
     * @param type 类型
     */
    clientSize: function(type) {
        var result = [];
        result['scrollTop'] = window.self.document.documentElement.scrollTop ?
            window.self.document.documentElement.scrollTop : window.self.document.body.scrollTop;
        result['scrollHeight'] = window.self.document.documentElement.scrollHeight ?
            window.self.document.documentElement.scrollHeight : window.self.document.body.scrollHeight;
        result['clientHeight'] = window.self.document.documentElement.clientHeight ?
            window.self.document.documentElement.clientHeight : window.self.document.body.clientHeight;
        result['clientWidth'] = window.self.document.documentElement.clientWidth ?
            window.self.document.documentElement.clientWidth : window.self.document.body.clientWidth;
        return result[type];
    },

    /**
     * MD5
     * @param string
     * @returns {string}
     */
    md5: function(string) {
        function RotateLeft(lValue, iShiftBits) {
            return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
        }

        function AddUnsigned(lX,lY) {
            var lX4,lY4,lX8,lY8,lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
            if (lX4 & lY4) {
                return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            }
            if (lX4 | lY4) {
                if (lResult & 0x40000000) {
                    return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                } else {
                    return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                }
            } else {
                return (lResult ^ lX8 ^ lY8);
            }
        }

        function F(x,y,z) { return (x & y) | ((~x) & z); }
        function G(x,y,z) { return (x & z) | (y & (~z)); }
        function H(x,y,z) { return (x ^ y ^ z); }
        function I(x,y,z) { return (y ^ (x | (~z))); }

        function FF(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };

        function GG(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };

        function HH(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };

        function II(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };

        function ConvertToWordArray(string) {
            var lWordCount;
            var lMessageLength = string.length;
            var lNumberOfWords_temp1=lMessageLength + 8;
            var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
            var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
            var lWordArray=Array(lNumberOfWords-1);
            var lBytePosition = 0;
            var lByteCount = 0;
            while ( lByteCount < lMessageLength ) {
                lWordCount = (lByteCount-(lByteCount % 4))/4;
                lBytePosition = (lByteCount % 4)*8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
                lByteCount++;
            }
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
            lWordArray[lNumberOfWords-2] = lMessageLength<<3;
            lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
            return lWordArray;
        };

        function WordToHex(lValue) {
            var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
            for (lCount = 0;lCount<=3;lCount++) {
                lByte = (lValue>>>(lCount*8)) & 255;
                WordToHexValue_temp = "0" + lByte.toString(16);
                WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
            }
            return WordToHexValue;
        };

        function Utf8Encode(string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        };

        var x=Array();
        var k,AA,BB,CC,DD,a,b,c,d;
        var S11=7, S12=12, S13=17, S14=22;
        var S21=5, S22=9 , S23=14, S24=20;
        var S31=4, S32=11, S33=16, S34=23;
        var S41=6, S42=10, S43=15, S44=21;

        string = Utf8Encode(string);

        x = ConvertToWordArray(string);

        a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

        for (k=0;k<x.length;k+=16) {
            AA=a; BB=b; CC=c; DD=d;
            a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
            d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
            c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
            b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
            a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
            d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
            c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
            b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
            a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
            d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
            c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
            b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
            a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
            d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
            c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
            b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
            a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
            d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
            c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
            b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
            a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
            d=GG(d,a,b,c,x[k+10],S22,0x2441453);
            c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
            b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
            a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
            d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
            c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
            b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
            a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
            d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
            c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
            b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
            a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
            d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
            c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
            b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
            a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
            d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
            c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
            b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
            a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
            d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
            c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
            b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
            a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
            d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
            c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
            b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
            a=II(a,b,c,d,x[k+0], S41,0xF4292244);
            d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
            c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
            b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
            a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
            d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
            c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
            b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
            a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
            d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
            c=II(c,d,a,b,x[k+6], S43,0xA3014314);
            b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
            a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
            d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
            c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
            b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
            a=AddUnsigned(a,AA);
            b=AddUnsigned(b,BB);
            c=AddUnsigned(c,CC);
            d=AddUnsigned(d,DD);
        }

        var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

        return temp.toLowerCase();
    }
};
