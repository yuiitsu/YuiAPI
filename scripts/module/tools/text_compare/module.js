/**
 * Created by onlyfu on 2020/03/27.
 */
App.module.extend('tools.textCompare', function() {
    //
    let self = this;
    //
    Model.default['tools.textCompare'] = {
        a: '',
        b: ''
    };

    this.init = function() {
        Model.set('tools.textCompare', {}).watch('tools.textCompare', this.compare);
    };

    this.renderLayout = function() {
        self.view.display('tools.textCompare', 'layout', {}, '.tools-box');
    };

    this.compare = function(data) {
        let textA = data.a, 
            textB = data.b;
        //
        if (!textA || !textB) {
            return false;
        }
        console.log(data);
        return;
        //
        let leftTextLines = leftText.split('\n'), 
            rightTextLines = rightText.split('\n'), 
            leftTextLinesLen = leftTextLines.length, 
            rightTextLinesLen = rightTextLines.length, 
            result = [];
        //
        debugger
        for (let i = 0; i < leftTextLinesLen; i++) {
            let leftLine = leftTextLines[i], 
                rightLine = rightTextLines[i], 
                leftLineLen = leftLine.length, 
                rightLineLen = rightLine.length, 
                resultLine = [];
            //
            for (let j = 0; j < leftLineLen; j++) {
                if (leftLine[j] === rightLine[j]) {
                    resultLine.push(leftLine[j]);
                } else {
                    resultLine.push('<span class="diff">'+ rightLine[j] +'</span>')
                }
            }
            result.push(resultLine.join('') + '\n');
        }
        console.log(result);
    }

    this.renderPretty = function(data) {
        let result = '';
        try {
            result = unescape(data.replace(/\\u/g, '%u'));
        } catch (e) {
            result = self.view.getView('tools.unicode', 'error', {});
        }
        $('.tools-unicode-result-container').html(result);
    };
});
