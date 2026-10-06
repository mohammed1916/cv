const specs={
741:['grid','Collect the most cherries on a round trip without counting a cell twice.','Reverse the return trip so both journeys move right and down together. At each shared step, track both row coordinates; columns follow from step minus row. Shared cells contribute their cherry only once.','start two synchronized walkers at the upper-left cell|advance their common step count|combine the four prior up-or-left state choices|add cherries from both positions once per distinct cell|return the best joint arrival or zero if impossible','O(n^3) time and O(n^2) rolling state space.'],
1463:['grid','Maximize cherries collected by two robots descending from opposite top corners.','A row state stores both robot columns. Each robot may shift by minus one zero or one before the next row, giving nine transitions; when both occupy one cell, collect that cell once.','start robots at the two top corners|advance to the next row|try all nine pairs of column shifts|keep the best total for each destination pair counting shared cells once|return the largest total on the final row','O(rows*columns^2) time with nine constant transitions and O(columns^2) rolling space.'],
750:['grid','Count axis-aligned rectangles whose four corners are ones.','Every rectangle is determined by two rows sharing two one-columns. While processing a row, each pair of one-columns forms one rectangle with every earlier row containing that same pair.','scan the binary rows|enumerate pairs of columns containing ones in this row|add the number of earlier rows containing each pair|increment that pair row count|return the total corner rectangles','O(rows*columns^2) time and O(columns^2) pair-count space.'],
764:['n mines','Find the largest axis-aligned plus made of ones in a grid with mined zero cells.','A plus order is limited by its shortest arm including the center. Four directional sweeps compute consecutive-one runs and retain the minimum of left right up and down at every cell.','create the grid with mines set to zero|measure leftward and rightward one runs|measure upward and downward one runs|keep each cell minimum directional run length|return the largest resulting plus order','O(n^2) time and space.'],
980:['grid','Count paths from the start to the end that visit every non-obstacle cell exactly once.','Backtracking marks one visited cell at a time. The end accepts a path only when it is the final unvisited cell; undo each choice so alternate paths can reuse the cell in a different search branch.','count walkable cells and locate the start|visit an unvisited neighboring cell|accept the end only after every other walkable cell is used|undo the visit before exploring the next branch|return the number of complete covering paths','O(4^walkable cells) bounded search time and O(walkable cells) path space; at most twelve walkable cells in the visual input.'],
1444:['pizza k','Count ordered ways to cut a pizza into k pieces so every piece contains an apple.','Suffix apple counts test whether the top or left piece being handed away contains an apple. DP counts ways to continue cutting the remaining lower-right rectangle into the remaining pieces.','build suffix apple counts for every remaining rectangle|seed one-piece states when at least one apple exists|try horizontal cuts handing away a nonempty apple portion|try vertical cuts and add ways for the remaining pieces|return the whole-pizza k-piece count modulo the modulus','O(k*rows*columns*(rows+columns)) time and O(rows*columns) rolling DP space.'],
};
const display=matrix=>matrix.map(row=>row.map(v=>Number.isFinite(v)?v:'unreachable'));
const solvers={
741({grid},emit){const n=grid.length;let dp=Array.from({length:n},()=>Array(n).fill(-Infinity));dp[0][0]=grid[0][0];for(let step=1;step<=2*n-2;step++){const next=Array.from({length:n},()=>Array(n).fill(-Infinity));for(let r1=Math.max(0,step-n+1);r1<=Math.min(n-1,step);r1++)for(let r2=Math.max(0,step-n+1);r2<=Math.min(n-1,step);r2++){const c1=step-r1,c2=step-r2;if(grid[r1][c1]===-1||grid[r2][c2]===-1)continue;let best=-Infinity;for(const p1 of [r1,r1-1])for(const p2 of [r2,r2-1])if(p1>=0&&p2>=0)best=Math.max(best,dp[p1][p2]);if(Number.isFinite(best))next[r1][r2]=best+grid[r1][c1]+(r1===r2?0:grid[r2][c2]);}dp=next;emit('Both walkers have taken the same number of moves, so each column is fixed by its row. Combine reachable prior choices and count a shared position only once.',{matrix:grid,outputMatrix:display(dp),outputMatrixLabel:'Best cherries by walker-one row and walker-two row',codeStage:'step',metrics:{step,bestReachable:Number.isFinite(Math.max(...dp.flat()))?Math.max(...dp.flat()):'none'}},'update');}return Math.max(0,dp[n-1][n-1]);},
1463({grid},emit){const rows=grid.length,cols=grid[0].length;let dp=Array.from({length:cols},()=>Array(cols).fill(-Infinity));dp[0][cols-1]=grid[0][0]+grid[0][cols-1];for(let row=1;row<rows;row++){const next=Array.from({length:cols},()=>Array(cols).fill(-Infinity));for(let a=0;a<cols;a++)for(let b=0;b<cols;b++)if(Number.isFinite(dp[a][b]))for(const da of [-1,0,1])for(const db of [-1,0,1]){const na=a+da,nb=b+db;if(na>=0&&na<cols&&nb>=0&&nb<cols)next[na][nb]=Math.max(next[na][nb],dp[a][b]+grid[row][na]+(na===nb?0:grid[row][nb]));}dp=next;emit('Move each robot by at most one column into this row. Different histories reaching the same column pair share future options, so retain only the largest total.',{matrix:grid,region:[row,0,row,cols-1],outputMatrix:display(dp),outputMatrixLabel:'Best total by robot-one column and robot-two column',codeStage:'row',metrics:{row,best:Math.max(...dp.flat())}},'update');}return Math.max(...dp.flat());},
750({grid},emit){const pairs=new Map();let answer=0;for(let r=0;r<grid.length;r++){const columns=grid[r].flatMap((value,c)=>value?[c]:[]);let added=0;for(let a=0;a<columns.length;a++)for(let b=a+1;b<columns.length;b++){const key=`${columns[a]},${columns[b]}`,previous=pairs.get(key)||0;added+=previous;pairs.set(key,previous+1);}answer+=added;emit('Each earlier row sharing this pair of one-columns supplies the other two corners of a rectangle. Interior cells do not matter.',{matrix:grid,region:[r,0,r,grid[0].length-1],table:[...pairs].map(([pair,count])=>[pair,count]),tableHeaders:['Corner column pair','Rows containing pair'],codeStage:'pairs',metrics:{row:r,newRectangles:added,total:answer}},'update');}return answer;},
764({n,mines},emit){const grid=Array.from({length:n},()=>Array(n).fill(1)),arms=Array.from({length:n},()=>Array(n).fill(n));for(const[r,c]of mines)grid[r][c]=0;for(const direction of ['left','right','up','down']){for(let line=0;line<n;line++){let run=0;for(let offset=0;offset<n;offset++){const reverse=direction==='right'||direction==='down',position=reverse?n-1-offset:offset,r=direction==='left'||direction==='right'?line:position,c=direction==='left'||direction==='right'?position:line;run=grid[r][c]?run+1:0;arms[r][c]=Math.min(arms[r][c],run);}}emit('This sweep measures the consecutive-one arm toward one direction. Keep the smallest arm seen so far; a valid plus must satisfy all four directions.',{matrix:grid,outputMatrix:arms.map(row=>[...row]),outputMatrixLabel:'Minimum directional arm length including center',codeStage:'sweep',metrics:{direction}},'update');}return Math.max(...arms.flat());},
980({grid},emit){const rows=grid.length,cols=grid[0].length,visited=grid.map(row=>row.map(()=>false)),path=[];let start,total=0;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(grid[r][c]!==-1){total++;if(grid[r][c]===1)start=[r,c];}function walk(r,c,remaining){if(grid[r][c]===2){const accepted=remaining===1;emit(accepted?'The end is reached after all other walkable cells, so this path counts.':'The end is reached too early. Unvisited cells remain and the path cannot continue after finishing.',{matrix:grid,cell:[r,c],output:[...path,`${r},${c}`],codeStage:'end',metrics:{remaining,accepted}},'inspect');return accepted?1:0;}visited[r][c]=true;path.push(`${r},${c}`);let answer=0;for(const[dr,dc]of [[1,0],[-1,0],[0,1],[0,-1]]){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&grid[nr][nc]!==-1&&!visited[nr][nc])answer+=walk(nr,nc,remaining-1);}path.pop();visited[r][c]=false;emit('Undo this visited cell after finishing its continuations. The restored state lets a different path branch use it later.',{matrix:grid,cell:[r,c],output:[...path],codeStage:'backtrack',metrics:{returnedPaths:answer,remaining}},'update');return answer;}return walk(...start,total);},
1444({pizza,k},emit){const rows=pizza.length,cols=pizza[0].length,apples=Array.from({length:rows+1},()=>Array(cols+1).fill(0)),mod=1000000007;for(let r=rows-1;r>=0;r--)for(let c=cols-1;c>=0;c--)apples[r][c]=Number(pizza[r][c]==='A')+apples[r+1][c]+apples[r][c+1]-apples[r+1][c+1];let dp=Array.from({length:rows},(_,r)=>Array.from({length:cols},(_,c)=>Number(apples[r][c]>0)));for(let pieces=2;pieces<=k;pieces++){const next=Array.from({length:rows},()=>Array(cols).fill(0));for(let r=rows-1;r>=0;r--)for(let c=cols-1;c>=0;c--){const cuts=[];for(let nr=r+1;nr<rows;nr++)if(apples[r][c]>apples[nr][c]){next[r][c]=(next[r][c]+dp[nr][c])%mod;cuts.push(['horizontal',nr,dp[nr][c]]);}for(let nc=c+1;nc<cols;nc++)if(apples[r][c]>apples[r][nc]){next[r][c]=(next[r][c]+dp[r][nc])%mod;cuts.push(['vertical',nc,dp[r][nc]]);}emit('Hand away a top or left portion only if it contains an apple. Its remaining rectangle contributes the previously computed ways for one fewer piece.',{matrix:pizza.map(row=>row.split('')),region:[r,c,rows-1,cols-1],outputMatrix:next.map(row=>[...row]),outputMatrixLabel:'Ways to cut each remaining rectangle',table:cuts,tableHeaders:['Cut direction','New boundary','Remaining ways'],codeStage:'cut',metrics:{pieces,row:r,column:c,ways:next[r][c]}},'update');}dp=next;}return dp[0][0];},
};
const python={
741:`def cherryPickup(grid):
    n = len(grid)
    dp = [[float('-inf')] * n for _ in range(n)]
    dp[0][0] = grid[0][0]
    for step in range(1, 2 * n - 1):
        following = [[float('-inf')] * n for _ in range(n)]
        for first in range(max(0, step - n + 1), min(n - 1, step) + 1):
            for second in range(max(0, step - n + 1), min(n - 1, step) + 1):
                c1, c2 = step - first, step - second
                if grid[first][c1] == -1 or grid[second][c2] == -1:
                    continue
                best = max((dp[p1][p2] for p1 in (first, first - 1)
                            for p2 in (second, second - 1) if p1 >= 0 and p2 >= 0), default=float('-inf'))
                following[first][second] = best + grid[first][c1] + (grid[second][c2] if first != second else 0)
        dp = following  # step: step
    return max(0, dp[-1][-1])  # step: return`,
1463:`def cherryPickupII(grid):
    rows, cols = len(grid), len(grid[0])
    dp = [[float('-inf')] * cols for _ in range(cols)]
    dp[0][-1] = grid[0][0] + grid[0][-1]
    for row in range(1, rows):
        following = [[float('-inf')] * cols for _ in range(cols)]
        for first in range(cols):
            for second in range(cols):
                for a in range(max(0, first - 1), min(cols, first + 2)):
                    for b in range(max(0, second - 1), min(cols, second + 2)):
                        following[a][b] = max(following[a][b], dp[first][second]
                                               + grid[row][a] + (grid[row][b] if a != b else 0))
        dp = following  # step: row
    return max(map(max, dp))  # step: return`,
750:`def countCornerRectangles(grid):
    pairs, answer = {}, 0
    for row in grid:
        columns = [index for index, value in enumerate(row) if value]
        for first in range(len(columns)):
            for second in range(first + 1, len(columns)):
                key = (columns[first], columns[second])
                answer += pairs.get(key, 0)
                pairs[key] = pairs.get(key, 0) + 1
        # step: pairs
    return answer  # step: return`,
764:`def orderOfLargestPlusSign(n, mines):
    blocked = {tuple(cell) for cell in mines}
    arms = [[n] * n for _ in range(n)]
    for direction in ('left', 'right', 'up', 'down'):
        for line in range(n):
            run = 0
            for offset in range(n):
                position = n - 1 - offset if direction in ('right', 'down') else offset
                row, col = (line, position) if direction in ('left', 'right') else (position, line)
                run = 0 if (row, col) in blocked else run + 1
                arms[row][col] = min(arms[row][col], run)
        # step: sweep
    return max(map(max, arms))  # step: return`,
980:`def uniquePathsIII(grid):
    rows, cols = len(grid), len(grid[0])
    walkable = sum(value != -1 for row in grid for value in row)
    start = next((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == 1)
    visited = set()
    def walk(row, col, remaining):
        if grid[row][col] == 2:
            return int(remaining == 1)  # step: end
        visited.add((row, col))
        answer = 0
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = row + dr, col + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != -1 and (nr, nc) not in visited:
                answer += walk(nr, nc, remaining - 1)
        visited.remove((row, col))  # step: backtrack
        return answer
    return walk(*start, walkable)  # step: return`,
1444:`def ways(pizza, k):
    rows, cols, modulus = len(pizza), len(pizza[0]), 1000000007
    apples = [[0] * (cols + 1) for _ in range(rows + 1)]
    for row in range(rows - 1, -1, -1):
        for col in range(cols - 1, -1, -1):
            apples[row][col] = (int(pizza[row][col] == 'A') + apples[row + 1][col]
                                + apples[row][col + 1] - apples[row + 1][col + 1])
    dp = [[int(apples[row][col] > 0) for col in range(cols)] for row in range(rows)]
    for pieces in range(2, k + 1):
        following = [[0] * cols for _ in range(rows)]
        for row in range(rows - 1, -1, -1):
            for col in range(cols - 1, -1, -1):
                for nr in range(row + 1, rows):
                    if apples[row][col] > apples[nr][col]:
                        following[row][col] += dp[nr][col]
                for nc in range(col + 1, cols):
                    if apples[row][col] > apples[row][nc]:
                        following[row][col] += dp[row][nc]
                following[row][col] %= modulus  # step: cut
        dp = following
    return dp[0][0]  # step: return`,
};
const cases={
741:[['Two synchronized routes share some cherries and avoid blocked cells',{grid:[[0,1,0,1],[1,0,-1,1],[1,1,1,0],[0,-1,1,1]]}],['A blocked corridor makes a round trip impossible',{grid:[[0,1,-1],[-1,-1,1],[1,1,1]]}],['One cherry cell is counted once for both walkers',{grid:[[1]]}],['A cherry-filled square rewards two boundary routes',{grid:[[1,1,1],[1,1,1],[1,1,1]]}]],
1463:[['Robots choose between rich edges and shared interior cells',{grid:[[4,1,2,6],[2,8,3,1],[5,2,9,4],[1,7,2,8],[6,3,5,2]]}],['An all-zero board yields zero cherries',{grid:[[0,0,0],[0,0,0],[0,0,0]]}],['Two columns allow both robots to collect every row',{grid:[[2,5],[7,3],[4,6]]}],['A valuable center cell must not be counted twice',{grid:[[1,0,1],[0,20,0],[0,0,0]]}]],
750:[['Repeated one-column pairs form rectangles across several rows',{grid:[[1,0,1,1,0],[1,1,1,0,1],[0,1,1,1,1],[1,0,1,1,1]]}],['A single row cannot make a rectangle',{grid:[[1,1,1,1]]}],['A full three-by-four grid combines all row and column pairs',{grid:[[1,1,1,1],[1,1,1,1],[1,1,1,1]]}],['One one per row yields no corner pairs',{grid:[[1,0,0],[0,1,0],[0,0,1]]}]],
764:[['Mines limit different arms of competing plus centers',{n:7,mines:[[0,3],[2,1],[3,5],[5,2],[6,4]]}],['An empty mine list permits a centered maximum plus',{n:5,mines:[]}],['A mined single cell has order zero',{n:1,mines:[[0,0]]}],['An unmined single cell has order one',{n:1,mines:[]}]],
980:[['A small board permits competing covering paths around an obstacle',{grid:[[1,0,0,0],[0,-1,0,0],[0,0,0,2]]}],['An unobstructed corridor has one covering path',{grid:[[1,0,0,0,2]]}],['Reaching the end early leaves an unvisited branch',{grid:[[1,2,0],[0,-1,0]]}],['An obstacle can disconnect the required cells',{grid:[[1,-1,2],[0,-1,0]]}]],
1444:[['Horizontal and vertical cuts leave different apple-rich remainders',{pizza:['A..A','.AA.','A...','..AA'],k:3}],['One piece requires at least one apple',{pizza:['...','.A.'],k:1}],['Too few apples makes the requested pieces impossible',{pizza:['A..','...'],k:3}],['A single row permits only vertical cuts',{pizza:['A.A.AA'],k:3}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);},integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;if(id===764){need(integer(input.n,1,12)&&Array.isArray(input.mines)&&input.mines.length<=input.n*input.n&&input.mines.every(p=>Array.isArray(p)&&p.length===2&&p.every(v=>integer(v,0,input.n-1)))&&new Set(input.mines.map(p=>p.join(','))).size===input.mines.length,'Use a grid side 1-12 and distinct in-bounds mine coordinates.');return input;}if(id===1444){need(Array.isArray(input.pizza)&&input.pizza.length>=1&&input.pizza.length<=6&&typeof input.pizza[0]==='string'&&input.pizza[0].length>=1&&input.pizza[0].length<=6&&input.pizza.every(row=>typeof row==='string'&&row.length===input.pizza[0].length&&/^[A.]+$/.test(row))&&integer(input.k,1,6),'Use a rectangular pizza up to 6 by 6 with A/apple and dot/empty cells, and 1-6 pieces.');return input;}const grid=input.grid;need(Array.isArray(grid)&&grid.length>=1&&grid.length<=10&&Array.isArray(grid[0])&&grid[0].length>=1&&grid[0].length<=12&&grid.every(row=>Array.isArray(row)&&row.length===grid[0].length&&row.every(v=>integer(v,id===741||id===980?-1:0,id===1463?100:id===980?2:1))),'Use a bounded rectangular grid with values in this problem domain.');if(id===741)need(grid.length===grid[0].length&&grid.length<=7&&grid[0][0]>=0&&grid.at(-1).at(-1)>=0,'Use a square up to side seven with unblocked start and end.');if(id===1463)need(grid.length>=2&&grid[0].length>=2&&grid[0].length<=8,'Use 2-10 rows and 2-8 columns for two robots.');if(id===980){const cells=grid.flat();need(cells.filter(v=>v===1).length===1&&cells.filter(v=>v===2).length===1&&cells.filter(v=>v!==-1).length<=12,'Use exactly one start and one end, with at most twelve walkable cells.');}return input;}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{741:{step:4},1463:{row:4},750:{pairs:4},764:{sweep:4},980:{end:3,backtrack:4},1444:{cut:4}},tags:{741:['Dynamic Programming','Matrix'],1463:['Dynamic Programming','Matrix'],750:['Counting','Matrix'],764:['Dynamic Programming','Matrix'],980:['Backtracking','Matrix'],1444:['Dynamic Programming','Prefix Sum']}};
