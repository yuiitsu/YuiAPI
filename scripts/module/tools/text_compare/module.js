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
        Model.set('tools.textCompare', {}).watch('tools.textCompare', this.checkCompare);
    };

    this.renderLayout = function() {
        self.view.display('tools.textCompare', 'layout', {}, '.tools-box');
    };

    this.checkCompare = function(data) {
        let textA = data.a, 
            textB = data.b;
        //
        setTimeout(function() {
            if (textA && textB) {
                self.compare(textA, textB);
            } else {
                if (textA) {
                    self.renderPretty('a');
                }
                if (textB) {
                    self.renderPretty('b');
                }
            }
        });
        
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

    this.renderPretty = function(type) {
        let data = Model.get('tools.textCompare'), 
            targetData = data[type], 
            lines = targetData.split('\n'), 
            linesLen = lines.length;
        //
        for (let i = 0; i < linesLen; i++) {

        }
        self.view.display('tools.textCompare', 'prettyLine', lines, '#tools-compare-' + type);
    };
});
