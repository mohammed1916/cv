const specs={
591:['code','Decide whether markup is exactly one valid root tag containing properly nested content.','A stack tracks open tag names. Ordinary text and CDATA are allowed only inside the root. Closing tags must match the stack top, and once the root closes no additional content may follow.','scan tokens while maintaining the open-tag stack|inside a tag consume CDATA through its first closing delimiter|validate uppercase tag names of length one through nine|push opening tags and match closing tags against the stack top|accept only one fully closed root with no outside content','O(code length) time and O(nesting depth) stack space.'],
592:['expression','Add and subtract fractions and return one reduced fraction with a positive denominator.','Fold each signed fraction into an accumulator using cross multiplication, then divide numerator and denominator by their greatest common divisor. Exact integer arithmetic handles cancellation without rounding.','start the fraction accumulator at zero over one|parse the next signed numerator and positive denominator|cross multiply to combine it with the accumulator|divide both parts by their greatest common divisor|return the reduced numerator and denominator string','O(terms*integer arithmetic cost) time; exact accumulator space depends on denominator growth.'],
};
const solvers={
591({code},emit){const stack=[];let i=0;const show=(message,stage,position=i)=>emit(message,{sequence:code.split(''),index:position,output:[...stack],codeStage:stage,metrics:{position,openTags:stack.length}},stage==='return'?'inspect':'update');const reject=message=>{show(message,'return');return false;};while(i<code.length){if(i>0&&!stack.length)return reject('The root already closed. Any following text or second root makes the document invalid.');if(code.startsWith('<![CDATA[',i)){if(!stack.length)return reject('CDATA cannot appear outside an open root tag.');const end=code.indexOf(']]>',i+9);if(end<0)return reject('The CDATA section never reaches its closing delimiter.');const start=i;i=end+3;show('CDATA content is opaque: apparent tags inside it do not change the open-tag stack.','cdata',start);}else if(code.startsWith('</',i)){const end=code.indexOf('>',i+2);if(end<0)return reject('The closing tag is missing its ending bracket.');const name=code.slice(i+2,end);if(!/^[A-Z]{1,9}$/.test(name)||stack.at(-1)!==name)return reject('A closing tag must have a valid name equal to the most recently opened tag.');stack.pop();const start=i;i=end+1;show('The closing name matches the stack top. Finish that element and return to its parent context.','close',start);}else if(code[i]==='<'){const end=code.indexOf('>',i+1);if(end<0)return reject('The opening tag is missing its ending bracket.');const name=code.slice(i+1,end);if(!/^[A-Z]{1,9}$/.test(name))return reject('Tag names contain one to nine uppercase letters only.');stack.push(name);const start=i;i=end+1;show('A valid opening tag establishes the context for its nested content.','open',start);}else{if(!stack.length)return reject('Ordinary text requires an open root tag.');const start=i,next=code.indexOf('<',i);i=next<0?code.length:next;show('Consume ordinary text inside the current element until the next possible tag begins.','text',start);}}const valid=code.length>0&&stack.length===0;show(valid?'The single root and every nested tag are closed, with no content outside the root.':'Some opening tags remain unmatched at the end of the input.','return',Math.max(0,code.length-1));return valid;},
592({expression},emit){let numerator=0n,denominator=1n;const table=[];for(const match of expression.matchAll(/[+-]?\d+\/\d+/g)){const[a,b]=match[0].split('/').map(BigInt),rawNumerator=numerator*b+a*denominator,rawDenominator=denominator*b;let x=rawNumerator<0n?-rawNumerator:rawNumerator,y=rawDenominator;while(y)[x,y]=[y,x%y];numerator=rawNumerator/x;denominator=rawDenominator/x;table.push([match[0],`${rawNumerator}/${rawDenominator}`,String(x),`${numerator}/${denominator}`]);emit('Cross multiplication combines the next signed term exactly. Reducing by the GCD prevents avoidable growth; a zero numerator normalizes to zero over one.',{sequence:expression.split(''),index:match.index,table:[...table],tableHeaders:['Signed term','Before reduction','GCD','Reduced accumulator'],codeStage:'reduce',metrics:{numerator:String(numerator),denominator:String(denominator)}},'update');}return `${numerator}/${denominator}`;},
};
const python={
591:`def isValid(code):
    import re
    stack, index, valid = [], 0, bool(code)
    while valid and index < len(code):
        if index > 0 and not stack:
            valid = False
            break
        if code.startswith('<![CDATA[', index):
            end = code.find(']]>', index + 9)
            if not stack or end < 0:
                valid = False
                break
            index = end + 3  # step: cdata
        elif code.startswith('</', index):
            end = code.find('>', index + 2)
            name = code[index + 2:end] if end >= 0 else ''
            if not re.fullmatch(r'[A-Z]{1,9}', name) or not stack or stack[-1] != name:
                valid = False
                break
            stack.pop()  # step: close
            index = end + 1
        elif code[index] == '<':
            end = code.find('>', index + 1)
            name = code[index + 1:end] if end >= 0 else ''
            if not re.fullmatch(r'[A-Z]{1,9}', name):
                valid = False
                break
            stack.append(name)  # step: open
            index = end + 1
        else:
            if not stack:
                valid = False
                break
            end = code.find('<', index)
            index = len(code) if end < 0 else end  # step: text
    return valid and not stack  # step: return`,
592:`def fractionAddition(expression):
    import re
    from math import gcd
    numerator, denominator = 0, 1
    for term in re.findall(r'[+-]?\\d+/\\d+', expression):
        top, bottom = map(int, term.split('/'))
        numerator, denominator = numerator * bottom + top * denominator, denominator * bottom
        divisor = gcd(abs(numerator), denominator)
        numerator //= divisor  # step: reduce
        denominator //= divisor
    return f'{numerator}/{denominator}'  # step: return`,
};
const cases={
591:[['Nested content includes apparent tags inside opaque CDATA',{code:'<ARCHIVE><ENTRY>field notes</ENTRY><![CDATA[<BROKEN> stays literal & </OTHER>]]><ENTRY><PAGE>seven</PAGE></ENTRY></ARCHIVE>'}],['A closing tag cannot skip the most recent opening tag',{code:'<ROOT><INNER>notes</ROOT></INNER>'}],['A second complete root is still invalid',{code:'<ONE>first</ONE><TWO>second</TWO>'}],['An unterminated CDATA section never becomes ordinary text',{code:'<ROOT><![CDATA[unfinished data</ROOT>'}]],
592:[['Several signed denominators require repeated exact reductions',{expression:'7/8-2/3+5/6-3/10+1/4-9/10'}],['Complete cancellation normalizes the denominator to one',{expression:'3/7+2/7-5/7'}],['A negative result keeps the sign in the numerator',{expression:'1/9-7/9'}],['An improper fraction can reduce to an integer',{expression:'8/3+7/3'}]],
};
function validate(id,input){if(id===591){if(typeof input.code!=='string'||input.code.length<1||input.code.length>500)throw new Error('Use a markup string of 1-500 characters; invalid markup is a valid test input.');}else{const text=input.expression;if(typeof text!=='string'||!/^[-+]?(?:10|[1-9])\/(?:10|[1-9])(?:[+-](?:10|[1-9])\/(?:10|[1-9]))*$/.test(text)||[...text.matchAll(/\//g)].length>20)throw new Error('Use up to twenty signed fractions with numerator and denominator from 1 to 10, no spaces.');}return input;}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{591:{cdata:2,open:4,close:4,text:1},592:{reduce:4}},tags:{591:['String','Stack'],592:['Math','String']}};
