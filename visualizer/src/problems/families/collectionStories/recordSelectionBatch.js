import {requireRecord as need,recordInputState,recordResult,validateRecordTables,recordText,recordDate,rowsFrom} from './authoredRecords.js';
import {naryTreeLayout} from '../../../components/shared/naryTreeLayout.js';
const schemas={
607:{tables:[['sales','SalesPerson',['sales_id','name','salary','commission_rate','hire_date'],['sales_id']],['companies','Company',['com_id','name','city'],['com_id']],['orders','Orders',['order_id','order_date','com_id','sales_id','amount'],['order_id']]],result:['name']},
608:{tables:[['tree','Tree',['id','p_id'],['id']]],result:['id','type']},
610:{tables:[['triangle','Triangle',['x','y','z'],['x','y','z']]],result:['x','y','z','triangle']},
612:{tables:[['points','Point2D',['x','y'],['x','y']]],result:['shortest']},
613:{tables:[['points','Point',['x'],['x']]],result:['shortest']},
619:{tables:[['numbers','MyNumbers',['num'],[]]],result:['num']},
620:{tables:[['cinema','Cinema',['id','movie','description','rating'],['id']]],result:['id','movie','description','rating']},
};
const specs={
607:['sales companies orders','Find salespeople who have never handled an order for company RED.','Collect IDs of companies named RED, then collect salespeople attached to those orders. Preserve every salesperson outside that exclusion set, including people with no orders at all.','find company IDs whose name is RED|collect salesperson IDs from orders for those companies|visit all salespeople including those without orders|keep people absent from the excluded ID set|return their names','O(salespeople+companies+orders) expected time and space.'],
608:['tree','Classify each tree record as Root Inner or Leaf.','A null parent identifies the root before any other rule. Nonroot nodes appearing as another record parent are inner nodes; the remaining nodes are leaves.','collect all nonnull parent IDs|inspect each node record|label a null-parent node Root|otherwise label nodes with children Inner and the rest Leaf|return every node ID and type','O(nodes) expected time and O(nodes) space.'],
610:['triangle','Classify whether each triple of segment lengths can form a nondegenerate triangle.','All three pair sums must be strictly greater than the opposite side. Equality produces a flat segment, so it must fail rather than count as a triangle.','read a triple of segment lengths|compare x plus y with z|compare x plus z with y and y plus z with x|label Yes only when all strict inequalities hold|return the original lengths and classification','O(rows) time and O(1) auxiliary space excluding output.'],
612:['points','Find the shortest Euclidean distance between distinct planar points, rounded to two decimals.','Compare each unordered pair once using squared distance. Keep the smallest squared value, then take one square root and round only the final result.','enumerate every unordered point pair|compute squared horizontal and vertical differences|keep the smallest sum of squares|take its square root and round to two decimals|return the shortest distance','O(points^2) time and O(1) auxiliary space.'],
613:['points','Find the shortest distance between two distinct points on a line.','After sorting coordinates, the closest pair must be adjacent: any point between a wider pair creates a no-larger gap. Compare only neighboring sorted coordinates.','sort the line coordinates|inspect each neighboring pair|subtract the left coordinate from the right coordinate|keep the smallest adjacent gap|return that minimum distance','O(points log points) time and O(points) sorting space.'],
619:['numbers','Return the largest number that appears exactly once, or null when none exists.','Count complete value groups before selecting a maximum. A large duplicated value is ineligible, and an empty set of singletons must still produce one null result row.','count occurrences of every value|finish all frequency groups|keep groups with count exactly one|select their largest value or null if none exist|return one result row','O(rows) expected time and O(distinct values) space.'],
620:['cinema','Select non-boring movies with odd IDs and rank them by descending rating.','The parity and description predicates must both hold. Filter first, then sort the surviving complete movie records by rating; a high rating cannot rescue a rejected row.','inspect each movie ID and description|require an odd ID and description different from boring|keep records satisfying both predicates|sort retained records by rating descending|return all movie columns','O(movies log movies) time and O(movies) output/sorting space.'],
};
const result=(id,rows)=>recordResult(schemas[id],rows);
const solvers={
607({sales,companies,orders},emit){const red=new Set(companies.filter(row=>row.name==='RED').map(row=>row.com_id)),excluded=new Set(orders.filter(row=>red.has(row.com_id)).map(row=>row.sales_id)),answer=[];for(let i=0;i<sales.length;i++){const row=sales[i],keep=!excluded.has(row.sales_id);if(keep)answer.push({name:row.name});emit('A salesperson qualifies only when no RED order exists for that ID. People with zero orders also satisfy this absence condition.',{sourceRecords:{label:'SalesPerson',columns:schemas[607].tables[0][2],rows:sales,activeRow:i},table:[...excluded].map(id=>[id,'has RED order']),tableHeaders:['Excluded salesperson','Evidence'],resultRecords:result(607,[...answer]),codeStage:'exclude',metrics:{salesperson:row.sales_id,keep}},'update');}return answer;},
608({tree},emit){const parents=new Set(tree.filter(row=>row.p_id!==null).map(row=>row.p_id)),answer=[];const nodes=new Map(tree.map(row=>[row.id,{val:row.id,children:[]}]));for(const row of tree)if(row.p_id!==null)nodes.get(row.p_id).children.push(nodes.get(row.id));const layout=naryTreeLayout(nodes.get(tree.find(row=>row.p_id===null).id));for(let i=0;i<tree.length;i++){const row=tree[i],type=row.p_id===null?'Root':parents.has(row.id)?'Inner':'Leaf';answer.push({id:row.id,type});emit('Root takes priority, including in a one-node tree. Every other node is inner exactly when another row names it as a parent.',{treeDiagram:{...layout,activeIds:new Set(layout.nodes.filter(n=>n.val===row.id).map(n=>n.id))},sourceRecords:{label:'Tree',columns:['id','p_id'],rows:tree,activeRow:i},resultRecords:result(608,[...answer]),codeStage:'classify',metrics:{node:row.id,type}},'update');}return answer;},
610({triangle},emit){const answer=[];for(let i=0;i<triangle.length;i++){const{x,y,z}=triangle[i],checks=[x+y>z,x+z>y,y+z>x],classification=checks.every(Boolean)?'Yes':'No';answer.push({x,y,z,triangle:classification});emit('All three sums must strictly exceed the remaining side. A sum equal to the other side is degenerate and fails.',{sourceRecords:{label:'Triangle',columns:['x','y','z'],rows:triangle,activeRow:i},table:[[`${x}+${y}>${z}`,checks[0]],[`${x}+${z}>${y}`,checks[1]],[`${y}+${z}>${x}`,checks[2]]],tableHeaders:['Required inequality','Satisfied'],resultRecords:result(610,[...answer]),codeStage:'inequality'},'update');}return answer;},
612({points},emit){let best=Infinity;const table=[];for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){const dx=points[i].x-points[j].x,dy=points[i].y-points[j].y,d=dx*dx+dy*dy;best=Math.min(best,d);table.push([i,j,d,best]);emit('Compare this unordered pair using squared distance. Delay the square root and rounding until the smallest pair is known.',{pointState:{points:points.map((p,k)=>({...p,id:k,label:String(k)})),pointCaption:'Planar point records.'},table:[...table],tableHeaders:['Point','Other point','Squared distance','Best squared'],codeStage:'pair'},'update');}return [{shortest:Math.round(Math.sqrt(best)*100)/100}];},
613({points},emit){const ordered=points.map(row=>row.x).sort((a,b)=>a-b);let best=Infinity;for(let i=1;i<ordered.length;i++){const gap=ordered[i]-ordered[i-1];best=Math.min(best,gap);emit('Only adjacent sorted coordinates need comparison: a nonadjacent pair contains an intermediate point and cannot improve both adjacent gaps.',{sequence:ordered,index:i,window:[i-1,i],codeStage:'gap',metrics:{left:ordered[i-1],right:ordered[i],gap,best}},'update');}return [{shortest:best}];},
619({numbers},emit){const counts=new Map();for(let i=0;i<numbers.length;i++){const value=numbers[i].num;counts.set(value,(counts.get(value)||0)+1);emit('Complete the frequency table before choosing a maximum. A value that currently appears once may repeat in a later row.',{sourceRecords:{label:'MyNumbers',columns:['num'],rows:numbers,activeRow:i},table:[...counts],tableHeaders:['Number','Count'],codeStage:'count'},'update');}let best=null;for(const[value,count]of counts)if(count===1&&(best===null||value>best))best=value;return [{num:best}];},
620({cinema},emit){const answer=[];for(let i=0;i<cinema.length;i++){const row=cinema[i],keep=row.id%2===1&&row.description!=='boring';if(keep)answer.push({...row});emit('Both conditions are required: an odd ID and a description other than boring. Ratings are used only to order the survivors.',{sourceRecords:{label:'Cinema',columns:schemas[620].result,rows:cinema,activeRow:i},resultRecords:result(620,[...answer]),codeStage:'filter',metrics:{odd:row.id%2===1,description:row.description,keep}},'update');}answer.sort((a,b)=>b.rating-a.rating);emit('Order the retained complete movie records by decreasing rating.',{resultRecords:result(620,answer),codeStage:'sort'},'update');return answer;},
};
const python={
607:`def noRedOrders(sales, companies, orders):
    red = {row['com_id'] for row in companies if row['name'] == 'RED'}
    excluded = {row['sales_id'] for row in orders if row['com_id'] in red}
    answer = []
    for row in sales:
        if row['sales_id'] not in excluded:  # step: exclude
            answer.append({'name': row['name']})
    return answer  # step: return`,
608:`def treeNodeTypes(tree):
    parents = {row['p_id'] for row in tree if row['p_id'] is not None}
    answer = []
    for row in tree:
        kind = 'Root' if row['p_id'] is None else 'Inner' if row['id'] in parents else 'Leaf'  # step: classify
        answer.append({'id': row['id'], 'type': kind})
    return answer  # step: return`,
610:`def judgeTriangles(triangle):
    answer = []
    for row in triangle:
        x, y, z = row['x'], row['y'], row['z']
        valid = x + y > z and x + z > y and y + z > x  # step: inequality
        answer.append({'x': x, 'y': y, 'z': z, 'triangle': 'Yes' if valid else 'No'})
    return answer  # step: return`,
612:`def shortestPlaneDistance(points):
    from math import sqrt
    best = float('inf')
    for first in range(len(points)):
        for second in range(first + 1, len(points)):
            dx = points[first]['x'] - points[second]['x']
            dy = points[first]['y'] - points[second]['y']
            best = min(best, dx * dx + dy * dy)  # step: pair
    return [{'shortest': round(sqrt(best), 2)}]  # step: return`,
613:`def shortestLineDistance(points):
    ordered = sorted(row['x'] for row in points)
    best = float('inf')
    for index in range(1, len(ordered)):
        best = min(best, ordered[index] - ordered[index - 1])  # step: gap
    return [{'shortest': best}]  # step: return`,
619:`def biggestSingleNumber(numbers):
    counts = {}
    for row in numbers:
        value = row['num']
        counts[value] = counts.get(value, 0) + 1  # step: count
    best = max((value for value, count in counts.items() if count == 1), default=None)
    return [{'num': best}]  # step: return`,
620:`def interestingMovies(cinema):
    answer = []
    for row in cinema:
        if row['id'] % 2 == 1 and row['description'] != 'boring':  # step: filter
            answer.append(dict(row))
    answer.sort(key=lambda row: row['rating'], reverse=True)  # step: sort
    return answer  # step: return`,
};
const sql={
607:`SELECT s.name FROM SalesPerson AS s
WHERE NOT EXISTS (
    SELECT 1 FROM Orders AS o JOIN Company AS c ON c.com_id = o.com_id
    WHERE o.sales_id = s.sales_id AND c.name = 'RED'
);`,
608:`SELECT t.id, CASE WHEN t.p_id IS NULL THEN 'Root'
    WHEN EXISTS (SELECT 1 FROM Tree AS child WHERE child.p_id = t.id) THEN 'Inner'
    ELSE 'Leaf' END AS type
FROM Tree AS t;`,
610:`SELECT x, y, z,
    CASE WHEN x + y > z AND x + z > y AND y + z > x THEN 'Yes' ELSE 'No' END AS triangle
FROM Triangle;`,
612:`SELECT ROUND(SQRT(MIN(POWER(a.x - b.x, 2) + POWER(a.y - b.y, 2))), 2) AS shortest
FROM Point2D AS a JOIN Point2D AS b
ON a.x < b.x OR (a.x = b.x AND a.y < b.y);`,
613:`WITH Gaps AS (SELECT x - LAG(x) OVER (ORDER BY x) AS gap FROM Point)
SELECT MIN(gap) AS shortest FROM Gaps;`,
619:`SELECT MAX(num) AS num
FROM (SELECT num FROM MyNumbers GROUP BY num HAVING COUNT(*) = 1) AS singles;`,
620:`SELECT id, movie, description, rating FROM Cinema
WHERE MOD(id, 2) = 1 AND description <> 'boring'
ORDER BY rating DESC;`,
};
const sales=values=>values.map(([sales_id,name])=>({sales_id,name,salary:50000,commission_rate:8,hire_date:'2024-03-11'}));
const companies=values=>values.map(([com_id,name])=>({com_id,name,city:'Harbor'}));
const orders=values=>values.map(([com_id,sales_id],i)=>({order_id:i+1,order_date:'2025-08-12',com_id,sales_id,amount:700+i*100}));
const tree=values=>rowsFrom(['id','p_id'],values),triangle=values=>rowsFrom(['x','y','z'],values),plane=values=>rowsFrom(['x','y'],values),line=values=>values.map(x=>({x})),numbers=values=>values.map(num=>({num})),cinema=values=>rowsFrom(['id','movie','description','rating'],values);
const cases={
607:[['No orders non-RED orders and mixed clients require different decisions',{sales:sales([[4,'Asha'],[8,'Bram'],[12,'Cora'],[16,'Davi'],[20,'Ema']]),companies:companies([[2,'RED'],[5,'BLUE'],[9,'GOLD']]),orders:orders([[5,4],[2,8],[9,8],[5,12],[2,16],[2,16]])}],['Without a RED company every salesperson qualifies',{sales:sales([[1,'Faye'],[2,'Gus']]),companies:companies([[7,'TEAL']]),orders:orders([[7,1]])}],['Zero orders still preserves the full roster',{sales:sales([[3,'Hana'],[6,'Ivo']]),companies:companies([[1,'RED']]),orders:[]}],['Everyone can be excluded',{sales:sales([[5,'Jin'],[9,'Kira']]),companies:companies([[4,'RED']]),orders:orders([[4,5],[4,9]])}]],
608:[['A branching tree separates root inner nodes and terminal leaves',{tree:tree([[40,null],[12,40],[61,40],[7,12],[19,12],[50,61],[72,61],[68,72]])}],['A singleton is Root even though it has no children',{tree:tree([[9,null]])}],['A long chain has one root one leaf and inner links',{tree:tree([[2,null],[5,2],[11,5],[23,11]])}],['Input row order does not determine the root',{tree:tree([[8,20],[31,20],[20,null]])}]],
610:[['Mixed triples include valid flat and too-long cases',{triangle:triangle([[6,8,9],[4,7,11],[2,3,8],[10,10,10],[9,5,6]])}],['Equality is not a triangle',{triangle:triangle([[5,8,13]])}],['Permuting sides preserves the classification',{triangle:triangle([[4,6,7],[7,4,6],[6,7,4]])}],['An empty table has no classifications',{triangle:[]}]],
612:[['The closest pair is discovered after several distant candidates',{points:plane([[-8,3],[4,12],[11,-5],[6,7],[7,9],[18,15]])}],['A vertical pair uses only its y gap',{points:plane([[4,-3],[4,8]])}],['An irrational distance is rounded only at the end',{points:plane([[0,0],[2,3]])}],['Several equal shortest distances are harmless',{points:plane([[0,0],[0,4],[4,0],[4,4]])}]],
613:[['Unsorted signed coordinates need adjacent comparisons after sorting',{points:line([24,-9,7,41,11,-2,50])}],['Two coordinates have one candidate gap',{points:line([-12,17])}],['Equal minimum gaps can occur several times',{points:line([8,2,5,11])}],['The smallest gap can occur at the far end',{points:line([-30,0,20,21])}]],
619:[['Repeated large values lose to a smaller singleton',{numbers:numbers([40,17,40,9,23,17,31,23,6])}],['Every value repeated returns one null row',{numbers:numbers([8,8,12,12,12])}],['Negative singletons still have a numeric maximum',{numbers:numbers([-9,-3,-7,-3])}],['An empty table still returns null',{numbers:[]}]],
620:[['Filtering and rating order make independent decisions',{cinema:cinema([[11,'Paper Skies','thoughtful',7.6],[12,'Iron Harbor','exciting',9.8],[13,'Quiet Clock','boring',8.8],[15,'Amber Trail','adventure',9.2],[17,'Blue Orchard','gentle',8.4]])}],['A high rating cannot rescue an even ID',{cinema:cinema([[22,'Bright Tide','thrilling',10]])}],['Every odd boring movie is excluded',{cinema:cinema([[1,'Still Room','boring',6],[3,'Long Pause','boring',7]])}],['No movies yields no output',{cinema:[]}]],
};
function validate(id,input){validateRecordTables(schemas[id],input,{name:recordText,city:recordText,movie:recordText,description:v=>recordText(v)&&/^[a-z ]+$/.test(v),hire_date:recordDate,order_date:recordDate,p_id:v=>v===null||(Number.isInteger(v)&&v>0&&v<=1000000),rating:v=>Number.isFinite(v)&&v>=0&&v<=10&&Math.abs(v*100-Math.round(v*100))<1e-8});if(id===607){const people=new Set(input.sales.map(r=>r.sales_id)),businesses=new Set(input.companies.map(r=>r.com_id));need(input.orders.every(r=>people.has(r.sales_id)&&businesses.has(r.com_id)),'Orders must reference existing salespeople and companies.');need(input.sales.every(r=>r.salary>=0&&r.commission_rate>=0&&r.commission_rate<=100)&&input.orders.every(r=>r.amount>=0),'Salary and amounts must be nonnegative; commission rates must be 0-100.');}if(id===608){const map=new Map(input.tree.map(r=>[r.id,r.p_id]));need(input.tree.length>0&&input.tree.filter(r=>r.p_id===null).length===1,'Supply one nonempty tree with exactly one root.');for(const row of input.tree){const seen=new Set();let current=row.id;while(current!==null){need(map.has(current)&&!seen.has(current),'Parent links must form one valid acyclic tree.');seen.add(current);current=map.get(current);}}}if(id===610)need(input.triangle.every(r=>r.x>0&&r.y>0&&r.z>0),'Segment lengths must be positive.');if(id===612||id===613)need(input.points.length>=2&&input.points.length<=20,'Use 2-20 distinct points.');if(id===620)need(input.cinema.every(r=>r.id>0),'Movie IDs must be positive.');return input;}
export default {specs,solvers,python,sql,cases,validate,inputState:(id,input)=>recordInputState(schemas[id],input),resultState:(id,rows)=>({resultRecords:result(id,rows)}),pseudocodeStages:{607:{exclude:4},608:{classify:4},610:{inequality:4},612:{pair:3},613:{gap:4},619:{count:1},620:{filter:3,sort:4}},tags:Object.fromEntries(Object.keys(specs).map(id=>[id,['Database']]))};
