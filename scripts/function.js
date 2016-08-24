
/**
 * 发起请求
 * @param strUrl 请求地址
 * @param objParams 请求类型
 * @param objData 请求数据
 * @param callBack 回调函数
 */
function request(strUrl, objParams, objData, callBack){

    var async = objParams.async != 'false';
    objJgbAjaxHandler = $.ajax({
        url: strUrl,
        type: objParams.type ? objParams.type : "GET",
        data: objData,
        async: objParams.async != 'false',
        dataType: "json"
    });
    objJgbAjaxHandler.fail(function(){
        countDown(5, $(strJgbOutBox), {url: strUrl, type: strType, async: async, data: objData, callback: callBack});
    });
    objJgbAjaxHandler.done(function(d){
        if($.isFunction(callBack)){
            callBack(d);
        }
    });
}