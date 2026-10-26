const specs={
2114:['sentences','Find the largest word count among the supplied sentences.','With one space between nonempty words, the number of words is one plus the number of spaces. Compare each sentence count against the best so far.','visit each sentence|count its separating spaces|add one for the first word|update the largest count|return the maximum words in any sentence','O(total characters) time; O(1) auxiliary space.'],
2115:['recipes ingredients supplies','Find all recipes that can eventually be prepared from the initial supplies.','Ingredients become available events. Track each recipe unresolved count and reverse dependencies; when its count reaches zero, that recipe becomes a new available ingredient.','build ingredient-to-recipe dependencies and missing counts|enqueue initially available supplies|deliver each available ingredient to its dependent recipes|enqueue recipes whose missing count reaches zero|return every recipe made available','O(total ingredient references+supplies+recipes) time and space.'],
2116:['s locked','Decide whether changing unlocked parentheses can produce a valid string.','Every prefix must be able to provide enough opens, and every suffix enough closes. Treat unlocked positions as the helpful direction in each scan; even length plus both capacity checks is sufficient.','reject odd-length strings|scan left to right treating unlocked positions as opens|reject a prefix with too many unavoidable closes|scan right to left treating unlocked positions as closes|return whether both directional checks succeed','O(n) time; O(1) auxiliary space.'],
2119:['num','Determine whether reversing decimal digits twice restores the original number.','The first reversal drops original trailing zeros because they become leading zeros. Other digits survive both reversals; zero itself is a special preserved value.','read the original number|check whether it is zero|otherwise inspect its final decimal digit|accept exactly when no trailing zero is lost|return whether double reversal preserves the number','O(1) arithmetic time and space.'],
2120:['n startPos s','For every instruction suffix, count moves before leaving the grid.','Restart at the original position for each suffix. Simulate the next requested move before accepting it, and stop immediately when that move crosses a boundary.','choose each instruction suffix|reset the robot to the starting cell|compute the next instructed position|stop at the first boundary crossing and record accepted moves|return one move count for every suffix','O(m^2) time; O(m) output space.'],
2121:['arr','For each position, sum its distances to positions with the same value.','A forward pass adds distances to equal values on the left using count and index sum. A backward pass adds the corresponding right-side distances without comparing every pair.','track prior occurrence counts and index sums|add left-side distances as index times count minus index sum|scan backward with fresh counts and sums|add right-side distances as index sum minus index times count|return every position total','O(n) expected time and O(n) space.'],
2122:['nums','Recover an array whose values produced the shuffled lower and higher observations.','The smallest observation must be a lower value. Try each positive even difference as twice k, then greedily pair the smallest remaining observation with its partner that difference above it.','sort the observations and propose positive even differences from the minimum|start a fresh occurrence counter for each candidate difference|pair each smallest remaining lower value with lower plus the difference|reject candidates with missing partners and keep complete pairings|return the recovered midpoints for a successful candidate','O(n^2+n log n) time; O(n) counter space.'],
2124:['s','Check that no a appears after any b.','Once the scan enters the b suffix, another a violates the required order. A string containing only one letter type satisfies the rule.','start before the b suffix|scan each letter|remember when the first b appears|reject any subsequent a|return whether the order is valid','O(n) time; O(1) space.'],
2125:['bank','Count beams between consecutive nonempty device rows.','Empty rows do not block beams. Every device in one nonempty row connects to every device in the next nonempty row, contributing the product of their counts.','count devices in each row|ignore empty rows while retaining the previous nonempty count|multiply consecutive nonempty row counts|add that product and advance the previous count|return the total beams','O(rows*columns) time; O(1) counting space.'],
2126:['mass asteroids','Determine whether an asteroid can absorb every incoming asteroid.','Absorbing a smaller asteroid only increases mass, so process the smallest remaining one first. If even that one is too heavy, no other remaining choice can help.','sort incoming asteroid masses ascending|compare the smallest remaining asteroid with current mass|fail if it is heavier than the current asteroid|otherwise absorb it and increase mass|return whether all incoming asteroids are absorbed','O(n log n) time; O(n) sorting space.'],
2129:['title','Capitalize title words according to their lengths.','Normalize every word to lowercase first. Words longer than two letters then uppercase only their first letter; short words remain entirely lowercase.','split the title into words|lowercase each complete word|uppercase its first letter only when length exceeds two|append the normalized word|join words with single spaces','O(n) time and output space.'],
};
const solvers={
2114({sentences},emit){let best=0;for(let i=0;i<sentences.length;i++){const count=1+[...sentences[i]].filter(c=>c===' ').length;best=Math.max(best,count);emit('Each separating space introduces one additional word after the first. Compare this complete sentence count with the best seen so far.',{index:i,sequence:sentences,codeStage:'update',metrics:{sentence:i+1,words:count,best}},'update');}return best;},
2115({recipes,ingredients,supplies},emit){const dependents=new Map(),remaining=ingredients.map(row=>row.length),queue=[...supplies],answer=[];ingredients.forEach((row,i)=>row.forEach(ingredient=>{if(!dependents.has(ingredient))dependents.set(ingredient,[]);dependents.get(ingredient).push(i);}));for(let at=0;at<queue.length;at++){const ingredient=queue[at],unlocked=[];for(const recipe of dependents.get(ingredient)||[]){remaining[recipe]--;if(remaining[recipe]===0){queue.push(recipes[recipe]);answer.push(recipes[recipe]);unlocked.push(recipes[recipe]);}}emit('Deliver this available ingredient once to every recipe that requires it. A recipe becomes available only when all dependencies are resolved; cycles without a supplied entry point remain blocked.',{sequence:queue,index:at,table:recipes.map((name,i)=>[name,ingredients[i].join(', '),remaining[i],remaining[i]===0]),tableHeaders:['Recipe','Required ingredients','Unresolved','Available'],output:[...answer],codeStage:'deliver',metrics:{ingredient,newlyAvailable:unlocked.join(', ')||'none',pending:queue.length-at-1}},'update');}return answer;},
2116({s,locked},emit){if(s.length%2){emit('Every valid parentheses string consists of pairs, so an odd length cannot be repaired.',{codeStage:'odd',metrics:{length:s.length}});return false;}for(const reverse of [false,true]){let capacity=0;for(let step=0;step<s.length;step++){const i=reverse?s.length-1-step:step,helpful=locked[i]==='0'||s[i]===(reverse?')':'(');capacity+=helpful?1:-1;emit('An unlocked character supplies the helpful direction for this capacity check. Negative capacity proves that this prefix or suffix contains too many unavoidable opposite parentheses.',{sequence:[...s],index:i,marks:Object.fromEntries([...locked].map((v,j)=>[j,v==='0'?'editable':'locked'])),codeStage:reverse?'backward':'forward',metrics:{direction:reverse?'right to left':'left to right',capacity,possible:capacity>=0}},'update');if(capacity<0){emit('This directional deficit cannot be repaired by characters beyond the checked boundary.',{index:i,codeStage:reverse?'suffix_failed':'failed',metrics:{direction:reverse?'suffix':'prefix',capacity}});return false;}}}return true;},
2119({num},emit){const preserved=num===0||num%10!==0;emit('Trailing zeros disappear when reversal makes them leading zeros. Zero itself remains zero, while a nonzero final digit preserves every decimal position through both reversals.',{sequence:[...String(num)],index:String(num).length-1,codeStage:'decide',metrics:{num,isZero:num===0,lastDigit:num%10,preserved}},'update');return preserved;},
2120({n,startPos,s},emit){const directions={L:[0,-1],R:[0,1],U:[-1,0],D:[1,0]},answer=[];for(let start=0;start<s.length;start++){let[row,column]=startPos,moves=0;for(let i=start;i<s.length;i++){const[dr,dc]=directions[s[i]],nextRow=row+dr,nextColumn=column+dc,inside=nextRow>=0&&nextRow<n&&nextColumn>=0&&nextColumn<n;if(inside){row=nextRow;column=nextColumn;moves++;}emit(inside?'Accept this move because its destination remains inside the grid.':'The next move would leave the grid, so this suffix stops before executing it.',{sequence:[...s],index:i,window:[start,i],matrix:Array.from({length:n},()=>Array(n).fill('')),cell:[row,column],output:[...answer],codeStage:inside?'move':'boundary',metrics:{suffixStart:start,instruction:s[i],row,column,attemptedRow:nextRow,attemptedColumn:nextColumn,acceptedMoves:moves}},'update');if(!inside)break;}answer.push(moves);}return answer;},
2121({arr},emit){const answer=arr.map(()=>0);for(const reverse of [false,true]){const counts=new Map(),sums=new Map();for(let step=0;step<arr.length;step++){const i=reverse?arr.length-1-step:step,value=arr[i],count=counts.get(value)||0,sum=sums.get(value)||0,added=reverse?sum-i*count:i*count-sum;answer[i]+=added;counts.set(value,count+1);sums.set(value,sum+i);emit('Equal-value positions are summarized by their count and index sum. One multiplication and subtraction add all distances from the already visited side.',{index:i,output:[...answer],table:[...counts].map(([v,c])=>[v,c,sums.get(v)]),tableHeaders:['Value','Visited count','Index sum'],codeStage:reverse?'right':'left',metrics:{direction:reverse?'right side':'left side',value,priorCount:count,priorIndexSum:sum,added,totalAtIndex:answer[i]}},'update');}}return answer;},
2122({nums},emit){const ordered=[...nums].sort((a,b)=>a-b),attempted=new Set();for(let candidate=1;candidate<ordered.length;candidate++){const difference=ordered[candidate]-ordered[0];if(difference<=0||difference%2||attempted.has(difference))continue;attempted.add(difference);const counts=new Map(),answer=[];ordered.forEach(v=>counts.set(v,(counts.get(v)||0)+1));let valid=true;for(const lower of ordered){if(!counts.get(lower))continue;const higher=lower+difference,exists=(counts.get(higher)||0)>0;if(!exists){emit('This smallest remaining lower observation has no matching higher observation, so the candidate difference is impossible.',{sequence:ordered,codeStage:'reject',metrics:{difference,k:difference/2,lower,missingPartner:higher}});valid=false;break;}counts.set(lower,counts.get(lower)-1);counts.set(higher,counts.get(higher)-1);answer.push(lower+difference/2);emit('The smallest unused observation must be a lower value. Consume it and exactly one higher partner, then recover their midpoint.',{sequence:ordered,table:[...counts],tableHeaders:['Observation','Unused count'],output:[...answer],codeStage:'pair',metrics:{difference,k:difference/2,lower,higher,recovered:answer.at(-1)}},'update');}if(valid){emit('Every observation has been paired using one positive k, so these midpoints form a valid recovered array.',{output:answer,codeStage:'found',metrics:{k:difference/2,recovered:answer.length}},'update');return answer;}}throw new Error('No positive integer k can pair these observations.');},
2124({s},emit){let seenB=false;for(let i=0;i<s.length;i++){if(s[i]==='b')seenB=true;const bad=s[i]==='a'&&seenB;emit('After the first b, the scan is in the required b-only suffix. An a here would violate the ordering.',{index:i,codeStage:bad?'failed':'scan',metrics:{letter:s[i],seenB,violation:bad}},'update');if(bad)return false;}return true;},
2125({bank},emit){let previous=0,total=0;for(let row=0;row<bank.length;row++){const devices=[...bank[row]].filter(c=>c==='1').length,added=devices?previous*devices:0;total+=added;emit(devices?'Every device connects to every device in the previous nonempty row, producing their count product.':'An empty row neither contributes beams nor replaces the previous nonempty row.',{matrix:bank.map(r=>[...r]),cell:[row,0],codeStage:'update',metrics:{row,devices,previousNonemptyCount:previous,added,total}},'update');if(devices)previous=devices;}return total;},
2126({mass,asteroids},emit){const ordered=[...asteroids].sort((a,b)=>a-b);for(let i=0;i<ordered.length;i++){if(ordered[i]>mass){emit('Even the smallest remaining asteroid is too massive. Choosing a larger remaining asteroid cannot rescue this state.',{sequence:ordered,index:i,codeStage:'failed',metrics:{mass,nextAsteroid:ordered[i]}});return false;}const before=mass;mass+=ordered[i];emit('Absorb the smallest remaining asteroid safely. Its mass increases the capacity available for every later collision.',{sequence:ordered,index:i,codeStage:'absorb',metrics:{before,absorbed:ordered[i],mass}},'update');}return true;},
2129({title},emit){const words=title.split(' '),answer=[];for(let i=0;i<words.length;i++){const lower=words[i].toLowerCase(),normalized=lower.length>2?lower[0].toUpperCase()+lower.slice(1):lower;answer.push(normalized);emit('Lowercase the whole word before applying the length rule. This removes old mixed capitalization even from letters that are not first.',{sequence:words,index:i,output:[...answer],codeStage:'normalize',metrics:{original:words[i],length:lower.length,normalized}},'update');}return answer.join(' ');},
};
const python={
2114:`def mostWordsFound(sentences):
    best = 0
    for sentence in sentences:
        count = 1 + sentence.count(' ')
        best = max(best, count)  # step: update
    return best  # step: return`,
2115:`def findAllRecipes(recipes, ingredients, supplies):
    from collections import defaultdict, deque
    dependents = defaultdict(list)
    remaining = [len(row) for row in ingredients]
    for recipe, row in enumerate(ingredients):
        for ingredient in row:
            dependents[ingredient].append(recipe)
    queue, answer = deque(supplies), []
    while queue:
        ingredient = queue.popleft()
        for recipe in dependents[ingredient]:
            remaining[recipe] -= 1
            if remaining[recipe] == 0:
                queue.append(recipes[recipe])
                answer.append(recipes[recipe])
        # step: deliver
    return answer  # step: return`,
2116:`def canBeValid(s, locked):
    if len(s) % 2:
        return False  # step: odd
    capacity = 0
    for i, letter in enumerate(s):
        capacity += 1 if locked[i] == '0' or letter == '(' else -1  # step: forward
        if capacity < 0:
            return False  # step: failed
    capacity = 0
    for i in range(len(s) - 1, -1, -1):
        capacity += 1 if locked[i] == '0' or s[i] == ')' else -1  # step: backward
        if capacity < 0:
            return False  # step: suffix_failed
    return True  # step: return`,
2119:`def isSameAfterReversals(num):
    preserved = num == 0 or num % 10 != 0  # step: decide
    return preserved  # step: return`,
2120:`def executeInstructions(n, startPos, s):
    directions = {'L': (0, -1), 'R': (0, 1), 'U': (-1, 0), 'D': (1, 0)}
    answer = []
    for start in range(len(s)):
        row, column = startPos
        moves = 0
        for instruction in s[start:]:
            dr, dc = directions[instruction]
            next_row, next_column = row + dr, column + dc
            if not (0 <= next_row < n and 0 <= next_column < n):
                break  # step: boundary
            row, column = next_row, next_column
            moves += 1  # step: move
        answer.append(moves)
    return answer  # step: return`,
2121:`def getDistances(arr):
    answer = [0] * len(arr)
    counts, sums = {}, {}
    for i, value in enumerate(arr):
        count, index_sum = counts.get(value, 0), sums.get(value, 0)
        answer[i] += i * count - index_sum
        counts[value], sums[value] = count + 1, index_sum + i  # step: left
    counts, sums = {}, {}
    for i in range(len(arr) - 1, -1, -1):
        value = arr[i]
        count, index_sum = counts.get(value, 0), sums.get(value, 0)
        answer[i] += index_sum - i * count
        counts[value], sums[value] = count + 1, index_sum + i  # step: right
    return answer  # step: return`,
2122:`def recoverArray(nums):
    from collections import Counter
    ordered, attempted = sorted(nums), set()
    for candidate in ordered[1:]:
        difference = candidate - ordered[0]
        if difference <= 0 or difference % 2 or difference in attempted:
            continue
        attempted.add(difference)
        counts, answer = Counter(ordered), []
        valid = True
        for lower in ordered:
            if counts[lower] == 0:
                continue
            higher = lower + difference
            if counts[higher] == 0:
                valid = False  # step: reject
                break
            counts[lower] -= 1
            counts[higher] -= 1
            answer.append(lower + difference // 2)  # step: pair
        if valid:
            return answer  # step: found
    raise ValueError('Observations cannot be paired using a positive integer k.')`,
2124:`def checkString(s):
    seen_b = False
    for letter in s:
        if letter == 'b':
            seen_b = True
        if letter == 'a' and seen_b:
            return False  # step: failed
        # step: scan
    return True  # step: return`,
2125:`def numberOfBeams(bank):
    previous = total = 0
    for row in bank:
        devices = row.count('1')
        if devices:
            total += previous * devices
            previous = devices
        # step: update
    return total  # step: return`,
2126:`def asteroidsDestroyed(mass, asteroids):
    for asteroid in sorted(asteroids):
        if asteroid > mass:
            return False  # step: failed
        mass += asteroid  # step: absorb
    return True  # step: return`,
2129:`def capitalizeTitle(title):
    answer = []
    for word in title.split(' '):
        lower = word.lower()
        normalized = lower[0].upper() + lower[1:] if len(lower) > 2 else lower
        answer.append(normalized)  # step: normalize
    return ' '.join(answer)  # step: return`,
};
const cases={
2114:[['Several original sentences have different lengths',{sentences:['lanterns glow beside the quiet river','we carry warm bread through the old garden gate','rain arrives','small boats drift beneath silver clouds']}],['One word is still one complete sentence',{sentences:['harbor']}],['Equal word counts share the maximum',{sentences:['green leaves sway','bright stars shine','calm waters ripple']}],['A later sentence establishes the maximum',{sentences:['we wait','birds sing nearby','a winding path reaches the distant village']}]],
2115:[['Independent dishes feed several layers of dependent recipes',{recipes:['dough','sauce','flatbread','meal','feast'],ingredients:[['flour','water'],['tomato','salt'],['dough','sauce'],['flatbread','herbs'],['meal','fruit']],supplies:['flour','water','tomato','salt','herbs','fruit']}],['A dependency cycle cannot create its own starting ingredient',{recipes:['stew','broth'],ingredients:[['broth','salt'],['stew','water']],supplies:['salt','water']}],['A missing raw ingredient blocks only its dependent branch',{recipes:['tea','toast','snack'],ingredients:[['water','leaf'],['bread'],['tea','toast']],supplies:['water','leaf']}],['One supplied ingredient unlocks several recipes',{recipes:['crunch','crumb','mix'],ingredients:[['grain'],['grain'],['crunch','crumb']],supplies:['grain']}]],
2116:[['Editable positions can repair several internal imbalances',{s:')(()))(()(',locked:'0011010000'}],['Odd length cannot be repaired',{s:'(()',locked:'000'}],['A locked closing prefix fails the forward check',{s:')(',locked:'10'}],['A locked opening suffix fails the backward check',{s:'((',locked:'01'}]],
2119:[['Internal zeros survive both reversals',{num:5070309}],['Trailing zeros are lost permanently',{num:48200}],['Zero remains zero',{num:0}],['A single nonzero digit is unchanged',{num:7}]],
2120:[['Every suffix restarts before a long winding route',{n:5,startPos:[2,1],s:'RRDDLUURRDDLLUU'}],['A one-cell grid rejects every first move',{n:1,startPos:[0,0],s:'RDLU'}],['Instructions immediately point outside the top boundary',{n:4,startPos:[0,2],s:'UUURD'}],['A short loop stays inside until its later boundary move',{n:3,startPos:[1,1],s:'RDLURR'}]],
2121:[['Interleaved repeated groups accumulate left and right distances',{arr:[7,3,7,9,3,7,4,9,7,3,4,7]}],['Distinct values have no matching partners',{arr:[2,5,8,11,14]}],['Every position belongs to one large group',{arr:[6,6,6,6,6]}],['A singleton has zero total distance',{arr:[19]}]],
2122:[['Shuffled observations include overlapping lower and higher values',{nums:[24,3,15,26,11,18,6,23,16,14]}],['Repeated original values require occurrence counts',{nums:[13,7,13,7,13,7]}],['Only two observations recover one midpoint',{nums:[18,10]}],['A smaller even candidate fails before the valid pairing',{nums:[1,5,7,9,11,15]}]],
2124:[['A long a prefix is followed by a b suffix',{s:'aaaaaaaabbbbbbb'}],['An a after several bs breaks the order',{s:'aaabbbabbb'}],['Only a letters satisfies the rule',{s:'aaaaaa'}],['Only b letters satisfies the rule',{s:'bbbbbbbb'}]],
2125:[['Empty rows separate several nonempty device rows',{bank:['1010101','0000000','1100010','0000000','0011100','1000001']}],['A single nonempty row cannot form a beam',{bank:['0000','1011','0000']}],['No devices produce no beams',{bank:['000','000','000']}],['One-column devices connect across empty rows',{bank:['1','0','1','1','0','1']}]],
2126:[['Small absorptions grow enough mass for much larger arrivals',{mass:6,asteroids:[34,3,18,7,2,11,55,4]}],['Even the smallest arrival is too heavy',{mass:3,asteroids:[9,5,12]}],['Equal mass can be absorbed',{mass:8,asteroids:[8]}],['A later gap remains too large after small absorptions',{mass:2,asteroids:[1,2,3,40]}]],
2129:[['Mixed case and short connectors follow different rules',{title:'a QUIET riVER OF bRIGHT lanTERNS IN the NIGHT'}],['One-letter and two-letter words stay lowercase',{title:'A I To OF BY aN'}],['A single long word is normalized',{title:'hARBOR'}],['Already normalized words remain stable',{title:'Green Leaves in the Garden'}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=80)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  const names=v=>Array.isArray(v)&&v.length>=1&&v.length<=30&&v.every(w=>typeof w==='string'&&/^[a-z]{1,20}$/.test(w))&&new Set(v).size===v.length;
  if(id===2114)need(Array.isArray(input.sentences)&&input.sentences.length>=1&&input.sentences.length<=20&&input.sentences.every(s=>typeof s==='string'&&s.length<=180&&/^[a-z]+(?: [a-z]+)*$/.test(s)),'Use 1-20 lowercase sentences with single spaces and no surrounding whitespace.');
  if(id===2115)need(names(input.recipes)&&names(input.supplies)&&Array.isArray(input.ingredients)&&input.ingredients.length===input.recipes.length&&input.ingredients.every(names)&&input.recipes.every(name=>!input.supplies.includes(name)),'Use unique recipe and supply names, disjoint from each other, and one nonempty unique ingredient list per recipe; at most 30 entries per list.');
  if(id===2116)need(typeof input.s==='string'&&/^[()]{1,100}$/.test(input.s)&&typeof input.locked==='string'&&/^[01]+$/.test(input.locked)&&input.locked.length===input.s.length,'Use 1-100 parentheses and an equally long binary lock mask.');
  if(id===2119)need(integer(input.num,0,1000000000),'Use an integer from zero through one billion.');
  if(id===2120)need(integer(input.n,1,8)&&Array.isArray(input.startPos)&&input.startPos.length===2&&input.startPos.every(v=>integer(v,0,input.n-1))&&typeof input.s==='string'&&/^[LRUD]{1,30}$/.test(input.s),'Use a 1-8 square grid, a valid [row,column] start, and 1-30 direction letters.');
  if(id===2121)need(vector(input.arr,1),'Use 1-80 positive values.');
  if(id===2122)need(vector(input.nums,1,24)&&input.nums.length%2===0,'Use an even number of positive observations, at most 24, generated using a common positive integer k.');
  if(id===2124)need(typeof input.s==='string'&&/^[ab]{1,120}$/.test(input.s),'Use 1-120 a/b letters.');
  if(id===2125)need(Array.isArray(input.bank)&&input.bank.length>=1&&input.bank.length<=12&&input.bank.every(row=>typeof row==='string'&&/^[01]{1,16}$/.test(row)&&row.length===input.bank[0].length),'Use 1-12 equal-width binary rows with at most 16 columns.');
  if(id===2126)need(integer(input.mass,1)&&vector(input.asteroids,1),'Use positive initial mass and 1-80 positive asteroid masses, each at most one million.');
  if(id===2129)need(typeof input.title==='string'&&input.title.length<=180&&/^[a-zA-Z]+(?: [a-zA-Z]+)*$/.test(input.title),'Use 1-180 letters and single spaces without surrounding whitespace.');
  return input;
}
export default {specs,solvers,python,cases,validate,resultStage:(id,result,input)=>id===2116&&!result?(input.s.length%2?'odd':(()=>{let c=0;for(let i=0;i<input.s.length;i++){c+=input.locked[i]==='0'||input.s[i]==='('?1:-1;if(c<0)return'failed';}return'suffix_failed';})()):id===2122?'found':(id===2124||id===2126)&&!result?'failed':'return',pseudocodeStages:{2115:{deliver:4},2116:{odd:1,forward:2,backward:4,failed:3,suffix_failed:4},2119:{decide:4},2120:{move:3,boundary:4},2121:{left:2,right:4},2122:{reject:4,pair:3,found:5},2124:{scan:3,failed:4},2126:{absorb:4,failed:3},2129:{normalize:4}},tags:{2114:['String'],2115:['Graph','Topological Sort'],2116:['Greedy'],2119:['Math'],2120:['Simulation'],2121:['Prefix Sum'],2122:['Sorting','Hash Table'],2124:['String'],2125:['Matrix','Counting'],2126:['Greedy'],2129:['String']}};
