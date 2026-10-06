// Table identities follow the linked catalog problems; explanations and data are authored here.
const specs={
1939:['signups confirmations','Find users with two confirmation requests no more than twenty-four hours apart.','Sort requests within each user and compare adjacent timestamps. Any close pair implies a close adjacent pair; confirmation outcome does not affect the time-window condition.','group requests by user and sort timestamps|inspect each adjacent request pair|measure the elapsed seconds|include the user once when the gap is at most 86400 seconds|return qualifying user IDs','O(requests log requests) reference time; O(requests) grouped space.'],
1949:['friendship','Find existing friendships with at least three mutual friends.','Build undirected neighbor sets, then intersect the two sets for each existing friendship. Sharing friends alone is insufficient unless the two users are already friends.','build both directions of every friendship|visit each original friendship once|intersect its users neighbor sets|emit pairs with at least three common neighbors|return strong friendships and common-friend counts','O(edges*maximum degree) reference time; O(edges) adjacency space.'],
1965:['employees salaries','Find employee IDs missing either their name record or salary record.','An ID present in exactly one source table is missing information. Use the symmetric difference of employee-ID sets and sort the result.','collect IDs from both tables|visit the union of employee IDs|check presence in each source|keep IDs appearing in exactly one source|return IDs in increasing order','O(rows + IDs log IDs) time; O(IDs) set space.'],
1978:['employees','Find low-paid employees whose manager record has left the company.','Use the current employee-ID set to check manager existence. Qualify only salaries strictly below 30000 and non-null manager IDs that are absent from that set.','collect all current employee IDs|inspect each employee record|check the salary threshold and non-null manager|keep records whose manager ID is absent|return employee IDs in increasing order','O(n log n) reference time with output sorting; O(n) ID space.'],
1988:['schools exam','Choose each school minimum feasible score threshold.','Among exam thresholds admitting no more students than capacity, choose the smallest score. Monotone cumulative counts make this maximize eligible students and break equal-count ties toward the smaller score.','read a school capacity|inspect available exam thresholds|retain thresholds whose student count fits capacity|choose the smallest retained score or -1 if none|return one cutoff row per school','O(schools*exam rows) reference time; O(schools) output space.'],
1990:['experiments','Count experiments for every platform and experiment-name combination.','Initialize the full three-by-three category grid with zeros, then increment the observed category pair for each record. Empty categories remain visible in the output.','construct all nine category pairs with zero counts|read the next experiment|locate its platform and experiment-name pair|increment that pair while preserving empty categories|return all nine counts','O(rows + nine categories) time; O(nine categories) state.'],
};
const schemas={
1939:{tables:[['signups','Signups',['user_id','time_stamp']],['confirmations','Confirmations',['user_id','time_stamp','action']]],result:['user_id']},
1949:{tables:[['friendship','Friendship',['user1_id','user2_id']]],result:['user1_id','user2_id','common_friend']},
1965:{tables:[['employees','Employees',['employee_id','name']],['salaries','Salaries',['employee_id','salary']]],result:['employee_id']},
1978:{tables:[['employees','Employees',['employee_id','name','manager_id','salary']]],result:['employee_id']},
1988:{tables:[['schools','Schools',['school_id','capacity']],['exam','Exam',['score','student_count']]],result:['school_id','score']},
1990:{tables:[['experiments','Experiments',['experiment_id','platform','experiment_name']]],result:['platform','experiment_name','num_experiments']},
};
function inputState(id,input,activeField,activeRow=-1){const tables=schemas[id].tables.map(([key,label,columns])=>({label,columns,rows:input[key],activeRow:key===activeField?activeRow:-1}));return{sourceRecords:tables[0],additionalSourceRecords:tables.slice(1)};}
function resultState(id,rows){return{resultRecords:{label:'Result rows',columns:schemas[id].result,rows}};}
const seconds=value=>Date.parse(value.replace(' ','T')+'Z')/1000;
const platforms=['Android','IOS','Web'],names=['Reading','Sports','Programming'];
const solvers={
1939(input,emit){const grouped=new Map(),qualified=new Set();for(const row of input.confirmations){if(!grouped.has(row.user_id))grouped.set(row.user_id,[]);grouped.get(row.user_id).push(row);}for(const[user,rows]of grouped){rows.sort((a,b)=>seconds(a.time_stamp)-seconds(b.time_stamp));for(let i=1;i<rows.length;i++){const gap=seconds(rows[i].time_stamp)-seconds(rows[i-1].time_stamp);if(gap<=86400)qualified.add(user);const result=[...qualified].sort((a,b)=>a-b).map(user_id=>({user_id}));emit('Consecutive requests reveal the smallest gaps for this user. The boundary is inclusive: exactly twenty-four hours qualifies, regardless of confirmed or timeout status.',{...inputState(1939,input,'confirmations',input.confirmations.indexOf(rows[i])),...resultState(1939,result),codeStage:'update',metrics:{user,previous:rows[i-1].time_stamp,current:rows[i].time_stamp,gapSeconds:gap,qualifies:gap<=86400}},'update');}}return[...qualified].sort((a,b)=>a-b).map(user_id=>({user_id}));},
1949(input,emit){const friends=new Map();for(const{user1_id:a,user2_id:b}of input.friendship){if(!friends.has(a))friends.set(a,new Set());if(!friends.has(b))friends.set(b,new Set());friends.get(a).add(b);friends.get(b).add(a);}const result=[];for(let i=0;i<input.friendship.length;i++){const{user1_id:a,user2_id:b}=input.friendship[i],common=[...friends.get(a)].filter(v=>friends.get(b).has(v));if(common.length>=3)result.push({user1_id:a,user2_id:b,common_friend:common.length});emit('Count common neighbors only for this existing edge. The two endpoint users are not their own neighbors, and three common friends is enough to qualify.',{...inputState(1949,input,'friendship',i),...resultState(1949,[...result]),codeStage:'update',metrics:{first:a,second:b,common:common.join(', ')||'none',count:common.length,strong:common.length>=3}},'update');}return result;},
1965(input,emit){const names=new Set(input.employees.map(r=>r.employee_id)),pay=new Set(input.salaries.map(r=>r.employee_id)),ids=[...new Set([...names,...pay])].sort((a,b)=>a-b),result=[];for(const employee_id of ids){const hasName=names.has(employee_id),hasSalary=pay.has(employee_id);if(hasName!==hasSalary)result.push({employee_id});emit('An employee is incomplete when exactly one source contains the ID. IDs present in both tables have all required information and are excluded.',{...resultState(1965,[...result]),codeStage:'update',metrics:{employee_id,hasName,hasSalary,missing:hasName===hasSalary?'none':hasName?'salary record':'name record'}},'update');}return result;},
1978(input,emit){const ids=new Set(input.employees.map(r=>r.employee_id)),result=[];for(let i=0;i<input.employees.length;i++){const row=input.employees[i],managerMissing=row.manager_id!==null&&!ids.has(row.manager_id),qualifies=row.salary<30000&&managerMissing;if(qualifies)result.push({employee_id:row.employee_id});emit('A null manager means no manager was assigned, so it is not a departed-manager case. Salary must be strictly below the threshold and the referenced manager must be absent.',{...inputState(1978,input,'employees',i),...resultState(1978,[...result].sort((a,b)=>a.employee_id-b.employee_id)),codeStage:'update',metrics:{salary:row.salary,manager:row.manager_id,managerMissing,qualifies}},'update');}return result.sort((a,b)=>a.employee_id-b.employee_id);},
1988(input,emit){const result=[];for(let i=0;i<input.schools.length;i++){const school=input.schools[i],eligible=input.exam.filter(row=>row.student_count<=school.capacity),score=eligible.length?Math.min(...eligible.map(row=>row.score)):-1;result.push({school_id:school.school_id,score});emit('The cumulative exam counts decrease as thresholds rise. Among feasible rows, the smallest score admits as many candidates as possible; missing a feasible row requires -1, not an invented higher score.',{...inputState(1988,input,'schools',i),...resultState(1988,[...result]),table:eligible.map(row=>[row.score,row.student_count]),tableHeaders:['Feasible score','Eligible students'],codeStage:'update',metrics:{school:school.school_id,capacity:school.capacity,score}},'update');}return result;},
1990(input,emit){const result=platforms.flatMap(platform=>names.map(experiment_name=>({platform,experiment_name,num_experiments:0})));for(let i=0;i<input.experiments.length;i++){const row=input.experiments[i],group=result.find(g=>g.platform===row.platform&&g.experiment_name===row.experiment_name);group.num_experiments++;emit('Increment the observed category pair. Every unobserved pair remains in the prebuilt grid with count zero, so the result always includes all nine combinations.',{...inputState(1990,input,'experiments',i),...resultState(1990,result.map(r=>({...r}))),codeStage:'update',metrics:{platform:row.platform,experiment:row.experiment_name,count:group.num_experiments}},'update');}return result;},
};

const python={
1939:`def activeConfirmationUsers(signups, confirmations):
    from collections import defaultdict
    from datetime import datetime
    grouped = defaultdict(list)
    for row in confirmations:
        grouped[row['user_id']].append(datetime.fromisoformat(row['time_stamp']))
    qualified = set()
    for user, times in grouped.items():
        times.sort()
        for previous, current in zip(times, times[1:]):
            if (current - previous).total_seconds() <= 86400:
                qualified.add(user)
            # step: update
    return [{'user_id': user} for user in sorted(qualified)]  # step: return`,
1949:`def strongFriendships(friendship):
    from collections import defaultdict
    friends = defaultdict(set)
    for row in friendship:
        a, b = row['user1_id'], row['user2_id']
        friends[a].add(b)
        friends[b].add(a)
    result = []
    for row in friendship:
        a, b = row['user1_id'], row['user2_id']
        common = len(friends[a] & friends[b])
        if common >= 3:
            result.append({'user1_id': a, 'user2_id': b, 'common_friend': common})
        # step: update
    return result  # step: return`,
1965:`def missingEmployeeInformation(employees, salaries):
    names = {row['employee_id'] for row in employees}
    pay = {row['employee_id'] for row in salaries}
    result = []
    for employee_id in sorted(names | pay):
        if (employee_id in names) != (employee_id in pay):
            result.append({'employee_id': employee_id})
        # step: update
    return result  # step: return`,
1978:`def employeesWithDepartedManagers(employees):
    ids = {row['employee_id'] for row in employees}
    result = []
    for row in employees:
        manager_missing = row['manager_id'] is not None and row['manager_id'] not in ids
        if row['salary'] < 30000 and manager_missing:
            result.append({'employee_id': row['employee_id']})
        # step: update
    return sorted(result, key=lambda row: row['employee_id'])  # step: return`,
1988:`def schoolCutoffs(schools, exam):
    result = []
    for school in schools:
        feasible = [row['score'] for row in exam if row['student_count'] <= school['capacity']]
        score = min(feasible, default=-1)
        result.append({'school_id': school['school_id'], 'score': score})  # step: update
    return result  # step: return`,
1990:`def experimentCounts(experiments):
    platforms = ['Android', 'IOS', 'Web']
    names = ['Reading', 'Sports', 'Programming']
    counts = {(platform, name): 0 for platform in platforms for name in names}
    for row in experiments:
        counts[row['platform'], row['experiment_name']] += 1  # step: update
    return [{'platform': platform, 'experiment_name': name, 'num_experiments': count} for (platform, name), count in counts.items()]  # step: return`,
};

const sql={
1939:`WITH ordered_requests AS (
    SELECT user_id, time_stamp,
           LAG(time_stamp) OVER (PARTITION BY user_id ORDER BY time_stamp) AS previous_request
    FROM Confirmations
)
SELECT DISTINCT user_id
FROM ordered_requests
WHERE TIMESTAMPDIFF(SECOND, previous_request, time_stamp) <= 86400;`,
1949:`WITH neighbors AS (
    SELECT user1_id AS user_id, user2_id AS friend_id FROM Friendship
    UNION ALL
    SELECT user2_id, user1_id FROM Friendship
)
SELECT f.user1_id, f.user2_id, COUNT(*) AS common_friend
FROM Friendship AS f
JOIN neighbors AS a ON a.user_id = f.user1_id
JOIN neighbors AS b ON b.user_id = f.user2_id AND b.friend_id = a.friend_id
GROUP BY f.user1_id, f.user2_id
HAVING COUNT(*) >= 3;`,
1965:`SELECT e.employee_id
FROM Employees AS e
LEFT JOIN Salaries AS s ON s.employee_id = e.employee_id
WHERE s.employee_id IS NULL
UNION
SELECT s.employee_id
FROM Salaries AS s
LEFT JOIN Employees AS e ON e.employee_id = s.employee_id
WHERE e.employee_id IS NULL
ORDER BY employee_id;`,
1978:`SELECT e.employee_id
FROM Employees AS e
LEFT JOIN Employees AS manager ON manager.employee_id = e.manager_id
WHERE e.salary < 30000
  AND e.manager_id IS NOT NULL
  AND manager.employee_id IS NULL
ORDER BY e.employee_id;`,
1988:`SELECT s.school_id, COALESCE(MIN(e.score), -1) AS score
FROM Schools AS s
LEFT JOIN Exam AS e ON e.student_count <= s.capacity
GROUP BY s.school_id;`,
1990:`WITH platforms AS (
    SELECT 'Android' AS platform UNION ALL SELECT 'IOS' UNION ALL SELECT 'Web'
), names AS (
    SELECT 'Reading' AS experiment_name UNION ALL SELECT 'Sports' UNION ALL SELECT 'Programming'
)
SELECT p.platform, n.experiment_name, COUNT(e.experiment_id) AS num_experiments
FROM platforms AS p CROSS JOIN names AS n
LEFT JOIN Experiments AS e
  ON e.platform = p.platform AND e.experiment_name = n.experiment_name
GROUP BY p.platform, n.experiment_name;`,
};

const records=(columns,rows)=>rows.map(values=>Object.fromEntries(columns.map((column,i)=>[column,values[i]])));
const signups=ids=>ids.map(user_id=>({user_id,time_stamp:'2024-02-10 08:00:00'}));
const confirmations=rows=>records(['user_id','time_stamp','action'],rows);
const friendship=rows=>records(['user1_id','user2_id'],rows);
const employees=rows=>records(['employee_id','name'],rows);
const salaries=rows=>records(['employee_id','salary'],rows);
const staff=rows=>records(['employee_id','name','manager_id','salary'],rows);
const schools=rows=>records(['school_id','capacity'],rows);
const exam=rows=>records(['score','student_count'],rows);
const experiments=rows=>records(['experiment_id','platform','experiment_name'],rows);
const cases={
1939:[['Different users have repeated requests at different gaps',{signups:signups([11,17,29]),confirmations:confirmations([[11,'2025-04-03 08:00:00','timeout'],[29,'2025-05-01 10:00:00','confirmed'],[17,'2025-04-08 12:00:00','timeout'],[11,'2025-04-03 13:30:00','confirmed'],[29,'2025-05-03 11:00:00','timeout'],[17,'2025-04-10 12:00:01','confirmed'],[11,'2025-04-04 07:00:00','timeout'],[29,'2025-05-03 17:00:00','confirmed']])}],['Exactly one day qualifies regardless of action',{signups:signups([41]),confirmations:confirmations([[41,'2025-06-02 09:15:00','confirmed'],[41,'2025-06-03 09:15:00','timeout']])}],['One second beyond a day does not qualify',{signups:signups([43]),confirmations:confirmations([[43,'2025-06-02 09:15:00','timeout'],[43,'2025-06-03 09:15:01','timeout']])}],['Registered users with no confirmation requests',{signups:signups([47,53]),confirmations:[]}]],
1949:[['One friendship shares four common neighbors',{friendship:friendship([[10,20],[10,30],[10,40],[10,50],[10,60],[20,30],[20,40],[20,50],[20,60],[60,70]])}],['Exactly three common friends meet the boundary',{friendship:friendship([[71,83],[71,91],[71,97],[71,101],[83,91],[83,97],[83,101]])}],['Common neighbors without a direct friendship are excluded',{friendship:friendship([[71,91],[71,97],[71,101],[83,91],[83,97],[83,101]])}],['No friendships produce no result',{friendship:[]}]],
1965:[['Missing names and salaries appear on opposite sides',{employees:employees([[101,'Mira'],[108,'Theo'],[112,'Ravi'],[125,'Nora'],[131,'Omar']]),salaries:salaries([[108,42000],[112,39000],[119,51000],[131,48000],[144,37000]])}],['Every employee has both records',{employees:employees([[7,'Iris'],[9,'Leon']]),salaries:salaries([[9,36000],[7,41000]])}],['An empty name table leaves every salary incomplete',{employees:[],salaries:salaries([[31,28000],[17,45000]])}],['Both source tables are empty',{employees:[],salaries:[]}]],
1978:[['Threshold and manager presence are separate conditions',{employees:staff([[100,'Mira',null,54000],[101,'Theo',100,28000],[102,'Ravi',900,29999],[103,'Nora',900,30000],[104,'Omar',null,29000],[105,'Iris',901,12000]])}],['Exactly the salary threshold is excluded',{employees:staff([[21,'Ada',88,30000],[22,'Ben',88,29999]])}],['A null manager is not a departed manager',{employees:staff([[31,'Cleo',null,17000]])}],['No employees means no result',{employees:[]}]],
1988:[['Schools choose among tied cumulative exam counts',{schools:schools([[201,80],[205,15],[209,200],[211,75]]),exam:exam([[430,145],[520,110],[610,75],[670,75],[810,18]])}],['Equal student counts choose the smaller score',{schools:schools([[17,30]]),exam:exam([[620,30],[700,30],[790,12]])}],['No threshold fits a small school',{schools:schools([[23,4]]),exam:exam([[400,90],[800,12]])}],['An empty exam table cannot determine a cutoff',{schools:schools([[37,60],[41,120]]),exam:[]}]],
1990:[['Some platform categories repeat while others stay empty',{experiments:experiments([[101,'Web','Sports'],[102,'Android','Programming'],[103,'IOS','Reading'],[104,'Web','Sports'],[105,'IOS','Sports'],[106,'Android','Programming'],[107,'Web','Reading'],[108,'Web','Sports']])}],['Empty input still returns nine zero counts',{experiments:[]}],['All experiments belong to one category',{experiments:experiments([[21,'IOS','Programming'],[22,'IOS','Programming'],[23,'IOS','Programming']])}],['Every category occurs exactly once',{experiments:platforms.flatMap((platform,i)=>names.map((experiment_name,j)=>({experiment_id:300+i*3+j,platform,experiment_name})))}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const timestamp=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)&&Number.isFinite(seconds(value))&&new Date(seconds(value)*1000).toISOString().slice(0,19).replace('T',' ')===value;
  for(const[key,label,columns]of schemas[id].tables){need(Array.isArray(input[key])&&input[key].length<=40,`${label} must contain at most 40 rows.`);for(const row of input[key]){need(row&&typeof row==='object'&&!Array.isArray(row)&&columns.every(column=>column in row),`${label} rows need columns: ${columns.join(', ')}.`);for(const column of columns){const value=row[column];if(column==='time_stamp')need(timestamp(value),'Use real timestamps formatted YYYY-MM-DD HH:MM:SS.');else if(column==='name')need(typeof value==='string'&&/^[A-Za-z ]{1,30}$/.test(value),'Use nonempty alphabetic employee names.');else if(column==='action')need(['confirmed','timeout'].includes(value),'Use confirmed or timeout actions.');else if(column==='platform')need(platforms.includes(value),'Use Android, IOS, or Web.');else if(column==='experiment_name')need(names.includes(value),'Use Reading, Sports, or Programming.');else if(column==='manager_id')need(value===null||integer(value,1),'Use a positive manager ID or null.');else need(integer(value,column.endsWith('_id')?1:0),`${column} must be a bounded nonnegative integer, with IDs positive.`);}}
    const keyFields=key==='confirmations'?['user_id','time_stamp']:key==='friendship'?['user1_id','user2_id']:[columns[0]];
    need(new Set(input[key].map(row=>JSON.stringify(keyFields.map(field=>row[field])))).size===input[key].length,`${label} primary keys must be unique.`);
  }
  if(id===1939){const registered=new Set(input.signups.map(row=>row.user_id));need(input.confirmations.every(row=>registered.has(row.user_id)),'Each confirmation must reference a registered user.');}
  if(id===1949)need(input.friendship.every(row=>row.user1_id<row.user2_id),'Store each friendship once with user1_id < user2_id.');
  if(id===1988){const ordered=[...input.exam].sort((a,b)=>a.score-b.score);need(ordered.every((row,i)=>!i||row.student_count<=ordered[i-1].student_count),'Cumulative student counts must not increase when scores increase.');}
  return input;
}
export default {specs,solvers,python,sql,cases,validate,inputState,resultState,tags:Object.fromEntries(Object.keys(specs).map(id=>[id,['Database']]))};
