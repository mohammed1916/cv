const specs={
2015:['buildings','Describe street segments by the floored average height of covering buildings.','Sweep start and end events while tracking height sum and active count. Emit the floor of their ratio on each covered span, merging adjacent spans with the same reported average.','build height-sum and building-count endpoint changes|sweep sorted endpoints|compute the preceding covered span average|append or merge equal adjacent averages then apply changes|return the maximal average-height segments','O(n log n) time; O(n) events and output space.'],
2016:['nums','Find the largest positive difference with the smaller value at an earlier index.','Retain the smallest value seen before the current position. A current value larger than that minimum is a valid endpoint; equal values do not form a positive difference.','initialize the first value as the prior minimum|scan each later value|compare it with the prior minimum|update the best positive difference and then the minimum|return the best difference or -1','O(n) time; O(1) auxiliary space.'],
2017:['grid','Minimize the points the second robot can collect after the first robot moves.','The first robot changes rows at one column. It leaves only the top suffix and bottom prefix as useful regions, and the second robot chooses the larger one. Minimize that maximum.','sum the top row and start an empty bottom prefix|choose each possible turn column|remove the current top value from the remaining suffix|minimize max(top suffix,bottom prefix) then extend the bottom prefix|return the second robot minimum guaranteed score','O(columns) time; O(1) auxiliary space.'],
2018:['board word','Check whether a word fits exactly in a horizontal or vertical crossword slot.','A valid slot is bounded by the board edge or blocked cells and has exactly the word length. Check both reading directions, allowing blanks and requiring existing letters to match.','enumerate maximal horizontal and vertical unblocked slots|inspect each complete slot|require exact length and compatible letters|accept a forward or reversed placement|return whether any slot accepts the word','O(rows*columns) cell scanning and slot checking; O(rows*columns) recorded slot space.'],
2019:['s answers','Score student answers to a single-digit addition and multiplication expression.','Compute the correct precedence result separately. Interval DP enumerates results from alternative parenthesizations; correct answers earn five, other attainable answers earn two, and remaining answers earn zero.','evaluate multiplication before addition for the correct result|initialize each digit interval|combine shorter interval results with every split operator|score answers using correct-first precedence over alternate results|return the total score','O(n^3*V^2) reference time; O(n^2*V) result-set space, V at most 1001.'],
2021:['lights','Find the smallest integer street position with maximum brightness.','Each light contributes on an inclusive integer interval. Add one at its left edge and remove one just after its right edge; scanning endpoints in increasing order preserves the smallest position on ties.','record plus-one and minus-one interval events|visit sorted event positions|update the number of active lights|record a position only when brightness strictly increases|return the earliest brightest position','O(n log n) time; O(n) endpoint space.'],
2022:['original m n','Reshape a flat array into m rows and n columns without reordering.','The reshape is possible only when the element count equals m*n. Position i maps to row floor(i/n) and column i mod n.','check original length equals m*n|allocate an m-by-n result|read each flat input position|write to row floor(i/n), column i mod n|return the filled matrix or an empty result','O(length) time and output space.'],
2023:['nums target','Count ordered pairs of distinct indices whose strings concatenate to target.','Split target at every nonempty boundary. Multiply the frequencies of the two pieces; if both pieces are identical, exclude choosing the same index twice.','count each input string frequency|split target into nonempty left and right pieces|look up both frequencies|add their product, subtracting self-pairs when pieces match|return the ordered-pair count','O(total input characters + target length squared) slicing time; O(distinct strings) space.'],
2024:['answerKey k','Create the longest equal-answer run using at most k flips.','A window can become uniform by flipping all minority answers. Grow right, shrink left until minority count fits the budget, and record the longest valid window.','start an empty answer-frequency window|extend the right edge|compare window size minus majority count with k|shrink until valid and update the best length|return the longest achievable run','O(n) time; O(1) frequency space.'],
};

const solvers={
2015({buildings},emit){const events=new Map();for(const[left,right,height]of buildings){if(!events.has(left))events.set(left,[0,0]);if(!events.has(right))events.set(right,[0,0]);events.get(left)[0]+=height;events.get(left)[1]++;events.get(right)[0]-=height;events.get(right)[1]--;}let previous=null,sum=0,count=0;const result=[];for(const position of [...events.keys()].sort((a,b)=>a-b)){const average=count?Math.floor(sum/count):null;if(previous!==null&&count){const last=result.at(-1);if(last&&last[1]===previous&&last[2]===average)last[1]=position;else result.push([previous,position,average]);}emit('Report the floored average on the span before this endpoint. Adjacent spans with the same reported average merge even when their underlying building sets differ; uncovered gaps keep segments separate.',{sequence:[...events.keys()].sort((a,b)=>a-b),table:result.map(row=>[...row]),tableHeaders:['Start','End','Average height'],codeStage:'update',metrics:{previous,position,heightSum:sum,activeBuildings:count,average}},'update');sum+=events.get(position)[0];count+=events.get(position)[1];previous=position;}return result;},
2016({nums},emit){let minimum=nums[0],best=-1;for(let i=1;i<nums.length;i++){const valid=nums[i]>minimum,difference=nums[i]-minimum;if(valid)best=Math.max(best,difference);emit('The minimum comes only from earlier positions. A strict increase creates a valid pair; record its difference before allowing this value to become the new minimum.',{index:i,codeStage:'update',metrics:{previousMinimum:minimum,current:nums[i],valid,difference,best}},'update');minimum=Math.min(minimum,nums[i]);}return best;},
2017({grid},emit){let top=grid[0].reduce((a,b)=>a+b,0),bottom=0,best=Infinity;const choices=[];for(let c=0;c<grid[0].length;c++){top-=grid[0][c];const second=Math.max(top,bottom);best=Math.min(best,second);choices.push([c,top,bottom,second]);emit('Turning down here removes the top prefix and bottom suffix. The second robot can benefit from either the untouched top suffix or the untouched bottom prefix, so evaluate the larger remaining region.',{matrix:grid,cell:[0,c],otherCell:[1,c],table:[...choices],tableHeaders:['Turn column','Top suffix','Bottom prefix','Second robot best'],codeStage:'update',metrics:{column:c,top,bottom,second,best}},'update');bottom+=grid[1][c];}return best;},
2018({board,word},emit){const rows=board.length,cols=board[0].length,slots=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){if(board[r][c]==='#')continue;if(c===0||board[r][c-1]==='#'){const cells=[];for(let j=c;j<cols&&board[r][j]!=='#';j++)cells.push([r,j]);slots.push({direction:'horizontal',cells});}if(r===0||board[r-1][c]==='#'){const cells=[];for(let i=r;i<rows&&board[i][c]!=='#';i++)cells.push([i,c]);slots.push({direction:'vertical',cells});}}let possible=false;for(const slot of slots){const letters=slot.cells.map(([r,c])=>board[r][c]),exact=letters.length===word.length,forward=exact&&letters.every((c,i)=>c===' '||c===word[i]),reverse=exact&&letters.every((c,i)=>c===' '||c===word[word.length-1-i]);emit('A placement must fill a whole bounded slot. Longer open runs cannot accept a shorter word unless a block or board edge supplies the required boundary.',{matrix:board,cell:slot.cells[0],otherCell:slot.cells.at(-1),output:letters.map(c=>c===' '?'blank':c),codeStage:'update',metrics:{direction:slot.direction,slotLength:letters.length,word,exact,forward,reverse}},'update');if(forward||reverse){possible=true;break;}}return possible;},
2019({s,answers},emit){const values=[...s].filter((_,i)=>i%2===0).map(Number),operators=[...s].filter((_,i)=>i%2===1),n=values.length;let correct=0,term=values[0];for(let i=0;i<operators.length;i++){if(operators[i]==='*')term*=values[i+1];else{correct+=term;term=values[i+1];}}correct+=term;emit('Evaluate multiplication within each additive term before adding the terms. This precedence result always earns five points, even when it is also reachable by another parenthesization.',{sequence:[...s],codeStage:'correct',metrics:{correct}});const dp=Array.from({length:n},()=>Array.from({length:n},()=>new Set())),table=[];for(let i=0;i<n;i++)dp[i][i].add(values[i]);for(let length=2;length<=n;length++)for(let left=0;left+length<=n;left++){const right=left+length-1;for(let split=left;split<right;split++)for(const a of dp[left][split])for(const b of dp[split+1][right]){const value=operators[split]==='+'?a+b:a*b;if(value<=1000)dp[left][right].add(value);}table.push([left,right,[...dp[left][right]].sort((a,b)=>a-b).join(', ')]);emit('Every split chooses the final operation performed for this interval. Combining results from both smaller intervals covers alternative parenthesizations without enumerating complete expression trees repeatedly.',{sequence:[...s],window:[left*2,right*2],table:[...table],tableHeaders:['First number','Last number','Attainable results up to 1000'],codeStage:'combine',metrics:{left,right,resultCount:dp[left][right].size}},'update');}let total=0;const scored=[];for(let i=0;i<answers.length;i++){const value=answers[i],score=value===correct?5:dp[0][n-1].has(value)?2:0;total+=score;scored.push([i,value,score]);emit('Award five for the correct result first. Otherwise award two only for an attainable parenthesization result; repeated submitted answers are scored independently.',{sequence:answers,index:i,table:[...scored],tableHeaders:['Student','Answer','Points'],codeStage:'score',metrics:{correct,answer:value,score,total}},'update');}return total;},
2021({lights},emit){const events=new Map();for(const[position,range]of lights){events.set(position-range,(events.get(position-range)||0)+1);events.set(position+range+1,(events.get(position+range+1)||0)-1);}let brightness=0,maximum=-1,answer=0;const positions=[...events.keys()].sort((a,b)=>a-b);for(let i=0;i<positions.length;i++){const position=positions[i];brightness+=events.get(position);if(brightness>maximum){maximum=brightness;answer=position;}emit('The light interval includes its right endpoint, so removal occurs one integer position later. Update the best only on a strict increase to preserve the smallest position on ties.',{sequence:positions,index:i,codeStage:'update',metrics:{position,delta:events.get(position),brightness,maximum,answer}},'update');}return answer;},
2022({original,m,n},emit){if(original.length!==m*n){emit('The requested shape has a different number of slots, so reshaping without dropping or duplicating values is impossible.',{codeStage:'failed',metrics:{values:original.length,slots:m*n}});return[];}const result=Array.from({length:m},()=>Array(n).fill(null));for(let i=0;i<original.length;i++){const row=Math.floor(i/n),col=i%n;result[row][col]=original[i];emit('Integer division selects the row and the remainder selects the column. Filling row by row preserves the original sequence order.',{index:i,outputMatrix:result,outputCell:[row,col],codeStage:'update',metrics:{flatIndex:i,row,col,value:original[i]}},'update');}return result;},
2023({nums,target},emit){const counts=new Map();for(const text of nums)counts.set(text,(counts.get(text)||0)+1);let total=0;for(let split=1;split<target.length;split++){const left=target.slice(0,split),right=target.slice(split),a=counts.get(left)||0,b=counts.get(right)||0,added=a*(b-Number(left===right));total+=added;emit('A target boundary fixes the complete first and second strings. Equal pieces require two different occurrences, while unequal pieces can independently choose any occurrence from each group.',{sequence:[...target],index:split,table:[...counts],tableHeaders:['Input string','Occurrences'],codeStage:'update',metrics:{left,right,leftCount:a,rightCount:b,added,total}},'update');}return total;},
2024({answerKey,k},emit){const counts={T:0,F:0};let left=0,best=0;for(let right=0;right<answerKey.length;right++){counts[answerKey[right]]++;while(right-left+1-Math.max(counts.T,counts.F)>k)counts[answerKey[left++]]--;best=Math.max(best,right-left+1);emit('Flip the minority answer in this window. Shrink only when the required flips exceed k; after shrinking, every recorded window can be made uniform within the budget.',{index:right,window:[left,right],codeStage:'update',metrics:{left,right,trueCount:counts.T,falseCount:counts.F,flips:Math.min(counts.T,counts.F),budget:k,best}},'update');}return best;},
};
const python={
2015:`def averageHeightOfBuildings(buildings):
    from collections import defaultdict
    events = defaultdict(lambda: [0, 0])
    for left, right, height in buildings:
        events[left][0] += height
        events[left][1] += 1
        events[right][0] -= height
        events[right][1] -= 1
    result = []
    previous, total, count = None, 0, 0
    for position in sorted(events):
        if previous is not None and count:
            average = total // count
            if result and result[-1][1] == previous and result[-1][2] == average:
                result[-1][1] = position
            else:
                result.append([previous, position, average])
        # step: update
        total += events[position][0]
        count += events[position][1]
        previous = position
    return result  # step: return`,
2016:`def maximumDifference(nums):
    minimum, best = nums[0], -1
    for value in nums[1:]:
        if value > minimum:
            best = max(best, value - minimum)
        # step: update
        minimum = min(minimum, value)
    return best  # step: return`,
2017:`def gridGame(grid):
    top, bottom, best = sum(grid[0]), 0, float('inf')
    for column in range(len(grid[0])):
        top -= grid[0][column]
        best = min(best, max(top, bottom))  # step: update
        bottom += grid[1][column]
    return best  # step: return`,
2018:`def placeWordInCrossword(board, word):
    rows, cols = len(board), len(board[0])
    slots = []
    for row in range(rows):
        for col in range(cols):
            if board[row][col] == '#':
                continue
            if col == 0 or board[row][col - 1] == '#':
                letters, c = [], col
                while c < cols and board[row][c] != '#':
                    letters.append(board[row][c])
                    c += 1
                slots.append(letters)
            if row == 0 or board[row - 1][col] == '#':
                letters, r = [], row
                while r < rows and board[r][col] != '#':
                    letters.append(board[r][col])
                    r += 1
                slots.append(letters)
    possible = False
    for letters in slots:
        exact = len(letters) == len(word)
        forward = exact and all(c == ' ' or c == word[i] for i, c in enumerate(letters))
        reverse = exact and all(c == ' ' or c == word[-1 - i] for i, c in enumerate(letters))
        # step: update
        if forward or reverse:
            possible = True
            break
    return possible  # step: return`,
2019:`def scoreOfStudents(s, answers):
    values = [int(s[i]) for i in range(0, len(s), 2)]
    operators = s[1::2]
    correct, term = 0, values[0]
    for operation, value in zip(operators, values[1:]):
        if operation == '*':
            term *= value
        else:
            correct += term
            term = value
    correct += term  # step: correct
    n = len(values)
    dp = [[set() for _ in range(n)] for _ in range(n)]
    for i, value in enumerate(values):
        dp[i][i].add(value)
    for length in range(2, n + 1):
        for left in range(n - length + 1):
            right = left + length - 1
            for split in range(left, right):
                for a in dp[left][split]:
                    for b in dp[split + 1][right]:
                        value = a + b if operators[split] == '+' else a * b
                        if value <= 1000:
                            dp[left][right].add(value)
            # step: combine
    total = 0
    for answer in answers:
        total += 5 if answer == correct else 2 if answer in dp[0][n - 1] else 0  # step: score
    return total  # step: return`,
2021:`def brightestPosition(lights):
    from collections import defaultdict
    events = defaultdict(int)
    for position, radius in lights:
        events[position - radius] += 1
        events[position + radius + 1] -= 1
    brightness, maximum, answer = 0, -1, 0
    for position in sorted(events):
        brightness += events[position]
        if brightness > maximum:
            maximum, answer = brightness, position
        # step: update
    return answer  # step: return`,
2022:`def construct2DArray(original, m, n):
    if len(original) != m * n:
        return []  # step: failed
    result = [[None] * n for _ in range(m)]
    for i, value in enumerate(original):
        result[i // n][i % n] = value  # step: update
    return result  # step: return`,
2023:`def numOfPairs(nums, target):
    from collections import Counter
    counts = Counter(nums)
    total = 0
    for split in range(1, len(target)):
        left, right = target[:split], target[split:]
        total += counts[left] * (counts[right] - (left == right))  # step: update
    return total  # step: return`,
2024:`def maxConsecutiveAnswers(answerKey, k):
    counts = {'T': 0, 'F': 0}
    left = best = 0
    for right, answer in enumerate(answerKey):
        counts[answer] += 1
        while right - left + 1 - max(counts.values()) > k:
            counts[answerKey[left]] -= 1
            left += 1
        best = max(best, right - left + 1)  # step: update
    return best  # step: return`,
};
const board=rows=>rows.map(row=>[...row]);
const cases={
2015:[['Overlapping buildings and uncovered gaps form several spans',{buildings:[[1,7,8],[3,10,15],[6,12,5],[15,20,11],[18,24,17]]}],['Changing building membership can preserve the floored average',{buildings:[[2,6,10],[6,11,9],[6,11,11]]}],['A gap prevents merging equal averages',{buildings:[[1,4,7],[8,12,7]]}],['One building supplies one segment',{buildings:[[5,14,13]]}]],
2016:[['The best later increase follows a new low',{nums:[18,12,7,16,5,21,11,28,9]}],['Strict decrease has no valid pair',{nums:[20,14,9,6,2]}],['Equal values are not a strict increase',{nums:[8,8,8,8]}],['Two entries form the only candidate',{nums:[3,17]}]],
2017:[['Uneven row rewards change the best turn column',{grid:[[7,2,11,4,9,3,8],[5,12,1,10,2,14,6]]}],['One column leaves no unvisited points',{grid:[[8],[13]]}],['Large top suffix favors a later turn',{grid:[[1,1,1,30],[2,2,2,2]]}],['Equal rows create symmetric choices',{grid:[[6,6,6,6],[6,6,6,6]]}]],
2018:[['A mixed board contains one compatible bounded slot',{board:board(['#######','#r v r#','## # ##','#     #','#######']),word:'river'}],['Only the reversed direction fits',{board:board(['#t c#']),word:'cat'}],['An open slot longer than the word is invalid',{board:board(['     ']),word:'pine'}],['An existing letter conflicts with both directions',{board:board(['cxt']),word:'cat'}]],
2019:[['Several precedence mistakes compete with the correct result',{s:'4+2*3+5*2+1',answers:[21,39,35,27,21,500]}],['Every parenthesization agrees for addition only',{s:'2+3+4',answers:[9,9,7,14]}],['Multiplication by zero changes alternate results',{s:'7*0+3*2',answers:[6,42,0,6]}],['One operation still scores repeated answers independently',{s:'8*3',answers:[24,11,24,32]}]],
2021:[['Overlaps span negative and positive street positions',{lights:[[-6,4],[-2,3],[3,5],[8,2],[12,4]]}],['Equal separated peaks choose the smaller position',{lights:[[-8,1],[9,1]]}],['Right endpoints remain illuminated',{lights:[[2,2],[6,2]]}],['A zero-radius light covers one integer point',{lights:[[7,0]]}]],
2022:[['Twelve values fill three rows in their original order',{original:[8,3,14,6,11,2,19,7,5,16,4,12],m:3,n:4}],['The element count does not fit',{original:[2,7,9,4,6],m:2,n:3}],['A single row keeps the flat order',{original:[13,5,8,21],m:1,n:4}],['A single column places one value per row',{original:[6,17,3,10],m:4,n:1}]],
2023:[['Different split lengths and duplicate strings contribute',{nums:['12','34','123','4','1','234','12','34'],target:'1234'}],['Equal halves exclude self-pairing',{nums:['8','8','8','16'],target:'88'}],['No pair can form the target',{nums:['21','3','14'],target:'777'}],['A single-character target has no nonempty split',{nums:['1','2','3'],target:'1'}]],
2024:[['Several minority clusters compete for the flip budget',{answerKey:'TTFFTFTTTFFTTFTF',k:3}],['Already uniform input needs no flips',{answerKey:'FFFFF',k:2}],['The budget can cover the entire input',{answerKey:'TFTFFTFTTF',k:10}],['Alternating answers with a small budget',{answerKey:'TFTFTFTFTF',k:1}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=10000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=1,maxLength=60)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2015)need(Array.isArray(input.buildings)&&input.buildings.length>=1&&input.buildings.length<=30&&input.buildings.every(b=>Array.isArray(b)&&b.length===3&&integer(b[0])&&integer(b[1],b[0]+1)&&integer(b[2],1)),'Use 1-30 [left,right,height] buildings with increasing nonnegative endpoints and positive heights.');
  if(id===2016)need(vector(input.nums)&&input.nums.length>=2,'Use 2-60 positive integers.');
  if(id===2017)need(Array.isArray(input.grid)&&input.grid.length===2&&input.grid.every(row=>vector(row,1,40)&&row.length===input.grid[0].length),'Use exactly two equally sized positive rows with 1-40 columns.');
  if(id===2018)need(Array.isArray(input.board)&&input.board.length>=1&&input.board.length<=8&&input.board.every(row=>Array.isArray(row)&&row.length>=1&&row.length<=8&&row.length===input.board[0].length&&row.every(c=>typeof c==='string'&&/^[a-z #]$/.test(c)))&&typeof input.word==='string'&&/^[a-z]{1,8}$/.test(input.word),'Use a board up to eight by eight containing lowercase letters, spaces, and # blocks, plus a lowercase word of length 1-8.');
  if(id===2019)need(typeof input.s==='string'&&/^[0-9](?:[+*][0-9]){1,6}$/.test(input.s)&&Array.isArray(input.answers)&&input.answers.length>=1&&input.answers.length<=30&&input.answers.every(v=>integer(v,0,1000)),'Use 2-7 single-digit operands joined by + or *, and 1-30 answers from zero to 1000.');
  if(id===2021)need(Array.isArray(input.lights)&&input.lights.length>=1&&input.lights.length<=40&&input.lights.every(v=>Array.isArray(v)&&v.length===2&&integer(v[0],-10000,10000)&&integer(v[1],0,10000)),'Use 1-40 [position,radius] lights with bounded integer positions and nonnegative radii.');
  if(id===2022)need(vector(input.original,1,64)&&integer(input.m,1,8)&&integer(input.n,1,8),'Use 1-64 positive values and row/column sizes from 1 to 8. Mismatched shapes return an empty result.');
  if(id===2023)need(Array.isArray(input.nums)&&input.nums.length>=2&&input.nums.length<=60&&input.nums.every(s=>typeof s==='string'&&/^[0-9]{1,20}$/.test(s))&&typeof input.target==='string'&&/^[0-9]{1,40}$/.test(input.target),'Use 2-60 nonempty digit strings of length at most 20 and a target of length 1-40.');
  if(id===2024)need(typeof input.answerKey==='string'&&/^[TF]{1,120}$/.test(input.answerKey)&&integer(input.k,1,input.answerKey.length),'Use 1-120 T/F answers and a positive flip budget no larger than the string length.');
  return input;
}
export default {specs,solvers,python,cases,validate,resultStage:(id,result)=>id===2022&&result.length===0?'failed':'return',pseudocodeStages:{2019:{correct:1,combine:3,score:4},2022:{failed:1}},tags:{2015:['Sweep Line'],2016:['Array'],2017:['Prefix Sum','Game Theory'],2018:['Matrix','String'],2019:['Dynamic Programming'],2021:['Sweep Line'],2022:['Matrix'],2023:['Hash Table','String'],2024:['Sliding Window']}};
