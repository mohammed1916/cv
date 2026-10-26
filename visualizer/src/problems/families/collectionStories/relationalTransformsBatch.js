import {requireRecord as need,recordInputState,recordResult,validateRecordTables,recordText,recordDate,rowsFrom} from './authoredRecords.js';
const schemas={614:{tables:[['follow','Follow',['followee','follower'],['followee','follower']]],result:['follower','num']},615:{tables:[['salary','Salary',['id','employee_id','amount','pay_date'],['id']],['employee','Employee',['employee_id','department_id'],['employee_id']]],result:['pay_month','department_id','comparison']},618:{tables:[['student','Student',['name','continent'],[]]],result:['America','Asia','Europe']},626:{tables:[['seat','Seat',['id','student'],['id']]],result:['id','student']},627:{tables:[['salary','Salary',['id','name','sex','salary'],['id']]],result:['id','name','sex','salary']}};
const specs={
614:['follow','Count followers of users who themselves follow at least one other user.','The same person plays two different roles: they must appear as a follower somewhere, and their own follower count comes from rows where they are the followee. Keep only people present in both roles.','collect users appearing in the follower column|count rows grouped by followee|keep followees who also belong to the follower set|sort the retained users alphabetically|return each user as follower with their follower count','O(rows+users log users) time and O(users) space.'],
615:['salary employee','Compare each department monthly average salary with the company average for that same month.','Join payments to departments and aggregate sums and counts by month. Compare department sum times company count with company sum times department count, so unequal group sizes and rounding cannot distort the comparison.','join each payment to its employee department and calendar month|accumulate sum and count for each company month|accumulate sum and count for each department month|compare exact cross products to label higher lower or same|return each month department and comparison','O(payments+employees) expected time and O(month-department groups) space.'],
618:['student','Pivot alphabetically ordered student names into America Asia and Europe columns.','Sort names independently inside each continent, then align their first names on row one, second names on row two, and so on. A missing name at a rank becomes null rather than shifting another column.','group student names by continent|sort each continent list alphabetically|align equal one-based positions across the three lists|fill absent positions with null|return the three-column student report','O(students log students) time and O(students) space.'],
626:['seat','Exchange every neighboring pair of student seats while leaving an unpaired last seat unchanged.','Seat IDs form a continuous sequence from one. Each odd seat takes the following student, each even seat takes the preceding student, and an odd final seat has no partner.','order the continuous seat IDs|process seats in pairs|exchange the two students while retaining the seat IDs|keep the final student when the row count is odd|return records ordered by seat ID','O(seats log seats) reference sorting time and O(seats) output space.'],
627:['salary','Swap the stored m and f category values for every employee in one update.','Each output value depends on the row original category. A single CASE update chooses the opposite value without a second update accidentally changing already-updated rows again.','read each row original category|map m to f|map f to m|retain the employee other fields|return the updated table snapshot','O(rows) time; SQL uses one UPDATE statement.'],
};
const result=(id,rows)=>recordResult(schemas[id],rows);
const solvers={
614({follow},emit){const followers=new Set(follow.map(r=>r.follower)),counts=new Map();for(const row of follow)counts.set(row.followee,(counts.get(row.followee)||0)+1);const answer=[];for(const person of [...counts.keys()].sort()){const keep=followers.has(person);if(keep)answer.push({follower:person,num:counts.get(person)});emit('This user has followers because it appears as a followee. Include it only if another row also shows that user following someone.',{table:[...counts].map(([user,count])=>[user,count,followers.has(user)]),tableHeaders:['User being followed','Their followers','Also follows someone?'],resultRecords:result(614,[...answer]),codeStage:'roles',metrics:{person,keep}},'update');}return answer;},
615({salary,employee},emit){const departments=new Map(employee.map(r=>[r.employee_id,r.department_id])),company=new Map(),groups=new Map();for(const row of salary){const month=row.pay_date.slice(0,7),department=departments.get(row.employee_id),key=`${month}:${department}`;if(!company.has(month))company.set(month,[0,0]);if(!groups.has(key))groups.set(key,{month,department,sum:0,count:0});company.get(month)[0]+=row.amount;company.get(month)[1]++;const group=groups.get(key);group.sum+=row.amount;group.count++;emit('Add the same payment to its month company aggregate and its month-department aggregate. Comparisons must use matching months.',{table:[...groups.values()].map(g=>[g.month,g.department,g.sum,g.count]),tableHeaders:['Month','Department','Sum','Payments'],codeStage:'aggregate'},'update');}const answer=[];for(const group of groups.values()){const[sum,count]=company.get(group.month),left=group.sum*count,right=sum*group.count,comparison=left>right?'higher':left<right?'lower':'same';answer.push({pay_month:group.month,department_id:group.department,comparison});emit('Compare cross products rather than rounded averages. Every payment contributes its own weight, even when department sizes differ.',{resultRecords:result(615,[...answer]),codeStage:'compare',metrics:{month:group.month,department:group.department,departmentAverage:group.sum/group.count,companyAverage:sum/count,comparison}},'update');}return answer;},
618({student},emit){const groups={America:[],Asia:[],Europe:[]};for(const row of student)groups[row.continent].push(row.name);for(const values of Object.values(groups))values.sort();const answer=[];for(let i=0;i<Math.max(...Object.values(groups).map(a=>a.length));i++){answer.push(Object.fromEntries(Object.entries(groups).map(([name,values])=>[name,values[i]??null])));emit('Align names by their sorted position within their own continent. Shorter columns contribute null at this rank.',{resultRecords:result(618,[...answer]),codeStage:'pivot',metrics:{rank:i+1}},'update');}return answer;},
626({seat},emit){const answer=[...seat].sort((a,b)=>a.id-b.id).map(row=>({...row}));for(let i=0;i<answer.length;i+=2){const paired=i+1<answer.length;if(paired)[answer[i].student,answer[i+1].student]=[answer[i+1].student,answer[i].student];emit(paired?'Swap the students in this adjacent pair while keeping the sorted seat IDs in place.':'This is the final odd seat. It has no partner, so its student stays.',{resultRecords:result(626,answer.map(row=>({...row}))),codeStage:'swap',metrics:{firstSeat:answer[i].id,paired}},'update');}return answer;},
627({salary},emit){const answer=[];for(let i=0;i<salary.length;i++){const row=salary[i],sex=row.sex==='m'?'f':'m';answer.push({...row,sex});emit('Choose the opposite category from this row original value. Names, IDs, and salary amounts are copied unchanged.',{sourceRecords:{label:'Salary before update',columns:schemas[627].result,rows:salary,activeRow:i},resultRecords:result(627,[...answer]),codeStage:'swap',metrics:{id:row.id,original:row.sex,updated:sex}},'update');}return answer;},
};
const python={
614:`def secondDegreeFollowers(follow):
    followers = {row['follower'] for row in follow}
    counts = {}
    for row in follow:
        user = row['followee']
        counts[user] = counts.get(user, 0) + 1
    answer = []
    for user in sorted(counts):
        if user in followers:  # step: roles
            answer.append({'follower': user, 'num': counts[user]})
    return answer  # step: return`,
615:`def compareDepartmentSalary(salary, employee):
    departments = {row['employee_id']: row['department_id'] for row in employee}
    company, groups = {}, {}
    for row in salary:
        month = row['pay_date'][:7]
        key = (month, departments[row['employee_id']])
        for table, group_key in ((company, month), (groups, key)):
            total, count = table.get(group_key, (0, 0))
            table[group_key] = (total + row['amount'], count + 1)  # step: aggregate
    answer = []
    for (month, department), (total, count) in groups.items():
        company_total, company_count = company[month]
        left, right = total * company_count, company_total * count
        comparison = 'higher' if left > right else 'lower' if left < right else 'same'  # step: compare
        answer.append({'pay_month': month, 'department_id': department, 'comparison': comparison})
    return answer  # step: return`,
618:`def geographyReport(student):
    groups = {name: [] for name in ('America', 'Asia', 'Europe')}
    for row in student:
        groups[row['continent']].append(row['name'])
    for names in groups.values():
        names.sort()
    answer = []
    for index in range(max(map(len, groups.values()))):
        answer.append({name: values[index] if index < len(values) else None
                       for name, values in groups.items()})  # step: pivot
    return answer  # step: return`,
626:`def exchangeSeats(seat):
    answer = [dict(row) for row in sorted(seat, key=lambda row: row['id'])]
    for index in range(0, len(answer) - 1, 2):
        answer[index]['student'], answer[index + 1]['student'] = (
            answer[index + 1]['student'], answer[index]['student'])  # step: swap
    return answer  # step: return`,
627:`def swapCategories(salary):
    answer = []
    for row in salary:
        updated = dict(row)
        updated['sex'] = 'f' if row['sex'] == 'm' else 'm'  # step: swap
        answer.append(updated)
    return answer  # step: return`,
};
const sql={
614:`SELECT f.followee AS follower, COUNT(*) AS num
FROM Follow AS f
WHERE EXISTS (SELECT 1 FROM Follow AS parent WHERE parent.follower = f.followee)
GROUP BY f.followee ORDER BY follower;`,
615:`WITH CompanyMonth AS (
    SELECT DATE_FORMAT(pay_date, '%Y-%m') AS pay_month, SUM(amount) AS total, COUNT(*) AS cnt
    FROM Salary GROUP BY pay_month
), DepartmentMonth AS (
    SELECT DATE_FORMAT(s.pay_date, '%Y-%m') AS pay_month, e.department_id,
           SUM(s.amount) AS total, COUNT(*) AS cnt
    FROM Salary AS s JOIN Employee AS e ON e.employee_id = s.employee_id
    GROUP BY pay_month, e.department_id
)
SELECT d.pay_month, d.department_id,
    CASE WHEN d.total * c.cnt > c.total * d.cnt THEN 'higher'
         WHEN d.total * c.cnt < c.total * d.cnt THEN 'lower'
         ELSE 'same' END AS comparison
FROM DepartmentMonth AS d JOIN CompanyMonth AS c ON c.pay_month = d.pay_month;`,
618:`WITH Ranked AS (
    SELECT name, continent, ROW_NUMBER() OVER (PARTITION BY continent ORDER BY name) AS position
    FROM Student
)
SELECT MAX(CASE WHEN continent = 'America' THEN name END) AS America,
       MAX(CASE WHEN continent = 'Asia' THEN name END) AS Asia,
       MAX(CASE WHEN continent = 'Europe' THEN name END) AS Europe
FROM Ranked GROUP BY position ORDER BY position;`,
626:`SELECT CASE WHEN MOD(id, 2) = 0 THEN id - 1
            WHEN id < (SELECT MAX(id) FROM Seat) THEN id + 1
            ELSE id END AS id, student
FROM Seat ORDER BY id;`,
627:`UPDATE Salary SET sex = CASE WHEN sex = 'm' THEN 'f' ELSE 'm' END;`,
};
const follow=values=>rowsFrom(['followee','follower'],values),employee=values=>rowsFrom(['employee_id','department_id'],values),salary=values=>values.map(([employee_id,amount,pay_date],i)=>({id:i+1,employee_id,amount,pay_date})),student=values=>rowsFrom(['name','continent'],values),seat=names=>names.map((student,i)=>({id:i+1,student})),staff=values=>values.map(([name,sex,salary],i)=>({id:i+1,name,sex,salary}));
const cases={
614:[['Middle users can follow several accounts and have their own audiences',{follow:follow([['Ada','Bex'],['Ada','Cy'],['Bex','Dee'],['Bex','Eli'],['Cy','Fay'],['Dee','Gia'],['Ada','Dee']])}],['A simple chain has one second-degree user',{follow:follow([['Oak','Pine'],['Pine','Reed']])}],['A star has no user in both roles',{follow:follow([['Sun','Moon'],['Sun','Star'],['Sun','Cloud']])}],['Mutual followers both satisfy the role condition',{follow:follow([['Lia','Moe'],['Moe','Lia']])}]],
615:[['Unequal departments and two months need separate weighted comparisons',{employee:employee([[1,10],[2,10],[3,20],[4,30]]),salary:salary([[1,4000,'2025-01-05'],[2,6000,'2025-01-05'],[3,9000,'2025-01-05'],[4,1000,'2025-01-05'],[1,7000,'2025-02-05'],[2,7000,'2025-02-05'],[3,7000,'2025-02-05'],[4,7000,'2025-02-05']])}],['One department always matches its company month',{employee:employee([[4,8],[9,8]]),salary:salary([[4,3500,'2025-03-01'],[9,7500,'2025-03-01']])}],['A department with no payment in a month has no group',{employee:employee([[1,2],[2,3]]),salary:salary([[1,4000,'2025-04-01'],[2,8000,'2025-05-01']])}],['No payment records produce no comparisons',{employee:employee([[1,1]]),salary:[]}]],
618:[['Uneven continent lists align sorted names and null padding',{student:student([['Zora','America'],['Kai','Asia'],['Mira','Europe'],['Ari','America'],['Bela','Europe'],['Tao','Asia'],['Noel','America'],['Eden','America']])}],['Only the America column is populated',{student:student([['Ria','America'],['Amir','America']])}],['Equal list sizes need no padding',{student:student([['Ava','America'],['Bo','Asia'],['Cleo','Europe']])}],['No students produce no report rows',{student:[]}]],
626:[['An odd roster swaps full pairs and retains the final student',{seat:seat(['Mira','Dev','Lina','Omar','Nia','Pavel','Rhea'])}],['One student keeps the only seat',{seat:seat(['Sora'])}],['An even roster swaps every seat',{seat:seat(['Tia','Uma','Vik','Wen'])}],['An empty roster stays empty',{seat:[]}]],
627:[['Mixed stored categories swap in a single pass',{salary:staff([['Ari','m',4200],['Bela','f',5100],['Cai','m',3600],['Dara','f',6800],['Eli','f',4700]])}],['All m entries become f',{salary:staff([['Finn','m',2300],['Gray','m',3400]])}],['All f entries become m',{salary:staff([['Hana','f',3900],['Ira','f',5200]])}],['An empty salary table needs no changes',{salary:[]}]],
};
function validate(id,input){validateRecordTables(schemas[id],input,{followee:recordText,follower:recordText,name:recordText,student:recordText,continent:v=>['America','Asia','Europe'].includes(v),sex:v=>v==='m'||v==='f',pay_date:recordDate});if(id===614)need(input.follow.every(r=>r.followee!==r.follower),'Self-follow rows are not permitted.');if(id===615){const ids=new Set(input.employee.map(r=>r.employee_id));need(input.salary.every(r=>ids.has(r.employee_id)&&r.amount>=0),'Each nonnegative payment must reference an employee.');}if(id===618){const counts=['America','Asia','Europe'].map(c=>input.student.filter(r=>r.continent===c).length);need(counts[0]>=counts[1]&&counts[0]>=counts[2],'This problem guarantees America has at least as many students as either other continent.');}if(id===626)need([...input.seat].sort((a,b)=>a.id-b.id).every((r,i)=>r.id===i+1),'Seat IDs must be consecutive starting at one.');if(id===627)need(input.salary.every(r=>r.salary>=0),'Salary amounts must be nonnegative.');return input;}
export default {specs,solvers,python,sql,cases,validate,inputState:(id,input)=>recordInputState(schemas[id],input),resultState:(id,rows)=>({resultRecords:result(id,rows)}),pseudocodeStages:{614:{roles:3},615:{aggregate:3,compare:4},618:{pivot:3},626:{swap:3},627:{swap:4}},tags:Object.fromEntries(Object.keys(specs).map(id=>[id,['Database']]))};
