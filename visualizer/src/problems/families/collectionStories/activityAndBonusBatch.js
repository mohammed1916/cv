const activityColumns=['player_id','device_id','event_date','games_played'];
const schemas={534:{tables:[['activity','Activity',activityColumns]],result:['player_id','event_date','games_played_so_far']},550:{tables:[['activity','Activity',activityColumns]],result:['fraction']},577:{tables:[['employee','Employee',['empId','name','supervisor','salary']],['bonus','Bonus',['empId','bonus']]],result:['name','bonus']},586:{tables:[['orders','Orders',['order_number','customer_number']]],result:['customer_number']}};
const specs={
534:['activity','Show the games each player has accumulated through each recorded day.','Sort each player timeline, then maintain a running total that resets at the next player. Days with no activity need no invented rows; the total spans all earlier recorded dates.','order activity by player and event date|reset the total when the player changes|add games from the current record|emit that player date and cumulative total|return all dated totals','O(n log n) time and O(n) output/sorting space.'],
550:['activity','Measure the fraction of players who return exactly one day after their first login.','First isolate each player first date. A later login counts only if it is the next calendar day after that first date; multiple later consecutive dates do not create extra retained players.','find each player first login date|look for a login exactly one calendar day later|count each qualifying player once|divide retained players by all players and round to two decimals|return the retention fraction','O(n) expected time and O(n) space.'],
577:['employee bonus','List employees with a bonus below 1000, including employees without a bonus row.','Start from every employee and look up their optional bonus. A missing row is a null bonus, not a reason to lose that employee; keep null bonuses and numeric bonuses below the threshold.','index bonus records by employee ID|visit every employee as the preserved side of a left join|look up its bonus or null when absent|keep missing bonuses and amounts below 1000|return employee names with their bonus values','O(employees+bonuses) expected time and O(bonuses) lookup space excluding output.'],
586:['orders','Find the customer who placed the most orders.','Group order records by customer, count every order once, then select the largest count. The input contract guarantees a unique winning customer.','initialize order counts by customer|visit each unique order record|increment its customer count|choose the customer with the largest final count|return that customer number','O(n) expected time and O(customers) space.'],
};
const records=(id,rows)=>({label:'Result',columns:schemas[id].result,rows});
const solvers={
534({activity},emit){const ordered=[...activity].sort((a,b)=>a.player_id-b.player_id||a.event_date.localeCompare(b.event_date)),answer=[];let previous=null,total=0;for(let i=0;i<ordered.length;i++){const row=ordered[i];if(previous!==row.player_id)total=0;previous=row.player_id;total+=row.games_played;answer.push({player_id:row.player_id,event_date:row.event_date,games_played_so_far:total});emit('Add this record to its player running total. A new player starts a separate accumulation; gaps between dates do not reset it.',{sourceRecords:{label:'Activity ordered by player and date',columns:activityColumns,rows:ordered,activeRow:i},resultRecords:records(534,[...answer]),codeStage:'accumulate',metrics:{player:previous,date:row.event_date,total}},'update');}return answer;},
550({activity},emit){const first=new Map(),dates=new Map();for(const row of activity){if(!first.has(row.player_id)||row.event_date<first.get(row.player_id))first.set(row.player_id,row.event_date);if(!dates.has(row.player_id))dates.set(row.player_id,new Set());dates.get(row.player_id).add(row.event_date);}let retained=0;const table=[];for(const[player,date]of first){const tomorrow=new Date(Date.parse(date+'T00:00:00Z')+86400000).toISOString().slice(0,10),returns=dates.get(player).has(tomorrow);if(returns)retained++;table.push([player,date,tomorrow,returns]);emit('Check the calendar day immediately after this player first login. A return on any other date does not meet this retention definition.',{table:[...table],tableHeaders:['Player','First login','Required return','Returned?'],codeStage:'retain',metrics:{retained,players:first.size}},'update');}const fraction=Math.round(retained/first.size*100)/100;emit('Each player contributes one denominator unit and at most one retained-player unit. Round the ratio to two decimal places.',{resultRecords:records(550,[{fraction}]),codeStage:'fraction',metrics:{retained,players:first.size,fraction}},'update');return [{fraction}];},
577({employee,bonus},emit){const lookup=new Map(bonus.map(row=>[row.empId,row.bonus])),answer=[];for(let i=0;i<employee.length;i++){const row=employee[i],amount=lookup.has(row.empId)?lookup.get(row.empId):null,keep=amount===null||amount<1000;if(keep)answer.push({name:row.name,bonus:amount});emit(amount===null?'The left join preserves this employee even without a matching bonus record. Keep the null bonus in the output.':keep?'This matched bonus is below 1000, so keep the employee.':'This matched bonus is at least 1000, so it does not satisfy the filter.',{sourceRecords:{label:'Employee',columns:schemas[577].tables[0][2],rows:employee,activeRow:i},resultRecords:records(577,[...answer]),codeStage:'filter',metrics:{employee:row.empId,bonus:amount??'NULL',keep}},'update');}return answer;},
586({orders},emit){const counts=new Map();for(let i=0;i<orders.length;i++){const row=orders[i];counts.set(row.customer_number,(counts.get(row.customer_number)||0)+1);emit('This order contributes one to its customer group. Order numbers identify records; they do not affect the ranking.',{sourceRecords:{label:'Orders',columns:schemas[586].tables[0][2],rows:orders,activeRow:i},table:[...counts],tableHeaders:['Customer','Orders so far'],codeStage:'count'},'update');}let winner=null,best=-1;for(const[customer,count]of counts)if(count>best){winner=customer;best=count;}emit('All groups are complete. Select the unique customer with the greatest order count.',{resultRecords:records(586,[{customer_number:winner}]),codeStage:'winner',metrics:{customer:winner,orders:best}},'update');return [{customer_number:winner}];},
};
const python={
534:`def cumulativeGames(activity):
    ordered = sorted(activity, key=lambda row: (row['player_id'], row['event_date']))
    answer, previous, total = [], None, 0
    for row in ordered:
        if row['player_id'] != previous:
            total = 0
        previous = row['player_id']
        total += row['games_played']  # step: accumulate
        answer.append({'player_id': previous, 'event_date': row['event_date'],
                       'games_played_so_far': total})
    return answer  # step: return`,
550:`def nextDayRetention(activity):
    from datetime import date, timedelta
    from decimal import Decimal, ROUND_HALF_UP
    dates = {}
    for row in activity:
        dates.setdefault(row['player_id'], set()).add(date.fromisoformat(row['event_date']))
    retained = 0
    for logins in dates.values():
        if min(logins) + timedelta(days=1) in logins:
            retained += 1  # step: retain
    fraction = (Decimal(retained) / Decimal(len(dates))).quantize(
        Decimal('0.01'), rounding=ROUND_HALF_UP)  # step: fraction
    return [{'fraction': float(fraction)}]  # step: return`,
577:`def employeeBonus(employee, bonus):
    lookup = {row['empId']: row['bonus'] for row in bonus}
    answer = []
    for row in employee:
        amount = lookup.get(row['empId'])
        if amount is None or amount < 1000:  # step: filter
            answer.append({'name': row['name'], 'bonus': amount})
    return answer  # step: return`,
586:`def largestOrderCustomer(orders):
    counts = {}
    for row in orders:
        customer = row['customer_number']
        counts[customer] = counts.get(customer, 0) + 1  # step: count
    winner = max(counts, key=counts.get)  # step: winner
    return [{'customer_number': winner}]  # step: return`,
};
const sql={
534:`SELECT player_id, event_date,
       SUM(games_played) OVER (
           PARTITION BY player_id ORDER BY event_date
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS games_played_so_far
FROM Activity;`,
550:`WITH FirstLogin AS (
    SELECT player_id, MIN(event_date) AS first_date
    FROM Activity GROUP BY player_id
)
SELECT ROUND(AVG(CASE WHEN a.player_id IS NULL THEN 0 ELSE 1 END), 2) AS fraction
FROM FirstLogin AS f
LEFT JOIN Activity AS a
  ON a.player_id = f.player_id
 AND a.event_date = DATE_ADD(f.first_date, INTERVAL 1 DAY);`,
577:`SELECT e.name, b.bonus
FROM Employee AS e
LEFT JOIN Bonus AS b ON b.empId = e.empId
WHERE b.bonus < 1000 OR b.bonus IS NULL;`,
586:`SELECT customer_number
FROM Orders
GROUP BY customer_number
ORDER BY COUNT(*) DESC
LIMIT 1;`,
};
const rows=(columns,values)=>values.map(row=>Object.fromEntries(columns.map((key,i)=>[key,row[i]])));
const activity=values=>rows(activityColumns,values);
const employee=values=>rows(schemas[577].tables[0][2],values);
const bonus=values=>rows(['empId','bonus'],values);
const orders=values=>rows(['order_number','customer_number'],values);
const cases={
534:[['Interleaved players and unsorted dates need separate running totals',{activity:activity([[31,4,'2025-04-08',6],[12,2,'2025-04-03',9],[31,5,'2025-04-02',4],[12,2,'2025-04-07',0],[31,4,'2025-04-05',3],[12,8,'2025-04-01',2],[45,1,'2025-04-09',7]])}],['Zero-game sessions retain the accumulated total',{activity:activity([[7,2,'2025-06-01',5],[7,3,'2025-06-02',0],[7,2,'2025-06-04',0]])}],['A device change does not start a new player total',{activity:activity([[9,1,'2025-01-01',3],[9,8,'2025-01-09',8]])}],['An empty activity table produces no result rows',{activity:[]}]],
550:[['Only returns following each player first login count',{activity:activity([[11,1,'2025-08-01',2],[11,2,'2025-08-02',0],[11,2,'2025-08-03',4],[22,1,'2025-08-03',3],[22,1,'2025-08-05',5],[33,2,'2025-08-06',1],[33,2,'2025-08-07',6],[44,3,'2025-08-09',2],[44,3,'2025-08-10',3]])}],['The next day can cross a leap-year month boundary',{activity:activity([[5,2,'2024-02-28',0],[5,2,'2024-02-29',0],[6,1,'2024-02-29',1],[6,1,'2024-03-01',2]])}],['Later consecutive sessions do not repair a missed first-day return',{activity:activity([[8,1,'2025-03-01',2],[8,1,'2025-03-03',2],[8,1,'2025-03-04',2]])}],['One retained player among three requires rounding',{activity:activity([[1,1,'2025-12-31',1],[1,2,'2026-01-01',1],[2,1,'2025-12-31',1],[3,1,'2025-12-31',1]])}]],
577:[['Missing low and threshold bonuses share one employee roster',{employee:employee([[10,'Mira',null,6000],[20,'Dev',10,4200],[30,'Lina',10,3900],[40,'Omar',20,3500],[50,'Nia',20,3700],[60,'Pavel',30,4100]]),bonus:bonus([[10,1800],[20,999],[40,1000],[50,0],[60,750]])}],['No bonus rows preserves every employee',{employee:employee([[7,'Ari',null,4000],[8,'Bo',7,3000]]),bonus:[]}],['Exactly 1000 does not qualify',{employee:employee([[9,'Cleo',null,5000]]),bonus:bonus([[9,1000]])}],['No employee rows means no output',{employee:[],bonus:[]}]],
586:[['Interleaved orders reveal a winner only after counting',{orders:orders([[101,8],[102,3],[103,8],[104,7],[105,3],[106,8],[107,7],[108,8],[109,3]])}],['One order has one winning customer',{orders:orders([[71,42]])}],['Every order can belong to the same customer',{orders:orders([[5,19],[11,19],[28,19],[36,19]])}],['Large order IDs do not outweigh a larger group',{orders:orders([[900,5],[12,6],[13,6],[14,6],[901,5]])}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);};for(const[key,label,columns]of schemas[id].tables){need(Array.isArray(input[key])&&input[key].length<=60,`${label} must contain at most 60 rows.`);for(const row of input[key]){need(row&&typeof row==='object'&&!Array.isArray(row)&&columns.every(c=>c in row),`${label} needs columns ${columns.join(', ')}.`);for(const column of columns){const value=row[column];if(column==='name')need(typeof value==='string'&&value.length>=1&&value.length<=40,'Names must contain 1-40 characters.');else if(column==='event_date'){need(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value,'Use real dates formatted YYYY-MM-DD.');}else if(column==='supervisor'&&value===null)continue;else need(Number.isSafeInteger(value)&&value>=0&&value<=10000000,`${column} must be an integer between 0 and 10000000.`);}}const keys=key==='activity'?['player_id','event_date']:[columns[0]];need(new Set(input[key].map(row=>JSON.stringify(keys.map(k=>row[k])))).size===input[key].length,`${label} primary keys must be unique.`);}if(id===550)need(input.activity.length>0,'At least one player is required to define the retention fraction.');if(id===577){const ids=new Set(input.employee.map(row=>row.empId));need(input.bonus.every(row=>ids.has(row.empId)),'Each bonus must reference an existing employee.');need(input.employee.every(row=>row.supervisor===null||ids.has(row.supervisor)),'Each supervisor must be null or an existing employee.');}if(id===586){need(input.orders.length>0,'Supply at least one order.');const counts=new Map();for(const row of input.orders)counts.set(row.customer_number,(counts.get(row.customer_number)||0)+1);const max=Math.max(...counts.values());need([...counts.values()].filter(n=>n===max).length===1,'The problem requires one uniquely most frequent customer.');}return input;}
const inputState=(id,input)=>{const tables=schemas[id].tables.map(([key,label,columns])=>({label,columns,rows:input[key]}));return {sourceRecords:tables[0],additionalSourceRecords:tables.slice(1)};};
export default {specs,solvers,python,sql,cases,validate,inputState,resultState:(id,result)=>({resultRecords:records(id,result)}),pseudocodeStages:{534:{accumulate:3},550:{retain:3,fraction:4},577:{filter:4},586:{count:3,winner:4}},tags:Object.fromEntries(Object.keys(specs).map(id=>[id,['Database']]))};
