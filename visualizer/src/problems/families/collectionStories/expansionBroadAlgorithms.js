import {intervalView} from '../../../components/shared/intervalModel.js';
import {TracedHeap,heapView} from '../../../components/shared/heapModel.js';
const total=a=>a.reduce((x,y)=>x+y,0);
const byPair=(x,y)=>x[0]-y[0]||x[1]-y[1];
function solveJumpWindow({s,minJump,maxJump},emit){
  const n=s.length,reachable=Array(n).fill(false);
  // Displayed Python line for each trace stage; the done frame is mapped to the return line by Problem1871/trace.js.
  const LINE={init:3,loop:5,enter_check:6,enter:7,leave_check:8,leave:9,update:10};
  reachable[0]=true;
  let predecessors=0;
  const windowFor=i=>{const earliest=Math.max(0,i-maxJump),latest=i-minJump;return latest<earliest?{earliest:null,latest:null}:{earliest,latest};};
  const contributorsIn=({earliest,latest})=>earliest===null?[]:reachable.flatMap((v,j)=>v&&j>=earliest&&j<=latest?[j]:[]);
  const view=(i,window,fields)=>({destination:i,earliest:window.earliest,latest:window.latest,entering:null,leaving:null,enterValue:false,leaveValue:false,count:predecessors,contributors:contributorsIn(window),blocked:s[i]==='1',decided:null,reachable:[...reachable],...fields});
  emit('Position 0 is the start and is reachable. Every later position is decided left to right using only its legal predecessor window [i-maxJump, i-minJump].',{sequence:s,index:0,output:[...reachable],codeStage:'init',activeLine:LINE.init,metrics:{predecessors:0},jumpWindow:view(0,{earliest:null,latest:null},{decided:true,reason:'Position 0 is the start, so it is reachable.'})},'start');
  for(let i=1;i<n;i++){
    const window=windowFor(i),range=window.earliest===null?'empty':`[${window.earliest}..${window.latest}]`;
    const at=(codeStage,phase,message,fields={})=>emit(message,{sequence:s,index:i,output:[...reachable],codeStage,activeLine:LINE[codeStage],metrics:{predecessors,earliest:window.earliest,latest:window.latest},jumpWindow:view(i,window,{reason:message,...fields})},phase);
    at('loop','inspect',window.earliest===null?`Destination ${i} has no legal predecessor yet, because ${i} is closer than minJump ${minJump}.`:`Destination ${i} can only be entered from the window ${range}.`,{count:null});
    const entering=i-minJump>=0?i-minJump:null;
    at('enter_check','inspect',entering===null?`${i} is smaller than minJump ${minJump}, so no position enters the window. The count stays ${predecessors}.`:`Position ${entering} is the new right edge of the window.`,{entering,enterValue:entering!==null&&reachable[entering]});
    if(entering!==null){
      const enterValue=reachable[entering];
      predecessors+=Number(enterValue);
      at('enter','inspect',enterValue?`Position ${entering} is reachable, so the count rises to ${predecessors}.`:`Position ${entering} is unreachable, so the count holds at ${predecessors}.`,{entering,enterValue,count:predecessors});
    }
    const leaving=i-maxJump-1>=0?i-maxJump-1:null;
    at('leave_check','inspect',leaving===null?`No position has fallen off the left edge yet, so nothing leaves the window.`:`Position ${leaving} is now beyond maxJump and leaves the window.`,{leaving,leaveValue:leaving!==null&&reachable[leaving]});
    if(leaving!==null){
      const leaveValue=reachable[leaving];
      predecessors-=Number(leaveValue);
      at('leave','inspect',leaveValue?`Position ${leaving} was reachable, so it leaves and the count falls to ${predecessors}.`:`Position ${leaving} was unreachable, so the count holds at ${predecessors}.`,{leaving,leaveValue,count:predecessors});
    }
    const blocked=s[i]==='1',decided=!blocked&&predecessors>0;
    reachable[i]=decided;
    at('update','update',blocked?`Destination ${i} is '1', so it is blocked. The count ${predecessors} is ignored.`:decided?`Destination ${i} is '0' and ${predecessors} reachable predecessor(s) lie in ${range}, so it becomes reachable.`:`Destination ${i} is '0', but no reachable predecessor lies in ${range}, so it stays unreachable.`,{count:predecessors,decided});
  }
  return reachable.at(-1);
}
export const broadSolvers={
1870({dist,hour},emit){if(hour<=dist.length-1){emit('Every nonfinal train consumes at least one rounded hour, leaving no positive time for the final ride.',{codeStage:'impossible'});return -1;}const units=Math.round(hour*100);let low=1,high=10000000;while(low<high){const speed=Math.floor((low+high)/2);let whole=0;for(let i=0;i<dist.length-1;i++)whole+=Math.ceil(dist[i]/speed);const feasible=100*(whole*speed+dist.at(-1))<=units*speed;emit('Round each nonfinal ride up to a whole hour. Keep the final ride fractional and compare in hundredths without repeated floating-point division.',{sequence:dist,codeStage:'search',metrics:{low,high,speed,wholeHours:whole,feasible,hour}},'update');if(feasible)high=speed;else low=speed+1;}return low;},
1871:solveJumpWindow,
1872({stones},emit){const prefix=[];let running=0;for(const value of stones){running+=value;prefix.push(running);}let best=prefix.at(-1);for(let i=stones.length-2;i>=1;i--){const take=prefix[i]-best;best=Math.max(best,take);emit('At this prefix boundary, either preserve the later best move or take this prefix sum and subtract the opponent best continuation.',{sequence:stones,index:i,output:prefix,codeStage:'update',metrics:{prefixSum:prefix[i],take,best}},'update');}return best;},
1874({nums1,nums2},emit){const a=[...nums1].sort((x,y)=>x-y),b=[...nums2].sort((x,y)=>y-x);let answer=0;for(let i=0;i<a.length;i++){answer+=a[i]*b[i];emit('Pair small first-array values with large second-array values. Swapping crossed pairings into this order never increases the product sum.',{sequence:a,index:i,output:b,codeStage:'update',metrics:{product:a[i]*b[i],answer}},'update');}return answer;},
1876({s},emit){let answer=0;for(let i=2;i<s.length;i++){const window=s.slice(i-2,i+1),good=new Set(window).size===3;if(good)answer++;emit('Only three characters belong to this window. Count it when all three are distinct, then slide one position.',{sequence:s,window:[i-2,i],codeStage:'update',metrics:{good,answer}},'update');}return answer;},
1877({nums},emit){const values=[...nums].sort((a,b)=>a-b);let best=0;for(let i=0;i<values.length/2;i++){const j=values.length-1-i,pair=values[i]+values[j];best=Math.max(best,pair);emit('Pair the largest remaining value with the smallest. This controls the worst pair sum without leaving two large values forced together later.',{sequence:values,marks:{[i]:'small partner',[j]:'large partner'},codeStage:'update',metrics:{pair,maximum:best}},'update');}return best;},
1879({nums1,nums2},emit){const n=nums1.length,dp=Array(1<<n).fill(Infinity);dp[0]=0;const bits=m=>m.toString(2).padStart(n,'0'),fmt=v=>v===Infinity?'no cost yet':String(v),positions=m=>nums2.map((_,k)=>k).filter(k=>m&(1<<k));emit('Empty mask 0 costs 0. The mask records which second-array positions are used; its bit count is the next first-array position to assign.',{sequence:nums1,index:0,codeStage:'update',metrics:{mask:0},assignment:{firstArray:[...nums1],secondArray:[...nums2],mask:0,maskBits:bits(0),nextMask:null,nextBits:null,firstIndex:0,firstValue:nums1[0],chosen:-1,chosenValue:null,used:[],unused:positions(-1&((1<<n)-1)),pairXor:null,oldCost:0,candidateCost:null,previousBest:null,decided:null,bestAfter:null},table:[...dp]},'start');for(let mask=0;mask<dp.length-1;mask++){let used=0;for(let m=mask;m;m&=m-1)used++;for(let j=0;j<n;j++)if(!(mask&(1<<j))){const next=mask|(1<<j),cost=nums1[used]^nums2[j],oldCost=dp[mask],candidate=oldCost+cost,previous=dp[next],assignment={firstArray:[...nums1],secondArray:[...nums2],mask,maskBits:bits(mask),nextMask:next,nextBits:bits(next),firstIndex:used,firstValue:nums1[used],chosen:j,chosenValue:nums2[j],used:positions(mask),unused:positions(~mask&((1<<n)-1)),pairXor:cost,oldCost,candidateCost:candidate,previousBest:previous,decided:null,bestAfter:null};emit(`Mask ${bits(mask)} has ${used} used position(s), so the next first-array value is nums1[${used}] = ${nums1[used]}. Pair it with unused nums2[${j}] = ${nums2[j]}: XOR ${cost}. Candidate cost ${oldCost} + ${cost} = ${candidate}; mask ${bits(next)} currently has ${fmt(previous)}.`,{sequence:nums2,index:j,codeStage:'update',metrics:{mask,firstIndex:used,pairXor:cost,candidate},assignment,table:[...dp]},'inspect');dp[next]=Math.min(previous,candidate);const improves=candidate<previous;emit(improves?`Candidate ${candidate} beats ${fmt(previous)}, so mask ${bits(next)} now stores ${candidate}.`:`Candidate ${candidate} does not beat ${fmt(previous)}, so mask ${bits(next)} keeps its stored cost.`,{sequence:nums2,index:j,codeStage:'update',metrics:{mask,firstIndex:used,pairXor:cost,candidate},assignment:{...assignment,decided:improves?'improves':'keeps',bestAfter:dp[next]},table:[...dp]},'update');}}return dp.at(-1);},
1880({firstWord,secondWord,targetWord},emit){const convert=word=>{let value=0;for(let i=0;i<word.length;i++){value=value*10+word.charCodeAt(i)-97;emit('Map a through j to decimal digits zero through nine. Accumulate by multiplying the prior value by ten and adding the next digit.',{sequence:word,index:i,codeStage:'convert',metrics:{value}},'update');}return value;};return convert(firstWord)+convert(secondWord)===convert(targetWord);},
1881({n,x},emit){const negative=n[0]==='-';let index=negative?1:0;for(;index<n.length;index++){const digit=Number(n[index]),insert=negative?digit>x:digit<x;emit('The earliest differing digit decides numeric order. Insert a larger digit early for positive values, but a smaller digit early for negative values to reduce their magnitude.',{sequence:n,index,codeStage:'search',metrics:{negative,digit,x,insert}});if(insert)break;}return n.slice(0,index)+x+n.slice(index);},
1882({servers,tasks},emit) {
  const smallInput = tasks.length <= 2000;
  // Two heaps: idle servers by (weight, index), busy servers by (finish time, index).
  const idle = new TracedHeap(byPair, {order:'min', format: p => `S${p[1]} · w${p[0]}`});
  const busy = new TracedHeap(byPair, {order:'min', format: p => `S${p[1]} · free ${p[0]}`});
  const serverView = servers.map((weight,id)=>({id,weight,freeAt:0}));
  const taskView = tasks.map((duration,id)=>({id,arrival:id,duration}));
  const answer = [], assignments = [];
  let ts = 0;
  for (let i=0;i<servers.length;i++) idle.push([servers[i],i]);
  const release = () => {
    let count = 0;
    while (busy.size && busy.peek()[0] <= ts) { const [,idx] = busy.pop(); idle.push([servers[idx],idx]); count++; }
    return count;
  };
  // Frame state stays small: clock, heap tops, the selected server, and the answer so far (shared, not copied).
  const eligibleState = () => idle.size <= 50
    ? {eligible: idle.data.slice().sort(byPair).map(p=>p[1]), eligibleCount: idle.size}
    : {eligible: [], eligibleCount: idle.size};
  // Heap cells and their operations, for small inputs only. Each show() drains both logs, so each frame carries the ops since the last one.
  const heapFields = () => {
    if (!smallInput) { idle.takeOps(); busy.takeOps(); return {}; }
    const idleView = heapView(idle, {title:'Idle servers · min by weight, then index'});
    const busyView = heapView(busy, {title:'Busy servers · min by finish time, then index'});
    return {idle: idleView.heap, busy: busyView.heap};
  };
  const show = (event, nextTask, message, {selected=null, jumpTo=null, phase='inspect', activeLine, pythonLine, codeStage}) => {
    emit(message, { codeStage, pythonLine, activeLine, scheduling: {
      time: ts, event, nextTask, selected, jumpTo,
      ...eligibleState(),
      idleTop: idle.size ? idle.peek() : null,
      busyTop: busy.size ? busy.peek() : null,
      ...heapFields(),
      tasks: taskView, servers: serverView,
      // Small inputs keep exact copies. Large ones share the arrays and record counts (the view slices), so frames stay O(1).
      assignments: smallInput ? assignments.map(a=>({...a})) : assignments, assignmentCount: assignments.length,
      output: smallInput ? answer.slice() : answer, outputCount: answer.length,
    } }, phase);
  };
  // Pseudocode lines: 1 setup, 2 arrival clock, 3 release, 4 wait-or-check, 5 choose and record, 6 schedule finish, 7 return.
  show('Ready', 0, 'Task i arrives at time i. Keep tasks in arrival order; server weight decides which idle server takes the head task.', {phase:'start', activeLine:1, pythonLine:4, codeStage:'start'});
  for (let i=0;i<tasks.length;i++) {
    const previousClock = ts;
    ts = Math.max(ts, i);
    show('Arrive', i, previousClock === ts
      ? `T${i} arrives at time ${i}, which does not move the clock past ${ts}.`
      : `T${i} arrives at time ${i}. The clock advances from ${previousClock} to ${ts}, skipping the idle gap.`,
      {activeLine:2, pythonLine:13, codeStage:'arrive'});
    const released = release();
    show('Release', i, released
      ? `${released} server(s) with finish time at most ${ts} return to the idle pool.`
      : `No busy server finishes by time ${ts}, so the idle pool is unchanged.`,
      {activeLine:3, pythonLine:14, codeStage:'release'});
    if (!idle.size) {
      const next = busy.peek()[0];
      show('Wait', i, `T${i} is waiting and every server is busy. Advance the clock from ${ts} to ${next}, the earliest completion.`, {jumpTo:next, activeLine:4, pythonLine:16, codeStage:'wait'});
      ts = next;
      const again = release();
      show('Release', i, `At time ${ts}, ${again} server(s) finishing now return to the idle pool.`, {activeLine:4, pythonLine:17, codeStage:'release'});
    } else {
      show('Check', i, `${idle.size} idle server(s) are available at time ${ts}, so T${i} starts now without waiting.`, {activeLine:4, pythonLine:15, codeStage:'check'});
    }
    const [weight, server] = idle.peek();
    const tied = idle.size <= 50 ? idle.data.filter(p=>p[0]===weight).map(p=>p[1]).sort((a,b)=>a-b) : [];
    const tieNote = tied.length > 1 ? `; among equal weights (${tied.map(s=>'S'+s).join(', ')}), index ${server} is smallest` : '';
    show('Choose', i, `At time ${ts}, T${i} is first in the queue. Choose S${server}: weight ${weight} is smallest${tieNote}.`, {selected:server, activeLine:5, pythonLine:18, codeStage:'choose'});
    idle.pop();
    answer.push(server);
    show('Record', i, `S${server} leaves the idle pool and is recorded as the server for T${i}.`, {selected:server, activeLine:5, pythonLine:19, codeStage:'record'});
    const end = ts + tasks[i];
    serverView[server].freeAt = end;
    assignments.push({task:i, server, start:ts, end});
    busy.push([end, server]);
    show('Assign', i+1, `T${i} → S${server}, running from ${ts} to ${end}. Duration ${tasks[i]} sets the finish time; weight ${weight} only sets selection priority.`, {selected:server, phase:'update', activeLine:6, pythonLine:20, codeStage:'assign'});
  }
  show('Return', tasks.length, 'Every task is assigned. Return the server index chosen for each task.', {phase:'update', activeLine:7, pythonLine:21, codeStage:'return'});
  return answer;
},
1884({n},emit){let moves=0,covered=0;while(covered<n){moves++;covered+=moves;emit('With two eggs and this many moves, choose decreasing test gaps. The newly added gap equals the move budget, growing coverage by a triangular number.',{codeStage:'update',metrics:{moves,covered,requiredFloors:n}},'update');}return moves;},
1885({nums1,nums2},emit){const differences=nums1.map((v,i)=>v-nums2[i]).sort((a,b)=>a-b);let left=0,right=differences.length-1,answer=0;while(left<right){const valid=differences[left]+differences[right]>0;if(valid){answer+=right-left;emit('Even the smallest remaining difference pairs positively with this right endpoint, so every index between them qualifies with it.',{sequence:differences,window:[left,right],codeStage:'accept',metrics:{added:right-left,answer}},'update');right--;}else{emit('This smallest difference cannot pair with the largest remaining value, so it cannot form any remaining valid pair.',{sequence:differences,window:[left,right],codeStage:'discard',metrics:{answer}});left++;}}return answer;},
1886({mat,target},emit){let current=mat.map(row=>[...row]);for(let turn=0;turn<4;turn++){const equal=current.every((row,r)=>row.every((v,c)=>v===target[r][c]));emit('Compare every cell at this orientation. Four quarter-turns cover every distinct allowed rotation.',{matrix:current,outputMatrix:target,outputMatrixLabel:'Target matrix',codeStage:'compare',metrics:{degrees:turn*90,equal}});if(equal)return true;current=current[0].map((_,c)=>current.map(row=>row[c]).reverse());}return false;},
1887({nums},emit){const values=[...nums].sort((a,b)=>a-b);let levels=0,answer=0;for(let i=1;i<values.length;i++){if(values[i]!==values[i-1])levels++;answer+=levels;emit('A value must cross one reduction level for every distinct smaller value. Repeated values share the same level count but each still contributes operations.',{sequence:values,index:i,codeStage:'update',metrics:{levels,answer}},'update');}return answer;},
1888({s},emit){const doubled=s+s,n=s.length;let mismatch=0,best=n;for(let i=0;i<doubled.length;i++){if(Number(doubled[i])!==i%2)mismatch++;if(i>=n&&Number(doubled[i-n])!==(i-n)%2)mismatch--;if(i>=n-1){best=Math.min(best,mismatch,n-mismatch);emit('Every length-n window of the doubled string represents a rotation. Count mismatches against one alternating target; the opposite target has n minus that count.',{sequence:doubled,window:[i-n+1,i],codeStage:'update',metrics:{mismatch,opposite:n-mismatch,best}},'update');}}return best;},
1891({ribbons,k},emit){let low=0,high=Math.max(...ribbons);while(low<high){const length=Math.ceil((low+high)/2),pieces=ribbons.reduce((s,v)=>s+Math.floor(v/length),0);emit('Each ribbon supplies floor(ribbon/length) equal pieces. If enough pieces exist, try a longer cut; otherwise shorten it.',{sequence:ribbons,codeStage:'search',metrics:{low,high,length,pieces,k}},'update');if(pieces>=k)low=length;else high=length-1;}return low;},
1893({ranges,left,right},emit){const ordered=[...ranges].sort((a,b)=>a[0]-b[0]);let next=left;const view=(at,state,title)=>intervalView({title,closed:true,intervals:[{start:left,end:right,label:`needed ${left}..${right}`,role:'pending',group:'Target'},...ordered.map(([s,e],k)=>({start:s,end:e,label:`${s}..${e}`,group:'Sorted ranges',role:k===at?state:k<at?'kept':'pending'}))],marker:Math.min(next,right+1),markerLabel:`next uncovered ${next}`});for(let k=0;k<ordered.length;k++){const[start,end]=ordered[k];if(end<next)continue;if(start>next){emit('The next uncovered integer lies before this range starts, and later sorted ranges cannot fill that gap.',{sequence:ordered.map(r=>r.join('..')),...view(k,'rejected',`Gap: ${next} is uncovered but this range starts at ${start}`),codeStage:'gap',metrics:{next,start}});return false;}next=Math.max(next,end+1);emit('Extend coverage past this interval. Adjacent integer ranges connect when the next start equals the next uncovered integer.',{sequence:ordered.map(r=>r.join('..')),...view(k,'current',`Range ${start}..${end} extends coverage; the next uncovered integer is ${next}`),codeStage:'update',metrics:{start,end,next,targetEnd:right}},'update');if(next>right)return true;}return false;},
1894({chalk,k},emit){const cycle=total(chalk);k%=cycle;emit('Whole class cycles consume the same total chalk. Remove all complete cycles before scanning the remaining budget.',{sequence:chalk,codeStage:'reduce',metrics:{cycle,remaining:k}},'update');for(let i=0;i<chalk.length;i++){emit('This student needs their full amount. Equality is enough to finish; replacement happens only when the remaining chalk is smaller.',{sequence:chalk,index:i,codeStage:'compare',metrics:{needed:chalk[i],remaining:k}});if(k<chalk[i])return i;k-=chalk[i];}},
1897({words},emit){const bag=new Map();for(const word of words)for(const c of word)bag.set(c,(bag.get(c)||0)+1);for(const[char,count]of bag){const divisible=count%words.length===0;emit('Redistribution can ignore original word boundaries. Every character total must split evenly among all final equal strings.',{sequence:words,table:[...bag],codeStage:'compare',metrics:{char,count,wordCount:words.length,divisible}});if(!divisible)return false;}return true;},
1898({s,p,removable},emit){const when=Array(s.length).fill(Infinity);removable.forEach((index,order)=>when[index]=order);let low=0,high=removable.length;while(low<high){const removed=Math.ceil((low+high)/2);let matched=0;for(let i=0;i<s.length&&matched<p.length;i++)if(when[i]>=removed&&s[i]===p[matched])matched++;const feasible=matched===p.length;emit('Skip the first proposed removal indices while matching the subsequence in order. Removing more characters cannot restore a lost subsequence, so feasibility is monotone.',{sequence:s,marks:Object.fromEntries(removable.slice(0,removed).map(i=>[i,'removed'])),output:[...p],codeStage:'search',metrics:{low,high,removed,matched,feasible}},'update');if(feasible)low=removed;else high=removed-1;}return low;},
1899({triplets,target},emit){const best=[0,0,0];for(let i=0;i<triplets.length;i++){const triplet=triplets[i],usable=triplet.every((v,c)=>v<=target[c]);if(usable)for(let c=0;c<3;c++)best[c]=Math.max(best[c],triplet[c]);emit('Discard any triplet exceeding the target in any coordinate: maxima cannot undo an overshoot. Merge the remaining compatible coordinates and check full target coverage.',{sequence:triplets.map(t=>t.join(',')),index:i,output:best,codeStage:'update',metrics:{usable,target}},'update');}return best.every((v,i)=>v===target[i]);},
1905({grid1,grid2},emit){const rows=grid2.length,cols=grid2[0].length,seen=Array.from({length:rows},()=>Array(cols).fill(false));let answer=0;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){if(!grid2[r][c]||seen[r][c])continue;const queue=[[r,c]];seen[r][c]=true;let contained=true;for(let head=0;head<queue.length;head++){const[y,x]=queue[head];if(!grid1[y][x])contained=false;for(const[dy,dx]of [[1,0],[-1,0],[0,1],[0,-1]]){const ny=y+dy,nx=x+dx;if(ny>=0&&ny<rows&&nx>=0&&nx<cols&&grid2[ny][nx]&&!seen[ny][nx]){seen[ny][nx]=true;queue.push([ny,nx]);}}emit('Visit the entire grid-two island even after finding a cell absent from grid one. Only a component whose every cell is covered counts as a sub-island.',{matrix:grid2,cell:[y,x],outputMatrix:grid1,outputMatrixLabel:'Reference land (grid 1)',matrixLabel:'Island traversal (grid 2)',outputCell:[y,x],codeStage:'visit',metrics:{contained,visitedInIsland:head+1,answer}});}if(contained)answer++;emit('Finish this connected component and count it only when no uncovered land cell was found.',{matrix:grid2,outputMatrix:grid1,outputMatrixLabel:'Reference land (grid 1)',matrixLabel:'Island traversal (grid 2)',codeStage:'update',metrics:{contained,islandSize:queue.length,answer}},'update');}return answer;},
1915({word},emit){const previous=new Map([[0,1]]);let parity=0,answer=0;for(let i=0;i<word.length;i++){parity^=1<<(word.charCodeAt(i)-97);let added=previous.get(parity)||0;for(let bit=0;bit<10;bit++)added+=previous.get(parity^(1<<bit))||0;answer+=added;previous.set(parity,(previous.get(parity)||0)+1);emit('A substring parity mask is the XOR of two prefix masks. Equal masks give all-even counts; masks differing in exactly one bit give one odd character.',{sequence:word,index:i,table:[...previous].map(([mask,count])=>[mask.toString(2).padStart(10,'0'),count]),tableHeaders:['Prefix parity','Occurrences'],codeStage:'update',metrics:{parity:parity.toString(2).padStart(10,'0'),added,answer}},'update');}return answer;},
};
