const specs={
600:['n','Count nonnegative integers at most n whose binary digits never contain adjacent ones.','Precompute counts of valid suffixes by length. Scan the upper bound from its highest bit: whenever it has a one, replacing that bit with zero admits every valid suffix. Two consecutive ones end the remaining equal-prefix branch.','precompute valid binary suffix counts using the Fibonacci recurrence|scan n from the most significant bit|at a one bit add all suffixes under the smaller zero branch|stop if the equal-prefix branch contains consecutive ones|otherwise include n itself and return the count','O(log n) time and O(log n) space.'],
604:['compressedString operations','Read a run-length encoded string one character at a time without expanding it.','Keep a cursor into the encoded text and a remaining count for the current character. Load a new run only after the previous count reaches zero. Exhausted next calls return one space; hasNext never consumes a character.','start before the first run with zero remaining copies|on next load a character and its full decimal count if needed|return one copy and decrement the remaining count|answer hasNext from remaining copies or unread runs|return all operation results','O(encoded length + operations) total time and O(1) iterator space excluding output.'],
609:['paths','Group file paths whose stored contents are identical.','Parse each directory record into file names and their parenthesized contents. Contents become hash keys; append full paths to their group and emit only groups containing at least two files.','start a content-to-paths map|parse directory records and each file-content token|append the full file path to its content group|discard groups containing only one path|return all duplicate-content groups','O(total input characters) expected time and stored text space.'],
616:['s words','Wrap matching substrings in the fewest bold-tag ranges, merging overlaps and adjacency.','At each character, extend the farthest match end from dictionary words beginning there. A coverage mask marks the union of matches; open and close tags only when that mask changes.','scan every text position for dictionary matches|mark every character covered by at least one match|open a bold tag when entering covered text|close it when leaving covered text so touching matches merge|return the marked-up string','O(text length * total dictionary characters + text length^2) bounded reference time; O(text length) mask space.'],
625:['num','Find the smallest positive 32-bit integer whose decimal digits multiply to num.','Factor the target using digits nine down to two, which minimizes the number of digits. Reverse the collected digits into increasing order to minimize the integer. A leftover factor or overflow makes the answer impossible.','handle a single-digit target directly|divide out factors from nine down to two|reject a remaining factor greater than one|reverse the factors to form the smallest decimal integer|return zero if it exceeds the signed 32-bit maximum','O(log num) divisions and digit space.'],
};
const solvers={
600({n},emit){const bits=n.toString(2),counts=[1,2];for(let i=2;i<=bits.length;i++)counts[i]=counts[i-1]+counts[i-2];let answer=0,previous=0;for(let index=0;index<bits.length;index++){const bit=Number(bits[index]),remaining=bits.length-index-1;if(bit){answer+=counts[remaining];emit('Choosing zero instead of this bound bit makes the prefix smaller. Every valid suffix of the remaining length is now allowed.',{sequence:bits.split(''),index,table:counts.map((ways,length)=>[length,ways]),tableHeaders:['Suffix length','Valid binary suffixes'],codeStage:'branch',metrics:{remaining,added:counts[remaining],count:answer}},'update');if(previous){emit('The equal-prefix branch now contains adjacent ones. All valid smaller branches have already been counted.',{sequence:bits.split(''),index,codeStage:'stop',metrics:{count:answer}},'inspect');return answer;}}previous=bit;}return answer+1;},
604({compressedString,operations},emit){let cursor=0,remaining=0,current='';const answer=[];for(let i=0;i<operations.length;i++){const type=operations[i];let result;if(type==='hasNext')result=remaining>0||cursor<compressedString.length;else if(remaining===0&&cursor===compressedString.length)result=' ';else{if(remaining===0){current=compressedString[cursor++];const start=cursor;while(cursor<compressedString.length&&/\d/.test(compressedString[cursor]))cursor++;remaining=Number(compressedString.slice(start,cursor));}remaining--;result=current;}answer.push(result);emit(type==='hasNext'?'Inspect whether the current run has copies left or another encoded run remains. The cursor and remaining count do not change.':result===' '?'The iterator is exhausted. Return one space without advancing past the end.':'Return exactly one character, reducing only its run count. Parse the next run lazily when needed.',{sequence:compressedString.split(''),index:cursor,output:[...answer],codeStage:type,metrics:{operation:i+1,current:current||'none',remaining,cursor}},'update');}return answer;},
609({paths},emit){const groups=new Map();for(let index=0;index<paths.length;index++){const[directory,...files]=paths[index].split(' ');for(const file of files){const split=file.indexOf('('),name=file.slice(0,split),content=file.slice(split+1,-1),path=`${directory}/${name}`;if(!groups.has(content))groups.set(content,[]);groups.get(content).push(path);emit('Identical content joins the same group regardless of directory or filename. A group becomes a duplicate group as soon as it contains two paths.',{sequence:paths,index,table:[...groups].map(([text,items])=>[text,items.length,items.join(', ')]),tableHeaders:['Content','Files','Full paths'],codeStage:'group',metrics:{path,groupSize:groups.get(content).length}},'update');}}return [...groups.values()].filter(items=>items.length>1);},
616({s,words},emit){const covered=Array(s.length).fill(false);for(let i=0;i<s.length;i++){let end=i;const matched=[];for(const word of words)if(s.startsWith(word,i)){end=Math.max(end,i+word.length);matched.push(word);}for(let j=i;j<end;j++)covered[j]=true;emit(matched.length?'These matches extend the union of covered characters. Overlapping matches share coverage instead of creating nested tags.':'No dictionary word begins here. Coverage from an earlier overlapping match still remains.',{sequence:s.split(''),index:i,marks:Object.fromEntries(covered.map((yes,j)=>[j,yes?'bold':'plain'])),output:covered.map(v=>v?'B':'·'),codeStage:'cover',metrics:{position:i,matches:matched.join(', ')||'none',farthestEnd:end}},'update');}let answer='';for(let i=0;i<s.length;i++){if(covered[i]&&(i===0||!covered[i-1]))answer+='<b>';answer+=s[i];if(covered[i]&&(i===s.length-1||!covered[i+1]))answer+='</b>';}emit('Create tags only at coverage boundaries. Adjacent matches form one continuous bold run.',{sequence:s.split(''),output:[answer],codeStage:'render'},'update');return answer;},
625({num},emit){if(num<10)return num;let remaining=num;const digits=[];for(let digit=9;digit>=2;digit--)while(remaining%digit===0){remaining/=digit;digits.push(digit);emit('Use a large single-digit factor to pack the product into fewer decimal places. Final ascending order will minimize the resulting integer.',{sequence:[...digits],codeStage:'factor',metrics:{factor:digit,remaining,chosenDigits:digits.length}},'update');}if(remaining!==1){emit('A remaining prime factor cannot be expressed by any decimal digit from two to nine.',{sequence:digits,codeStage:'impossible',metrics:{remaining}},'inspect');return 0;}const result=Number(digits.reverse().join(''));emit('Place the selected factors in ascending order, then enforce the signed 32-bit result limit.',{sequence:digits,codeStage:'assemble',metrics:{candidate:String(result),withinLimit:result<=2147483647}},'update');return result<=2147483647?result:0;},
};
const python={
600:`def findIntegers(n):
    bits = bin(n)[2:]
    suffix = [1, 2]
    for length in range(2, len(bits) + 1):
        suffix.append(suffix[-1] + suffix[-2])
    answer, previous = 0, 0
    for index, character in enumerate(bits):
        bit = int(character)
        if bit:
            answer += suffix[len(bits) - index - 1]  # step: branch
            if previous:
                return answer  # step: stop
        previous = bit
    return answer + 1  # step: return`,
604:`class StringIterator:
    def __init__(self, compressedString):
        self.text = compressedString
        self.cursor, self.remaining, self.character = 0, 0, ''

    def next(self):
        if not self.hasNext():
            return ' '
        if self.remaining == 0:
            self.character = self.text[self.cursor]
            self.cursor += 1
            start = self.cursor
            while self.cursor < len(self.text) and self.text[self.cursor].isdigit():
                self.cursor += 1
            self.remaining = int(self.text[start:self.cursor])
        self.remaining -= 1  # step: next
        return self.character

    def hasNext(self):
        return self.remaining > 0 or self.cursor < len(self.text)  # step: hasNext

def simulateIterator(compressedString, operations):
    iterator = StringIterator(compressedString)
    return [getattr(iterator, operation)() for operation in operations]  # step: return`,
609:`def findDuplicate(paths):
    groups = {}
    for record in paths:
        directory, *files = record.split(' ')
        for file in files:
            name, content = file.split('(', 1)
            content = content[:-1]
            groups.setdefault(content, []).append(directory + '/' + name)  # step: group
    return [group for group in groups.values() if len(group) > 1]  # step: return`,
616:`def addBoldTag(s, words):
    covered = [False] * len(s)
    for index in range(len(s)):
        end = index
        for word in words:
            if s.startswith(word, index):
                end = max(end, index + len(word))
        for cursor in range(index, end):
            covered[cursor] = True  # step: cover
    answer = []
    for index, character in enumerate(s):
        if covered[index] and (index == 0 or not covered[index - 1]):
            answer.append('<b>')
        answer.append(character)
        if covered[index] and (index == len(s) - 1 or not covered[index + 1]):
            answer.append('</b>')  # step: render
    return ''.join(answer)  # step: return`,
625:`def smallestFactorization(num):
    if num < 10:
        return num  # step: small
    remaining, digits = num, []
    for digit in range(9, 1, -1):
        while remaining % digit == 0:
            remaining //= digit
            digits.append(digit)  # step: factor
    if remaining != 1:
        return 0  # step: impossible
    answer = int(''.join(map(str, reversed(digits))))  # step: assemble
    return answer if answer <= 2147483647 else 0  # step: return`,
};
const cases={
600:[['Several one bits contribute smaller-prefix branches',{n:674}],['Consecutive leading ones end the equal-prefix scan early',{n:203}],['The smallest positive bound includes zero and one',{n:1}],['An alternating bound is itself valid and must be included',{n:341}]],
604:[['Read across run boundaries and inspect without consuming',{compressedString:'R3e2d1B4',operations:['hasNext','next','next','hasNext','next','next','next','next','next','next','next','next','hasNext','next']}],['A multi-digit count is loaded as one number',{compressedString:'Q12z1',operations:['next','next','hasNext','next','next']}],['Repeated reads after exhaustion return one space each',{compressedString:'x1',operations:['next','next','hasNext','next']}],['Repeated availability queries leave the first character untouched',{compressedString:'M2n3',operations:['hasNext','hasNext','hasNext','next','hasNext']}]],
609:[['Content groups cross directories and filenames',{paths:['archive/sketch a.txt(blue) b.txt(green) c.txt(amber)','archive/final cover.txt(blue) notes.txt(gray)','backup x.txt(green) y.txt(blue) z.txt(violet)']}],['Identical filenames with different contents are not duplicates',{paths:['one report.txt(red)','two report.txt(teal)']}],['Duplicates can share one directory',{paths:['lab a.txt(orbit) b.txt(orbit) c.txt(orbit)']}],['Every distinct content group can remain a singleton',{paths:['desk first.txt(sun) second.txt(moon)','shelf third.txt(star)']}]],
616:[['Overlapping and touching matches form several merged runs',{s:'starlightstar-mapmoonbeam',words:['star','light','tstar','moon','beam']}],['Adjacent matches share one pair of tags',{s:'redbluegold',words:['red','blue','gold']}],['No matching word leaves the text unchanged',{s:'quietforest',words:['river','cloud']}],['Repeated overlapping matches cover the entire text',{s:'aaaaaaa',words:['aa','aaaa']}]],
625:[['Several composite digit factors minimize the number of places',{num:4032}],['A remaining large prime makes factorization impossible',{num:97}],['The multiplicative identity is already one digit',{num:1}],['Valid factors can still exceed the result integer limit',{num:1073741824}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);};if(id===600||id===625){const value=id===600?input.n:input.num;need(Number.isInteger(value)&&value>=1&&value<=(id===600?1000000000:2147483647),'Use a positive integer within the problem bound.');}if(id===604){need(typeof input.compressedString==='string'&&/^(?:[A-Za-z][1-9][0-9]*)+$/.test(input.compressedString)&&input.compressedString.length<=150,'Use letter/positive-count runs, at most 150 encoded characters.');need([...input.compressedString.matchAll(/\d+/g)].every(m=>Number(m[0])<=1000000000),'Each run count must be at most one billion.');need(Array.isArray(input.operations)&&input.operations.length>=1&&input.operations.length<=80&&input.operations.every(op=>op==='next'||op==='hasNext'),'Use 1-80 next or hasNext operations.');}if(id===609){need(Array.isArray(input.paths)&&input.paths.length>=1&&input.paths.length<=20,'Use 1-20 directory records.');const full=new Set();for(const record of input.paths){need(typeof record==='string'&&record.length<=400&&/^[A-Za-z0-9_/-]+(?: [A-Za-z0-9_.-]+\([A-Za-z0-9]+\))+$/.test(record),'Use directory followed by space-separated filename(content) tokens with alphanumeric content.');const[directory,...files]=record.split(' ');for(const file of files){const path=directory+'/'+file.slice(0,file.indexOf('('));need(!full.has(path),'Each full file path must occur only once.');full.add(path);}}}if(id===616){need(typeof input.s==='string'&&/^[A-Za-z0-9 -]{1,160}$/.test(input.s),'Use 1-160 plain text characters from letters, digits, spaces, and hyphens.');need(Array.isArray(input.words)&&input.words.length<=30&&input.words.every(word=>typeof word==='string'&&word.length>=1&&word.length<=40),'Use up to 30 nonempty words of at most 40 characters.');}return input;}
export default {specs,solvers,python,cases,validate,resultStage:(id,result,input)=>id===600&&input.n.toString(2).includes('11')?'stop':id===625&&input.num<10?'small':'return',pseudocodeStages:{600:{branch:3,stop:4},604:{next:3,hasNext:4},609:{group:3},616:{cover:2,render:4},625:{factor:2,impossible:3,assemble:4,small:1}},tags:{600:['Dynamic Programming','Bit Manipulation'],604:['Design','String'],609:['Hash Table','String'],616:['String'],625:['Math','Greedy']}};
