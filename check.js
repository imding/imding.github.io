export function check(editableIndex, tElem, tContent, tAttr){
    let input = code.html.editable[editableIndex].trim(),
        isVoid = /area|base|br|col|hr|img|input|link|meta|param|command|keygen|source/i.test(tElem);
    tContent = tContent.replace(/#ANY#/, '.+');
    tElem ? checkElem() : tAttr ? checkAttr() : tContent ? pass('Fill in the content for the <' + tElem + '> element').if(RegExp('^' + tContent + '$').test(input)).is.true : null;
    function checkElem() {
        let p = RegExp('^<' + tElem + (tAttr ? '.+' : '\\s*') + '>\\s*' + (tContent ? tContent + '\\s*' : '') + (isVoid ? '$' : '</' + tElem + '\\s*>$'));
      	console.log((check ? 'MATCH' : 'MISMATCH') + ': ' + p + ' ?= |' + input + '|');
      	pass('The syntax should be: <' + tElem + '>' + (isVoid ? '' : '</' + tElem + '>')).if(p.test(input)).is.true;
        p.test(input) && !/#ANY#/.test(tAttr.join('')) ? checkAttr() : null;
    }
    function checkAttr() {
        let tString = tElem ? input.replace(RegExp('^<' + tElem + '([^>]+)>.*'), '$1') : '\\s' + input;
        tAttr.some(function(e,i){
            e = e.replace(/[\.\\\+\*\?\^\$\[\]\{\}\(\)\|\/]/g, '\\$&').replace(/\\\)(?!\s*;)\s*/, '\\\);?').replace(/;\s+/g, ';\\s+');
            e = /=/.test(e) ? e.replace(/=/, '\\s*=\\s*([\'"])') + '\\1' :
                /#ANY#/.test(e) ? e.replace(/#ANY#/, '\\s[^=\\s]+\\s*=\\s*([\'"])[^\'"]+\\1') : e;            
            RegExp(e).test(tString) ? tString = tString.replace(RegExp(e), '') : pass('Make sure the ' + tAttr[i].split(/=/)[0] + ' attribute and its value are correct.').if(false).is.true;
            return !check;
        });
        pass('Delete: ' + tString.trim()).if(tString.trim().length == 0).is.true;
    }
}