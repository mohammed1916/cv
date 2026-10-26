const specs={
688:['n k row column','Find the probability that a knight remains on the board after exactly k random moves.','Each of the eight knight moves is equally likely, including moves that leave the board. Transfer one eighth of each square probability only to on-board destinations; escaped probability never returns.','place probability one at the starting square|create an empty distribution for each move|send one eighth along every legal on-board knight destination|replace the distribution without renormalizing lost mass|sum the probability remaining after k moves','O(k*n^2) time and O(n^2) rolling state space.'],
799:['poured query_row query_glass','Find how full a queried champagne glass is after overflow settles.','Each glass holds one unit. Any excess splits equally between the two glasses below; propagating row by row accumulates contributions from both parents before the next overflow calculation.','put all poured volume in the top glass|inspect the arriving amount of each glass in a row|split only the amount above one equally downward|continue until the queried row is reached|return the queried amount capped at one','O(query_row^2) time and displayed triangular state space.'],
808:['n','Compute the chance soup A empties first plus half the chance both soups empty together.','Scale volumes to 25 mL units. Each state averages the four equally likely serving outcomes; A-empty states score one, B-empty states zero, and simultaneous-empty states one half.','round the initial amount up to units of 25 mL|initialize empty-soup boundary probabilities|average the four serving transitions for each remaining-volume pair|fill increasing A-volume rows so every dependency is ready|return the equal-start-volume state','O(ceil(n/25)^2) time and space; visual input is bounded to 1000 mL.'],
837:['n k maxPts','Find the probability a random drawing game stops with score at most n.','Scores below k continue drawing uniformly from one through maxPts. A sliding sum of active predecessor probabilities supplies each next score; terminal scores accumulate the answer but never generate more draws.','handle an already-stopped game or a bound covering every terminal score|start with probability one at score zero|divide the active predecessor probability window by maxPts|add continuing scores to the window and terminal scores to the answer|expire old predecessors and return the success probability','O(n) time and O(n) probability storage.'],
};
const solvers={
688({n,k,row,column},emit){let dp=Array.from({length:n},()=>Array(n).fill(0));dp[row][column]=1;emit('The knight starts here with probability one. Off-board moves will lose probability rather than redistribute it among legal moves.',{matrix:dp,cell:[row,column],matrixLabel:'Probability at each square',codeStage:'seed',metrics:{moves:0,remainingProbability:1}},'update');const moves=[[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]];for(let move=1;move<=k;move++){const next=Array.from({length:n},()=>Array(n).fill(0));for(let r=0;r<n;r++)for(let c=0;c<n;c++)for(const[dr,dc]of moves){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<n&&nc>=0&&nc<n)next[nr][nc]+=dp[r][c]/8;}dp=next;emit('Transfer one eighth along each on-board knight move. The missing probability corresponds to paths that already left the board.',{matrix:dp.map(line=>[...line]),matrixLabel:'Probability after this many moves',codeStage:'move',metrics:{moves:move,remainingProbability:dp.flat().reduce((a,b)=>a+b,0)}},'update');}return dp.flat().reduce((a,b)=>a+b,0);},
799({poured,query_row,query_glass},emit){const dp=Array.from({length:query_row+1},(_,r)=>Array(r+1).fill(0));dp[0][0]=poured;for(let row=0;row<query_row;row++){for(let glass=0;glass<=row;glass++){const half=Math.max(0,dp[row][glass]-1)/2;dp[row+1][glass]+=half;dp[row+1][glass+1]+=half;}emit('A glass retains one unit and sends half of its excess to each child. Shared children receive contributions from both parents in the completed row.',{matrix:dp.map(values=>Array.from({length:query_row+1},(_,i)=>i<values.length?values[i]:'')),matrixLabel:'Arriving volume before each glass retains one unit',codeStage:'overflow',metrics:{processedRow:row,queriedRow:query_row,queriedGlass:query_glass}},'update');}return Math.min(1,dp[query_row][query_glass]);},
808({n},emit){const units=Math.ceil(n/25),dp=Array.from({length:units+1},()=>Array(units+1).fill(0));dp[0].fill(1);dp[0][0]=0.5;for(let a=1;a<=units;a++){for(let b=1;b<=units;b++)dp[a][b]=(dp[Math.max(0,a-4)][b]+dp[Math.max(0,a-3)][Math.max(0,b-1)]+dp[Math.max(0,a-2)][Math.max(0,b-2)]+dp[Math.max(0,a-1)][Math.max(0,b-3)])/4;emit('Average the four equally likely serving outcomes. Clamp depleted amounts to zero so a turn ending both soups uses the half-credit boundary.',{matrix:dp.map(row=>[...row]),matrixLabel:'A remaining units by B remaining units',cell:[a,units],codeStage:'average',metrics:{milliliters:n,units25mL:units,completedARow:a,equalStateWhenReady:dp[a][a]}},'update');}return dp[units][units];},
837({n,k,maxPts},emit){if(k===0||n>=k+maxPts-1){emit('Every possible stopping score is already within the requested bound, so success is certain.',{codeStage:'certain',metrics:{n,stopAt:k,maxDraw:maxPts}},'inspect');return 1;}const dp=Array(n+1).fill(0);dp[0]=1;let window=1,answer=0;for(let score=1;score<=n;score++){dp[score]=window/maxPts;if(score<k)window+=dp[score];else answer+=dp[score];const expired=score-maxPts;if(expired>=0&&expired<k)window-=dp[expired];emit('Only predecessor scores below the stopping threshold can draw again. Terminal probability contributes to the answer and is excluded from future transitions.',{sequence:Array.from({length:n+1},(_,i)=>i),index:score,output:[...dp],outputIndex:score,codeStage:'score',metrics:{score,probability:dp[score],continues:score<k,nextActiveWindow:window,successfulTerminalProbability:answer}},'update');}return answer;},
};
const python={
688:`def knightProbability(n, k, row, column):
    dp = [[0.0] * n for _ in range(n)]
    dp[row][column] = 1.0  # step: seed
    moves = ((1, 2), (2, 1), (2, -1), (1, -2), (-1, -2), (-2, -1), (-2, 1), (-1, 2))
    for _ in range(k):
        following = [[0.0] * n for _ in range(n)]
        for r in range(n):
            for c in range(n):
                for dr, dc in moves:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < n and 0 <= nc < n:
                        following[nr][nc] += dp[r][c] / 8
        dp = following  # step: move
    return sum(map(sum, dp))  # step: return`,
799:`def champagneTower(poured, query_row, query_glass):
    dp = [[0.0] * (row + 1) for row in range(query_row + 1)]
    dp[0][0] = poured
    for row in range(query_row):
        for glass in range(row + 1):
            half = max(0.0, dp[row][glass] - 1) / 2
            dp[row + 1][glass] += half
            dp[row + 1][glass + 1] += half
        # step: overflow
    return min(1.0, dp[query_row][query_glass])  # step: return`,
808:`def soupServings(n):
    units = (n + 24) // 25
    dp = [[0.0] * (units + 1) for _ in range(units + 1)]
    dp[0] = [1.0] * (units + 1)
    dp[0][0] = 0.5
    for a in range(1, units + 1):
        for b in range(1, units + 1):
            dp[a][b] = (dp[max(0, a - 4)][b]
                        + dp[max(0, a - 3)][max(0, b - 1)]
                        + dp[max(0, a - 2)][max(0, b - 2)]
                        + dp[max(0, a - 1)][max(0, b - 3)]) / 4
        # step: average
    return dp[units][units]  # step: return`,
837:`def new21Game(n, k, maxPts):
    if k == 0 or n >= k + maxPts - 1:
        return 1.0  # step: certain
    dp = [0.0] * (n + 1)
    dp[0] = 1.0
    window, answer = 1.0, 0.0
    for score in range(1, n + 1):
        dp[score] = window / maxPts
        if score < k:
            window += dp[score]
        else:
            answer += dp[score]
        expired = score - maxPts
        if 0 <= expired < k:
            window -= dp[expired]
        # step: score
    return answer  # step: return`,
};
const cases={
688:[['A central knight spreads over several moves before probability escapes',{n:7,k:5,row:3,column:3}],['Zero moves preserves the starting probability',{n:5,k:0,row:1,column:4}],['A one-square board loses all probability on the first move',{n:1,k:1,row:0,column:0}],['A corner starts with fewer on-board moves',{n:6,k:3,row:0,column:0}]],
799:[['Multiple parent streams fill a deeper interior glass',{poured:17,query_row:5,query_glass:2}],['No poured champagne leaves every glass empty',{poured:0,query_row:4,query_glass:1}],['Exactly one unit fills the top without overflow',{poured:1,query_row:1,query_glass:0}],['A heavily supplied queried glass caps at one',{poured:100,query_row:3,query_glass:1}]],
808:[['Several scaled-volume layers combine all four serving outcomes',{n:375}],['Both soups initially empty contribute half credit',{n:0}],['A nonmultiple of twenty-five uses the next unit boundary',{n:63}],['A larger bounded volume exposes the full probability table',{n:975}]],
837:[['A partial terminal-score range requires probability accumulation',{n:28,k:24,maxPts:10}],['Zero stopping threshold ends the game immediately',{n:0,k:0,maxPts:7}],['A bound above every stopping score makes success certain',{n:30,k:18,maxPts:8}],['Draws of one stop at a deterministic score',{n:9,k:9,maxPts:1}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);},integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;if(id===688)need(integer(input.n,1,8)&&integer(input.k,0,12)&&integer(input.row,0,input.n-1)&&integer(input.column,0,input.n-1),'Use a board of side 1-8, zero to twelve moves, and an on-board starting cell.');if(id===799)need(integer(input.poured,0,1000000)&&integer(input.query_row,0,12)&&integer(input.query_glass,0,input.query_row),'Use nonnegative poured volume, a queried row 0-12, and a valid glass index.');if(id===808)need(integer(input.n,0,1000),'Use 0-1000 mL for the complete bounded probability table.');if(id===837)need(integer(input.n,0,150)&&integer(input.k,0,input.n)&&integer(input.maxPts,1,50),'Use 0 <= k <= n <= 150 and maxPts from one to fifty.');return input;}
export default {specs,solvers,python,cases,validate,resultStage:(id,result,input)=>id===837&&(input.k===0||input.n>=input.k+input.maxPts-1)?'certain':'return',pseudocodeStages:{688:{seed:1,move:4},799:{overflow:3},808:{average:3},837:{certain:1,score:4}},tags:Object.fromEntries(Object.keys(specs).map(id=>[id,['Dynamic Programming','Probability']]))};
