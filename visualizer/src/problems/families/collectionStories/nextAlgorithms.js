export const nextSolvers = {
  1006({n}, emit) {
    const stack=[n],sequence=Array.from({length:n},(_,i)=>n-i);
    for(let value=n-1,operation=0;value>=1;value--,operation++) {
      const op=operation%4;
      if(op===0)stack[stack.length-1]*=value;
      else if(op===1)stack[stack.length-1]=Math.trunc(stack.at(-1)/value);
      else stack.push(op===2?value:-value);
      emit(`Apply ${['multiply','divide with integer truncation','add','subtract'][op]} to ${value}. Multiplication and division stay inside the current signed term; addition starts another term.`,{sequence,index:n-value,output:stack,metrics:{operation:['*','/','+','-'][op]}},'update');
    }
    return stack.reduce((a,b)=>a+b,0);
  },
  1007({tops,bottoms},emit) {
    let best=Infinity;
    for(const target of new Set([tops[0],bottoms[0]])) {
      let topRotations=0,bottomRotations=0,possible=true;
      for(let i=0;i<tops.length;i++) {
        if(tops[i]!==target&&bottoms[i]!==target)possible=false;
        if(tops[i]!==target)topRotations++;
        if(bottoms[i]!==target)bottomRotations++;
        emit(`Domino ${i} ${tops[i]===target||bottoms[i]===target?'can show':'cannot show'} ${target}. A uniform row must use a value appearing on the first domino.`,{sequence:tops,index:i,output:bottoms,outputIndex:i,metrics:{target,topRotations,bottomRotations,possible}},'update');
        if(!possible)break;
      }
      if(possible)best=Math.min(best,topRotations,bottomRotations);
    }
    return best===Infinity?-1:best;
  },
  1009({n},emit) {
    const bits=n.toString(2),output=[];
    [...bits].forEach((bit,index)=>{output.push(bit==='0'?1:0);emit(`Complement bit ${bit}. Only the written binary digits participate; zero itself has one written digit.`,{sequence:bits,index,output},'update');});
    return parseInt(output.join(''),2);
  },
  1010({time},emit) {
    const counts=Array(60).fill(0);let pairs=0;
    time.forEach((duration,index)=>{const remainder=duration%60,needed=(60-remainder)%60,added=counts[needed];pairs+=added;counts[remainder]++;
      emit(`Duration ${duration} needs remainder ${needed}. Add ${added} earlier partners before recording this song, so it never pairs with itself.`,{index,table:counts.flatMap((n,r)=>n?[[r,n]]:[]),tableHeaders:['Remainder','Earlier songs'],metrics:{remainder,needed,added,pairs}},'update');});
    return pairs;
  },
  1011({weights,days},emit) {
    let low=Math.max(...weights),high=weights.reduce((a,b)=>a+b,0);
    while(low<high) {
      const capacity=Math.floor((low+high)/2);let used=1,load=0;const assignments=[];
      weights.forEach((weight,index)=>{if(load+weight>capacity){used++;load=0;}load+=weight;assignments.push(used);emit(`At capacity ${capacity}, package ${index} joins day ${used}. Preserve package order; open a new day only when the next weight would overflow.`,{index,output:assignments,metrics:{low,high,capacity,daysUsed:used,currentLoad:load}},'inspect');});
      const feasible=used<=days;if(feasible)high=capacity;else low=capacity+1;
      emit(`${used} shipping days ${feasible?'fit':'exceed'} the ${days}-day deadline. ${feasible?'Keep this capacity as an upper bound.':'Every smaller capacity also fails.'}`,{metrics:{low,high,capacity,daysUsed:used,feasible}},'update');
    }
    return low;
  },
  1013({arr},emit) {
    const total=arr.reduce((a,b)=>a+b,0);if(total%3!==0){emit(`Total ${total} is not divisible by three, so equal integer sums are impossible.`,{metrics:{total}});return false;}
    const target=total/3;let sum=0,parts=0;
    for(let i=0;i<arr.length-1;i++){sum+=arr[i];if(sum===target){parts++;sum=0;}emit(`The current part aims for ${target}. Close a part as soon as it reaches that sum, while reserving at least one element for the final part.`,{sequence:arr,index:i,metrics:{target,closedParts:parts,currentPartSum:sum}},'update');if(parts===2)return true;}
    return false;
  },
  1014({values},emit) {
    let leftValue=values[0],leftIndex=0,best=-Infinity;
    for(let j=1;j<values.length;j++){const score=leftValue+values[j]-j;best=Math.max(best,score);emit(`Pair ${leftIndex} with ${j}: (value[i]+i) + (value[j]-j) gives ${score}. Evaluate before considering j as a future left endpoint.`,{sequence:values,index:j,marks:{[leftIndex]:'best left'},metrics:{leftContribution:leftValue,rightContribution:values[j]-j,score,best}},'inspect');if(values[j]+j>leftValue){leftValue=values[j]+j;leftIndex=j;}}
    return best;
  },
  1015({k},emit) {
    let remainder=0;const seen=new Set();
    for(let length=1;length<=k;length++){remainder=(remainder*10+1)%k;emit(`Appending one gives remainder ${remainder} after ${length} digits. Store remainders instead of constructing a potentially huge integer.`,{sequence:[...String(k)],metrics:{length,remainder,divisor:k}},'update');if(remainder===0)return length;if(seen.has(remainder)){emit('A remainder repeated without reaching zero. Future remainders will repeat the same cycle.',{metrics:{length,remainder}});return -1;}seen.add(remainder);}
    return -1;
  },
  1017({n},emit) {
    let value=n;const reversed=[];
    do{const bit=((value%2)+2)%2,before=value;reversed.push(bit);value=(value-bit)/-2;emit(`${before} = (${value}) * -2 + ${bit}. Keep the remainder nonnegative even when the quotient changes sign.`,{sequence:[...String(n)],output:[...reversed].reverse(),metrics:{before,bit,nextQuotient:value}},'update');}while(value!==0);
    return reversed.reverse().join('');
  },
  1018({nums},emit) {
    let remainder=0;const output=[];
    nums.forEach((bit,index)=>{remainder=(2*remainder+bit)%5;output.push(remainder===0);emit(`Shift the prefix left and append ${bit}; remainder becomes ${remainder}. A zero remainder means this entire prefix is divisible by five.`,{index,output,metrics:{remainder}},'update');});return output;
  },
  1021({s},emit) {
    let depth=0;const output=[];
    [...s].forEach((c,index)=>{if(c===')')depth--;const keep=depth>0;if(keep)output.push(c);if(c==='(')depth++;emit(`'${c}' ${keep?'belongs inside a primitive and remains':'is an outer boundary of a primitive and is removed'}. Closing depth is reduced before deciding; opening depth increases afterward.`,{index,output,metrics:{depth,keep}},'update');});return output.join('');
  },
  1023({queries,pattern},emit) {
    const output=[];
    queries.forEach((query,index)=>{let matched=0,valid=true;for(const c of query){if(c===pattern[matched])matched++;else if(/[A-Z]/.test(c)){valid=false;break;}}const accepted=valid&&matched===pattern.length;output.push(accepted);emit(`'${query}' ${accepted?'matches':'does not match'} '${pattern}'. Extra lowercase letters may be inserted, but an unmatched capital cannot disappear.`,{sequence:queries,index,output,metrics:{pattern,matchedCharacters:matched,unmatchedCapital:!valid}},'update');});return output;
  },
  1025({n},emit) {
    const wins=Array(n+1).fill(false);
    for(let value=2;value<=n;value++){for(let divisor=1;divisor<value;divisor++)if(value%divisor===0){const opponentWins=wins[value-divisor];if(!opponentWins)wins[value]=true;emit(`At ${value}, subtract divisor ${divisor} to leave ${value-divisor}. ${opponentWins?'The opponent can win there.':'The opponent loses there, so this is a winning move.'}`,{sequence:Array.from({length:n},(_,i)=>i+1),index:value-1,output:wins.slice(1),metrics:{value,divisor,opponentWins}},'update');if(wins[value])break;}}
    return wins[n];
  },
  1029({costs},emit) {
    const ranked=costs.map(([a,b],person)=>({a,b,person,extra:a-b})).sort((x,y)=>x.extra-y.extra||x.person-y.person);let total=0;
    ranked.forEach((p,index)=>{const city=index<costs.length/2?'A':'B',paid=city==='A'?p.a:p.b;total+=paid;emit(`Person ${p.person} goes to ${city} for ${paid}. Ranking A-minus-B differences assigns the strongest relative savings to the limited A seats.`,{sequence:ranked.map(p=>`person ${p.person}`),index,table:ranked.map(p=>[p.person,p.a,p.b,p.extra]),tableHeaders:['Person','A cost','B cost','A minus B'],metrics:{city,paid,total}},'update');});return total;
  },
  1030({rows,cols,rCenter,cCenter},emit) {
    const distance=(r,c)=>Math.abs(r-rCenter)+Math.abs(c-cCenter),matrix=Array.from({length:rows},(_,r)=>Array.from({length:cols},(_,c)=>distance(r,c)));
    const cells=matrix.flatMap((row,r)=>row.map((_,c)=>[r,c])).sort((a,b)=>distance(...a)-distance(...b)||a[0]-b[0]||a[1]-b[1]),output=[];
    cells.forEach(([r,c])=>{output.push([r,c]);emit(`Visit (${r},${c}) at Manhattan distance ${distance(r,c)}. Equal-distance cells may appear in any order.`,{matrix,matrixLabel:'Manhattan distance from the center',cell:[r,c],otherCell:[rCenter,cCenter],output:output.map(p=>`(${p})`),metrics:{distance:distance(r,c),visited:output.length}},'update');});return output;
  },
  1037({points},emit) {
    const [[ax,ay],[bx,by],[cx,cy]]=points,u=[bx-ax,by-ay],v=[cx-ax,cy-ay],cross=u[0]*v[1]-u[1]*v[0];
    emit('Subtract the first point from the other two. A nonzero cross product means the direction vectors are not parallel, so the three points enclose area.',{sequence:points.map(p=>`(${p})`),table:[['AB',...u],['AC',...v]],tableHeaders:['Vector','x','y'],metrics:{crossProduct:cross,twiceTriangleArea:Math.abs(cross)}},'update');return cross!==0;
  },
  1041({instructions},emit) {
    let x=0,y=0,direction=0;const directions=[[0,1],[1,0],[0,-1],[-1,0]],names=['north','east','south','west'];
    [...instructions].forEach((c,index)=>{if(c==='G'){x+=directions[direction][0];y+=directions[direction][1];}else direction=(direction+(c==='R'?1:3))%4;emit(`Execute ${c}: position (${x},${y}), facing ${names[direction]}. A non-north final heading makes repeated cycles turn back instead of drifting forever.`,{sequence:instructions,index,metrics:{x,y,heading:names[direction]}},'update');});return (x===0&&y===0)||direction!==0;
  },
  1046({stones},emit) {
    const remaining=[...stones];
    while(remaining.length>1){remaining.sort((a,b)=>a-b);const heavy=remaining.pop(),light=remaining.pop();if(heavy!==light)remaining.push(heavy-light);emit(`Smash ${heavy} and ${light}. ${heavy===light?'Equal weights both disappear.':`Their difference ${heavy-light} returns to the pool.`}`,{sequence:remaining,metrics:{heavy,light,difference:heavy-light}},'update');}return remaining[0]??0;
  },
  1051({heights},emit) {
    const expected=[...heights].sort((a,b)=>a-b);let mismatches=0;
    heights.forEach((height,index)=>{const mismatch=height!==expected[index];if(mismatch)mismatches++;emit(`Position ${index} has ${height} and should have ${expected[index]}. Count mismatched positions, not swaps needed to sort.`,{sequence:heights,index,output:expected,outputIndex:index,metrics:{mismatch,mismatches}},'update');});return mismatches;
  },
  1052({customers,grumpy,minutes},emit) {
    const baseline=customers.reduce((total,n,i)=>total+(grumpy[i]?0:n),0);let recovered=0,best=0;
    customers.forEach((n,index)=>{if(grumpy[index])recovered+=n;if(index>=minutes&&grumpy[index-minutes])recovered-=customers[index-minutes];best=Math.max(best,recovered);emit(`Window ending at ${index} recovers ${recovered} otherwise-lost customers. Already satisfied customers belong only to the baseline, preventing double counting.`,{sequence:customers,index,window:[Math.max(0,index-minutes+1),index],output:grumpy,outputIndex:index,metrics:{baseline,recovered,best,total:baseline+best}},'update');});return baseline+best;
  },
};
