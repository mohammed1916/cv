const schemas={571:{tables:[['numbers','Numbers',['num','frequency']]],result:['median']},574:{tables:[['candidate','Candidate',['id','name']],['vote','Vote',['id','candidateId']]],result:['name']},595:{tables:[['world','World',['name','continent','area','population','gdp']]],result:['name','population','area']},596:{tables:[['courses','Courses',['student','class']]],result:['class']}};
const specs={
571:['numbers','Find the median of a multiset stored as values with frequencies.','Sort distinct values and walk cumulative frequencies. The median is the average of the values occupying the two central ranks; an odd total gives the same rank twice. No expanded list is needed.','sum frequencies and determine the two central one-based ranks|sort number records by value|advance cumulative frequency through each value block|capture the values whose blocks contain the central ranks|average those values and return the median','O(k log k) time and O(k) sorting space for k distinct values.'],
574:['candidate vote','Return the name of the candidate receiving the most votes.','Count vote records by candidate ID, select the unique largest group, and join that ID to its candidate name. Names are labels and need not be unique.','count votes by candidate ID|compare completed candidate vote counts|select the unique highest count|look up the winner name by candidate ID|return the winning name','O(candidates+votes) expected time and O(candidates) space.'],
595:['world','List countries meeting either the area threshold or the population threshold.','Evaluate the two thresholds independently and keep a country when either succeeds. Project only its name, population, and area; GDP does not affect eligibility.','read one country record|compare area with 3000000|compare population with 25000000|keep the record when either inclusive comparison succeeds|return name population and area','O(countries) time and O(1) auxiliary space excluding output.'],
596:['courses','Find classes with at least five enrolled students.','Each input row is one unique student-class enrollment. Count rows within each class, then apply the threshold to the completed groups rather than individual enrollment rows.','group enrollments by class|count each student enrollment in its class|finish every class count|keep class groups with at least five students|return the qualifying class names','O(enrollments) expected time and O(classes) count space.'],
};
const resultRecords=(id,rows)=>({label:'Result',columns:schemas[id].result,rows});
const solvers={
571({numbers},emit){const ordered=[...numbers].sort((a,b)=>a.num-b.num),total=ordered.reduce((s,r)=>s+r.frequency,0),ranks=[Math.floor((total+1)/2),Math.floor((total+2)/2)],selected=[null,null];let cumulative=0;for(let i=0;i<ordered.length;i++){const row=ordered[i],before=cumulative;cumulative+=row.frequency;for(let k=0;k<2;k++)if(before<ranks[k]&&ranks[k]<=cumulative)selected[k]=row.num;emit('This value occupies a consecutive block of ranks. Capture a central value only when its rank falls inside this block.',{sourceRecords:{label:'Numbers sorted by value',columns:['num','frequency'],rows:ordered,activeRow:i},table:ranks.map((rank,k)=>[rank,selected[k]??'not reached']),tableHeaders:['Central rank','Selected value'],codeStage:'capture',metrics:{value:row.num,firstRank:before+1,lastRank:cumulative,total}},'update');}return [{median:(selected[0]+selected[1])/2}];},
574({candidate,vote},emit){const counts=new Map();for(let i=0;i<vote.length;i++){const row=vote[i];counts.set(row.candidateId,(counts.get(row.candidateId)||0)+1);emit('Assign this ballot to its candidate ID. Candidates with the same display name remain separate groups.',{additionalSourceRecords:[{label:'Vote',columns:['id','candidateId'],rows:vote,activeRow:i}],table:[...counts],tableHeaders:['Candidate ID','Votes'],codeStage:'count'},'update');}let winner=null,best=-1;for(const[id,count]of counts)if(count>best){winner=id;best=count;}const name=candidate.find(row=>row.id===winner).name;emit('The unique largest vote group identifies the winner. Join by ID to retrieve the candidate name.',{resultRecords:resultRecords(574,[{name}]),codeStage:'join',metrics:{winner,votes:best,name}},'update');return [{name}];},
595({world},emit){const answer=[];for(let i=0;i<world.length;i++){const row=world[i],area=row.area>=3000000,population=row.population>=25000000;if(area||population)answer.push({name:row.name,population:row.population,area:row.area});emit('The conditions are inclusive and connected by OR. Meeting either threshold is enough, even when the other measure is small.',{sourceRecords:{label:'World',columns:schemas[595].tables[0][2],rows:world,activeRow:i},resultRecords:resultRecords(595,[...answer]),codeStage:'filter',metrics:{country:row.name,areaQualifies:area,populationQualifies:population,keep:area||population}},'update');}return answer;},
596({courses},emit){const counts=new Map();for(let i=0;i<courses.length;i++){const row=courses[i];counts.set(row.class,(counts.get(row.class)||0)+1);emit('One student may enroll in several classes, but each unique enrollment contributes exactly once to its own class group.',{sourceRecords:{label:'Courses',columns:['student','class'],rows:courses,activeRow:i},table:[...counts],tableHeaders:['Class','Students'],codeStage:'count'},'update');}const answer=[...counts].filter(([,count])=>count>=5).map(([name])=>({class:name}));emit('Apply the threshold after grouping: classes with exactly five students qualify.',{resultRecords:resultRecords(596,answer),codeStage:'filter',metrics:{groups:counts.size,qualifying:answer.length}},'update');return answer;},
};
const python={
571:`def weightedMedian(numbers):
    total = sum(row['frequency'] for row in numbers)
    ranks = [(total + 1) // 2, (total + 2) // 2]
    selected, cumulative = [None, None], 0
    for row in sorted(numbers, key=lambda row: row['num']):
        before = cumulative
        cumulative += row['frequency']
        for i, rank in enumerate(ranks):
            if before < rank <= cumulative:
                selected[i] = row['num']  # step: capture
    return [{'median': sum(selected) / 2}]  # step: return`,
574:`def winningCandidate(candidate, vote):
    counts = {}
    for ballot in vote:
        key = ballot['candidateId']
        counts[key] = counts.get(key, 0) + 1  # step: count
    winner = max(counts, key=counts.get)
    name = next(row['name'] for row in candidate if row['id'] == winner)  # step: join
    return [{'name': name}]  # step: return`,
595:`def bigCountries(world):
    answer = []
    for row in world:
        if row['area'] >= 3000000 or row['population'] >= 25000000:  # step: filter
            answer.append({key: row[key] for key in ('name', 'population', 'area')})
    return answer  # step: return`,
596:`def largeClasses(courses):
    counts = {}
    for row in courses:
        name = row['class']
        counts[name] = counts.get(name, 0) + 1  # step: count
    answer = [{'class': name} for name, count in counts.items() if count >= 5]  # step: filter
    return answer  # step: return`,
};
const sql={
571:`WITH Ranked AS (
    SELECT num, frequency,
           SUM(frequency) OVER (ORDER BY num) AS cumulative,
           SUM(frequency) OVER () AS total
    FROM Numbers
), MiddleRanks AS (
    SELECT num FROM Ranked
    WHERE FLOOR((total + 1) / 2) > cumulative - frequency
      AND FLOOR((total + 1) / 2) <= cumulative
    UNION ALL
    SELECT num FROM Ranked
    WHERE FLOOR((total + 2) / 2) > cumulative - frequency
      AND FLOOR((total + 2) / 2) <= cumulative
)
SELECT ROUND(AVG(num), 1) AS median FROM MiddleRanks;`,
574:`SELECT c.name
FROM Candidate AS c
JOIN (SELECT candidateId FROM Vote
      GROUP BY candidateId ORDER BY COUNT(*) DESC LIMIT 1) AS winner
  ON winner.candidateId = c.id;`,
595:`SELECT name, population, area
FROM World
WHERE area >= 3000000 OR population >= 25000000;`,
596:`SELECT class
FROM Courses
GROUP BY class
HAVING COUNT(*) >= 5;`,
};
const numbers=values=>values.map(([num,frequency])=>({num,frequency}));
const candidate=values=>values.map(([id,name])=>({id,name}));
const vote=values=>values.map((candidateId,i)=>({id:100+i,candidateId}));
const world=values=>values.map(([name,area,population])=>({name,continent:'Fictional',area,population,gdp:1000000000}));
const courses=groups=>groups.flatMap(([name,count])=>Array.from({length:count},(_,i)=>({student:`Learner${i+1}`,class:name})));
const cases={
571:[['Unsorted frequency blocks place middle ranks across values',{numbers:numbers([[18,2],[-7,3],[4,4],[30,1],[11,2]])}],['One repeated value owns both central ranks',{numbers:numbers([[42,8]])}],['Even size averages two different middle values',{numbers:numbers([[-5,1],[8,1]])}],['Odd size selects one central rank twice',{numbers:numbers([[2,2],[9,1],[15,2]])}]],
574:[['Interleaved ballots give one candidate a late lead',{candidate:candidate([[4,'Mira'],[9,'Tao'],[15,'Leena'],[21,'Ravi']]),vote:vote([9,4,15,9,4,21,15,9,4,9])}],['A single ballot is enough to select a winner',{candidate:candidate([[8,'Nora'],[12,'Ishan']]),vote:vote([12])}],['Duplicate names still use separate candidate IDs',{candidate:candidate([[1,'Alex'],[2,'Alex'],[3,'Jo']]),vote:vote([1,2,2,3,2])}],['Candidates without votes do not create winning groups',{candidate:candidate([[3,'Uma'],[6,'Vik'],[10,'Wen']]),vote:vote([6,6,6])}]],
595:[['Fictional countries qualify by area population both or neither',{world:world([['Aster',3400000,12000000],['Beryl',400000,28000000],['Cedar',5200000,51000000],['Dune',2500000,18000000],['Ember',3000000,24000000],['Fjord',2900000,25000000]])}],['Exact thresholds are inclusive',{world:world([['Grove',3000000,1],['Harbor',1,25000000]])}],['Just below both thresholds fails',{world:world([['Iris',2999999,24999999]])}],['An empty world table returns no rows',{world:[]}]],
596:[['Several classes finish on opposite sides of the threshold',{courses:courses([['Robotics',7],['Poetry',4],['Astronomy',5],['Ceramics',2]])}],['Exactly five distinct students qualify',{courses:courses([['Ecology',5]])}],['The same students can populate different class groups',{courses:courses([['Music',3],['Drama',3]])}],['No enrollment means no qualifying class',{courses:[]}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);};for(const[key,label,columns]of schemas[id].tables){need(Array.isArray(input[key])&&input[key].length<=60,`${label} must contain at most 60 records.`);for(const row of input[key]){need(row&&typeof row==='object'&&!Array.isArray(row)&&columns.every(k=>k in row),`${label} requires ${columns.join(', ')}.`);for(const column of columns){const value=row[column];if(['name','continent','student','class'].includes(column))need(typeof value==='string'&&value.length>=1&&value.length<=40,`${column} must contain 1-40 characters.`);else need(Number.isSafeInteger(value)&&value>=(column==='num'?-1000000:column==='frequency'?1:0)&&value<=(['area','population','gdp'].includes(column)?100000000000000:1000000),`${column} must be a bounded integer, with positive frequencies.`);}}const keys=key==='courses'?['student','class']:[columns[0]];need(new Set(input[key].map(row=>JSON.stringify(keys.map(k=>row[k])))).size===input[key].length,`${label} primary keys must be unique.`);}if(id===571)need(input.numbers.length>0,'At least one positive-frequency number is needed for a median.');if(id===574){need(input.vote.length>0,'At least one vote is required.');const ids=new Set(input.candidate.map(row=>row.id)),counts=new Map();for(const row of input.vote){need(ids.has(row.candidateId),'Every vote must reference a candidate.');counts.set(row.candidateId,(counts.get(row.candidateId)||0)+1);}const best=Math.max(...counts.values());need([...counts.values()].filter(n=>n===best).length===1,'The input must have one unique winning candidate.');}return input;}
const inputState=(id,input)=>{const tables=schemas[id].tables.map(([key,label,columns])=>({label,columns,rows:input[key]}));return{sourceRecords:tables[0],additionalSourceRecords:tables.slice(1)};};
export default {specs,solvers,python,sql,cases,validate,inputState,resultState:(id,result)=>({resultRecords:resultRecords(id,result)}),pseudocodeStages:{571:{capture:4},574:{count:1,join:4},595:{filter:4},596:{count:2,filter:4}},tags:Object.fromEntries(Object.keys(specs).map(id=>[id,['Database']]))};
