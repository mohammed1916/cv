const specs={
573:['height width tree squirrel nuts','Minimize the squirrel travel needed to carry every nut individually to the tree.','Imagine every nut trip starting and ending at the tree. Only the first trip differs: it starts at the squirrel instead. Choose the nut with the greatest saved distance, even if every saving is negative.','sum twice the tree distance for every nut|measure each nut distance from the squirrel|compute the saving from using it as the first nut|choose the largest saving even when it is negative|subtract that saving from the baseline travel','O(nuts) time and O(1) algorithm space.'],
593:['points','Determine whether four unordered points are the vertices of a nondegenerate square.','A square has four equal positive squared side lengths and two equal squared diagonals, each twice the side value. All six pair distances avoid guessing vertex order and avoid floating-point roots.','calculate all six squared pair distances|sort the distances from shortest to longest|require four equal nonzero side distances|require two equal diagonal distances twice a side distance|return whether all square conditions hold','O(1) time and space for four points.'],
};
const manhattan=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]);
const solvers={
573({tree,squirrel,nuts},emit){const baseline=nuts.reduce((sum,nut)=>sum+2*manhattan(tree,nut),0),table=[];let best=-Infinity,first=-1;for(let i=0;i<nuts.length;i++){const treeDistance=manhattan(tree,nuts[i]),squirrelDistance=manhattan(squirrel,nuts[i]),saving=treeDistance-squirrelDistance;if(saving>best){best=saving;first=i;}table.push([i,treeDistance,squirrelDistance,saving]);emit('Every later nut uses a tree-to-nut-to-tree trip. Choosing this nut first replaces only its outbound tree leg with the squirrel starting leg.',{pointState:{points:[{id:'tree',x:tree[1],y:tree[0],label:'T',description:'Tree destination'},...nuts.map((p,j)=>({id:`nut${j}`,x:p[1],y:p[0],label:String(j),description:`Nut ${j}`}))],query:{x:squirrel[1],y:squirrel[0]},queryLabel:'Squirrel',pointCaption:'Nut locations and tree; distance is Manhattan distance.'},table:[...table],tableHeaders:['First nut candidate','Tree distance','Squirrel distance','Saving'],codeStage:'saving',metrics:{baseline,candidate:i,bestFirstNut:first,bestSaving:best,bestTravel:baseline-best}},'update');}return baseline-best;},
593({points},emit){const distances=[],table=[];for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const d=(points[i][0]-points[j][0])**2+(points[i][1]-points[j][1])**2;distances.push(d);table.push([i,j,d]);emit('Squared distance keeps exact integer comparisons and treats rotated and axis-aligned squares identically.',{pointState:{points:points.map((p,k)=>({id:k,x:p[0],y:p[1],label:String(k)})),pointCaption:'Four proposed square vertices.'},table:[...table],tableHeaders:['First vertex','Second vertex','Squared distance'],codeStage:'distance'},'update');}distances.sort((a,b)=>a-b);const side=distances[0],valid=side>0&&distances.slice(0,4).every(d=>d===side)&&distances[4]===distances[5]&&distances[4]===2*side;emit('A square requires four equal positive sides and two equal diagonals with twice the squared side length. Zero distances reveal repeated points.',{output:distances,codeStage:'classify',metrics:{squaredSide:side,squaredDiagonals:distances.slice(4).join(', '),valid}},'update');return valid;},
};
const python={
573:`def minDistance(height, width, tree, squirrel, nuts):
    def distance(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])
    baseline = sum(2 * distance(tree, nut) for nut in nuts)
    best_saving = float('-inf')
    for nut in nuts:
        saving = distance(tree, nut) - distance(squirrel, nut)
        best_saving = max(best_saving, saving)  # step: saving
    return baseline - best_saving  # step: return`,
593:`def validSquare(points):
    distances = []
    for first in range(4):
        for second in range(first + 1, 4):
            dx = points[first][0] - points[second][0]
            dy = points[first][1] - points[second][1]
            distances.append(dx * dx + dy * dy)  # step: distance
    distances.sort()
    side = distances[0]
    valid = (side > 0 and all(d == side for d in distances[:4])
             and distances[4] == distances[5] == 2 * side)  # step: classify
    return valid  # step: return`,
};
const cases={
573:[['Many nuts compete for the one special starting trip',{height:14,width:17,tree:[6,8],squirrel:[1,2],nuts:[[2,3],[11,15],[5,1],[9,7],[0,14],[12,4],[3,10]]}],['Every first choice costs more than starting from the tree',{height:12,width:12,tree:[1,1],squirrel:[11,11],nuts:[[1,2],[2,1],[2,2]]}],['One nut still includes its final trip to the tree',{height:9,width:10,tree:[7,8],squirrel:[1,1],nuts:[[4,6]]}],['Equal savings permit either optimal first nut',{height:8,width:8,tree:[4,4],squirrel:[1,1],nuts:[[1,3],[3,1],[6,6]]}]],
593:[['A translated rotated square with unordered vertices',{points:[[9,9],[3,7],[7,5],[5,11]]}],['A rectangle has equal diagonals but unequal sides',{points:[[1,2],[9,2],[9,5],[1,5]]}],['Repeated vertices cannot make a square',{points:[[2,2],[2,2],[5,5],[5,5]]}],['Four collinear points fail the distance pattern',{points:[[-6,3],[-2,3],[2,3],[6,3]]}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);},pair=p=>Array.isArray(p)&&p.length===2&&p.every(v=>Number.isInteger(v)&&Math.abs(v)<=10000);if(id===593)need(Array.isArray(input.points)&&input.points.length===4&&input.points.every(pair),'Supply exactly four integer coordinate pairs between -10000 and 10000.');else{need(Number.isInteger(input.height)&&input.height>=1&&input.height<=10000&&Number.isInteger(input.width)&&input.width>=1&&input.width<=10000,'Height and width must be integers from 1 to 10000.');need(Array.isArray(input.nuts)&&input.nuts.length>=1&&input.nuts.length<=40,'Use 1-40 nuts.');const all=[input.tree,input.squirrel,...input.nuts];need(all.every(p=>pair(p)&&p[0]>=0&&p[0]<input.height&&p[1]>=0&&p[1]<input.width),'All positions must be row/column coordinates within the garden.');need(new Set(all.map(p=>p.join(','))).size===all.length,'Tree, squirrel, and nut locations must all be distinct.');}return input;}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{573:{saving:4},593:{distance:1,classify:4}},tags:{573:['Math','Greedy'],593:['Math','Geometry']}};
