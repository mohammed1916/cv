const schemas={597:{tables:[['requests','FriendRequest',['sender_id','send_to_id','request_date']],['accepted','RequestAccepted',['requester_id','accepter_id','accept_date']]],result:['accept_rate']},601:{tables:[['stadium','Stadium',['id','visit_date','people']]],result:['id','visit_date','people']},602:{tables:[['accepted','RequestAccepted',['requester_id','accepter_id','accept_date']]],result:['id','num']},603:{tables:[['cinema','Cinema',['seat_id','free']]],result:['seat_id']}};
const specs={
597:['requests accepted','Compute the overall acceptance rate using distinct directed request and acceptance pairs.','Repeated records for the same sender and receiver count once, regardless of date. Divide distinct accepted pairs by distinct requested pairs, round to two decimals, and return zero if there are no requests.','deduplicate request sender-receiver pairs|deduplicate accepted requester-accepter pairs|count the two distinct pair sets independently|divide accepted by requested with a zero-denominator guard|return the rate rounded to two decimals','O(requests+acceptances) expected time and space.'],
601:['stadium','Return visits belonging to a run of at least three consecutive IDs with attendance of at least 100.','First remove low-attendance visits, then split the remaining sorted IDs wherever a gap appears. Calendar-day gaps do not matter: only consecutive visit IDs form a qualifying run.','filter visits to attendance at least 100 and sort by ID|extend a run while the next ID is exactly one larger|finish a run when an ID gap appears|retain every record in runs of at least three visits|return retained records in ascending visit date','O(visits log visits) time and O(visits) space.'],
602:['accepted','Find the person with the most friendships and report that count.','Each accepted request creates a friendship at both endpoints. Count the requester and accepter equally, then select the unique person with the largest degree.','initialize friendship counts by person|read each accepted friendship once|increment both endpoint counts|select the unique largest completed count|return the person ID and number of friends','O(friendships) expected time and O(people) space.'],
603:['cinema','List free seats that belong to a consecutive available group of at least two.','A free seat qualifies exactly when the seat immediately before or after it is also free. Looking up numeric neighbors avoids confusing adjacent input rows with adjacent seat numbers.','collect all seat IDs whose free flag is one|inspect each free seat|look up its numeric predecessor and successor|keep the seat if at least one neighbor is also free|return qualifying seat IDs in ascending order','O(seats log seats) time including output ordering; O(seats) space.'],
};
const records=(id,rows)=>({label:'Result',columns:schemas[id].result,rows});
const solvers={
597({requests,accepted},emit){const requested=new Set(),confirmed=new Set();for(const row of requests){requested.add(`${row.sender_id},${row.send_to_id}`);emit('Keep one directed sender-receiver pair even when the same request appears on another date.',{table:[...requested].map(pair=>pair.split(',').map(Number)),tableHeaders:['Sender','Receiver'],codeStage:'requests',metrics:{distinctRequests:requested.size}},'update');}for(const row of accepted){confirmed.add(`${row.requester_id},${row.accepter_id}`);emit('Deduplicate acceptance pairs independently. Dates and repeated acceptance records do not add another accepted pair.',{table:[...confirmed].map(pair=>pair.split(',').map(Number)),tableHeaders:['Requester','Accepter'],codeStage:'accepted',metrics:{distinctRequests:requested.size,distinctAccepted:confirmed.size}},'update');}return [{accept_rate:requested.size?Math.round(100*confirmed.size/requested.size)/100:0}];},
601({stadium},emit){const ordered=stadium.filter(row=>row.people>=100).sort((a,b)=>a.id-b.id),answer=[];let run=[];const flush=()=>{if(!run.length)return;const keep=run.length>=3;if(keep)answer.push(...run);emit(keep?'This complete consecutive-ID run has at least three busy visits. Keep every record in the run.':'This complete run is too short. Two busy visits alone do not meet the three-visit requirement.',{sourceRecords:{label:'Busy visits ordered by ID',columns:schemas[601].result,rows:ordered},table:run.map(row=>[row.id,row.visit_date,row.people]),tableHeaders:['Run ID','Visit date','People'],resultRecords:records(601,[...answer]),codeStage:'run',metrics:{length:run.length,keep}},'update');};for(const row of ordered){if(run.length&&row.id!==run.at(-1).id+1){flush();run=[];}run.push(row);}flush();return answer.sort((a,b)=>a.visit_date.localeCompare(b.visit_date));},
602({accepted},emit){const counts=new Map();for(let i=0;i<accepted.length;i++){const row=accepted[i];for(const person of [row.requester_id,row.accepter_id])counts.set(person,(counts.get(person)||0)+1);emit('A friendship is undirected even though its request has a direction. Both people gain one friend.',{sourceRecords:{label:'RequestAccepted',columns:schemas[602].tables[0][2],rows:accepted,activeRow:i},table:[...counts],tableHeaders:['Person','Friends so far'],codeStage:'edge'},'update');}let id=null,num=-1;for(const[person,count]of counts)if(count>num){id=person;num=count;}return [{id,num}];},
603({cinema},emit){const available=new Set(cinema.filter(row=>row.free===1).map(row=>row.seat_id)),answer=[];for(const seat of [...available].sort((a,b)=>a-b)){const previous=available.has(seat-1),next=available.has(seat+1);if(previous||next)answer.push({seat_id:seat});emit('Check seat numbers one apart. Either free neighbor proves this seat belongs to a consecutive available pair or a longer run.',{table:[...available].sort((a,b)=>a-b).map(id=>[id,id===seat?'current':'free']),tableHeaders:['Free seat','State'],resultRecords:records(603,[...answer]),codeStage:'neighbor',metrics:{seat,previousFree:previous,nextFree:next,keep:previous||next}},'update');}return answer;},
};
const python={
597:`def acceptanceRate(requests, accepted):
    from decimal import Decimal, ROUND_HALF_UP
    requested = {(row['sender_id'], row['send_to_id']) for row in requests}  # step: requests
    confirmed = {(row['requester_id'], row['accepter_id']) for row in accepted}  # step: accepted
    rate = Decimal(len(confirmed)) / len(requested) if requested else Decimal(0)
    return [{'accept_rate': float(rate.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))}]  # step: return`,
601:`def busyVisits(stadium):
    ordered = sorted((row for row in stadium if row['people'] >= 100), key=lambda row: row['id'])
    answer, run = [], []
    for row in ordered + [None]:
        if run and (row is None or row['id'] != run[-1]['id'] + 1):
            if len(run) >= 3:
                answer.extend(run)  # step: run
            run = []
        if row is not None:
            run.append(row)
    return sorted(answer, key=lambda row: row['visit_date'])  # step: return`,
602:`def mostFriends(accepted):
    counts = {}
    for row in accepted:
        for person in (row['requester_id'], row['accepter_id']):
            counts[person] = counts.get(person, 0) + 1  # step: edge
    winner = max(counts, key=counts.get)
    return [{'id': winner, 'num': counts[winner]}]  # step: return`,
603:`def consecutiveSeats(cinema):
    available = {row['seat_id'] for row in cinema if row['free'] == 1}
    answer = []
    for seat in sorted(available):
        if seat - 1 in available or seat + 1 in available:  # step: neighbor
            answer.append({'seat_id': seat})
    return answer  # step: return`,
};
const sql={
597:`SELECT ROUND(COALESCE(
    (SELECT COUNT(*) FROM (SELECT DISTINCT requester_id, accepter_id FROM RequestAccepted) AS a)
    / NULLIF((SELECT COUNT(*) FROM (SELECT DISTINCT sender_id, send_to_id FROM FriendRequest) AS r), 0),
    0), 2) AS accept_rate;`,
601:`WITH Busy AS (
    SELECT id, visit_date, people,
           id - ROW_NUMBER() OVER (ORDER BY id) AS run_id
    FROM Stadium WHERE people >= 100
), Sized AS (
    SELECT *, COUNT(*) OVER (PARTITION BY run_id) AS run_length FROM Busy
)
SELECT id, visit_date, people FROM Sized
WHERE run_length >= 3 ORDER BY visit_date;`,
602:`SELECT id, COUNT(*) AS num
FROM (SELECT requester_id AS id FROM RequestAccepted
      UNION ALL
      SELECT accepter_id AS id FROM RequestAccepted) AS endpoints
GROUP BY id ORDER BY num DESC LIMIT 1;`,
603:`SELECT c.seat_id
FROM Cinema AS c
WHERE c.free = 1 AND EXISTS (
    SELECT 1 FROM Cinema AS neighbor
    WHERE neighbor.free = 1 AND ABS(neighbor.seat_id - c.seat_id) = 1
)
ORDER BY c.seat_id;`,
};
const requests=pairs=>pairs.map(([sender_id,send_to_id],i)=>({sender_id,send_to_id,request_date:`2025-05-${String(i+1).padStart(2,'0')}`}));
const accepted=pairs=>pairs.map(([requester_id,accepter_id],i)=>({requester_id,accepter_id,accept_date:`2025-06-${String(i+1).padStart(2,'0')}`}));
const stadium=values=>values.map(([id,people],i)=>({id,people,visit_date:`2025-07-${String(i*2+1).padStart(2,'0')}`}));
const cinema=values=>values.map(([seat_id,free])=>({seat_id,free}));
const cases={
597:[['Repeated requests and acceptances count only distinct directed pairs',{requests:requests([[4,8],[4,8],[8,12],[4,15],[15,21],[21,4],[8,12]]),accepted:accepted([[4,8],[8,12],[4,8],[21,4]])}],['No requests yields zero instead of division by zero',{requests:[],accepted:[]}],['Unaccepted requests contribute only to the denominator',{requests:requests([[7,9],[7,11],[9,11]]),accepted:[]}],['One accepted pair out of three requires decimal rounding',{requests:requests([[2,5],[2,9],[5,9]]),accepted:accepted([[2,9]])}]],
601:[['Busy ID runs are interrupted by low attendance and missing IDs',{stadium:stadium([[11,140],[12,100],[13,210],[14,60],[15,190],[16,180],[18,170],[19,250],[20,130],[21,400]])}],['Two busy records are not a qualifying run',{stadium:stadium([[31,100],[32,101]])}],['Calendar gaps do not break consecutive visit IDs',{stadium:stadium([[41,150],[42,160],[43,170]])}],['An empty stadium has no qualifying visits',{stadium:[]}]],
602:[['Incoming and outgoing requests both grow the central person degree',{accepted:accepted([[10,20],[30,10],[10,40],[50,10],[20,30],[40,50],[60,10]])}],['A short path has one uniquely most connected middle person',{accepted:accepted([[7,8],[8,9]])}],['A hub may appear only as the accepter',{accepted:accepted([[1,99],[2,99],[3,99],[4,99]])}],['Disconnected components still share one global winner',{accepted:accepted([[2,3],[8,9],[8,10],[8,11]])}]],
603:[['Several free runs coexist with isolated and occupied seats',{cinema:cinema([[1,0],[2,1],[3,1],[4,1],[5,0],[6,1],[7,0],[8,1],[9,1],[10,0]])}],['No free seats means no output',{cinema:cinema([[1,0],[2,0],[3,0]])}],['A two-seat run includes both endpoints',{cinema:cinema([[1,1],[2,1]])}],['Alternating availability leaves every free seat isolated',{cinema:cinema([[1,1],[2,0],[3,1],[4,0],[5,1]])}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);};for(const[key,label,columns]of schemas[id].tables){need(Array.isArray(input[key])&&input[key].length<=60,`${label} must contain at most 60 records.`);for(const row of input[key]){need(row&&typeof row==='object'&&!Array.isArray(row)&&columns.every(k=>k in row),`${label} needs ${columns.join(', ')}.`);for(const column of columns){const v=row[column];if(column.endsWith('date'))need(typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v,'Use real YYYY-MM-DD dates.');else need(Number.isInteger(v)&&v>=(column==='free'||column==='people'?0:1)&&v<=(column==='free'?1:1000000),'IDs must be positive integers; people nonnegative and free zero or one.');}}if(id===601||id===603)need(new Set(input[key].map(row=>row[columns[0]])).size===input[key].length,`${label} IDs must be unique.`);}if(id===601){const sorted=[...input.stadium].sort((a,b)=>a.id-b.id);need(sorted.every((row,i)=>!i||row.visit_date>sorted[i-1].visit_date),'Visit dates must be unique and increase with visit IDs.');}if(id===597)for(const row of [...input.requests,...input.accepted])need((row.sender_id??row.requester_id)!==(row.send_to_id??row.accepter_id),'Self requests are not allowed.');if(id===602){const pairs=new Set(),counts=new Map();for(const row of input.accepted){need(row.requester_id!==row.accepter_id,'Self friendships are not allowed.');const pair=[row.requester_id,row.accepter_id].sort((a,b)=>a-b).join(',');need(!pairs.has(pair),'Record each undirected friendship only once.');pairs.add(pair);for(const p of [row.requester_id,row.accepter_id])counts.set(p,(counts.get(p)||0)+1);}const max=Math.max(...counts.values());need([...counts.values()].filter(n=>n===max).length===1,'Provide a nonempty graph with a unique most-connected person.');}return input;}
const inputState=(id,input)=>{const tables=schemas[id].tables.map(([key,label,columns])=>({label,columns,rows:input[key]}));return{sourceRecords:tables[0],additionalSourceRecords:tables.slice(1)};};
export default {specs,solvers,python,sql,cases,validate,inputState,resultState:(id,result)=>({resultRecords:records(id,result)}),pseudocodeStages:{597:{requests:1,accepted:2},601:{run:4},602:{edge:3},603:{neighbor:4}},tags:Object.fromEntries(Object.keys(specs).map(id=>[id,['Database']]))};
