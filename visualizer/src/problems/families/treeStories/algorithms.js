import { parseLevelOrderTree } from '../../../components/shared/levelOrderTree.js';

export function serialize(root) {
  if(!root)return [];
  const queue=[root],values=[];
  for(let i=0;i<queue.length;i++){const n=queue[i];values.push(n?.val??null);if(n)queue.push(n.left,n.right);}
  while(values.at(-1)===null)values.pop();
  return values;
}
export const parseTree=(values,prefix='tree')=>parseLevelOrderTree(JSON.stringify(values),prefix);
const showTree=(root,emit,message='The resulting tree preserves the required structure.')=>{
  emit(message,{trees:[{label:'Resulting tree',root}]},'update');return serialize(root);
};

const tw=(stack,order,decision,kind='recursion',orderLabel)=>({treeWalk:{kind,stack:stack===null?null:stack.map(e=>(typeof e==='object'?{...e}:e)),order:[...order],orderLabel,decision}});

export const solvers={
  606({root},emit) {
    const stack=[],done=[];
    function visit(n){if(!n)return '';stack.push({label:`serialize(${n.val})`,note:'solving children'});emit(`Call serialize(${n.val}): solve the left subtree first, then the right.`,{active:[n.id],...tw(stack,done,`At ${n.val}: left is ${n.left?n.left.val:'empty'}, right is ${n.right?n.right.val:'empty'}.`,'recursion','Nodes already serialized (post-order)')});const left=visit(n.left),right=visit(n.right);const value=String(n.val)+(n.left||n.right?`(${left})`:'')+(n.right?`(${right})`:'');done.push(n.val);emit(`Subtree ${n.val} becomes '${value}'. Keep empty left parentheses only when a right child exists.`,{active:[n.id],metrics:{subtreeString:value},...tw(stack,done,`Combine children into '${value}' and return it to the caller.`,'recursion','Nodes already serialized (post-order)')},'update');stack.pop();return value;}
    return visit(root);
  },
  617({root1,root2},emit) {
    const stack=[],done=[];
    function merge(a,b){if(!a&&!b)return null;const n={id:`merge:${a?.id??'-'}:${b?.id??'-'}`,val:(a?.val??0)+(b?.val??0),left:null,right:null};stack.push({label:`merge(${a?.val??'missing'}, ${b?.val??'missing'})`});emit(`Call merge at this position: first tree has ${a?.val??'no node'}, second has ${b?.val??'no node'}.`,{active:[a?.id,b?.id].filter(Boolean),...tw(stack,done,`Sum is ${n.val}; merge the left children, then the right children.`,'recursion','Merged values finished (post-order)')});n.left=merge(a?.left,b?.left);n.right=merge(a?.right,b?.right);done.push(n.val);emit(`Combine ${a?.val??'missing'} and ${b?.val??'missing'} at corresponding positions. Missing nodes contribute zero.`,{active:[a?.id,b?.id].filter(Boolean),trees:[{label:'First input',root:root1},{label:'Second input',root:root2},{label:'Completed merged subtree',root:n}],metrics:{sum:n.val},...tw(stack,done,`Both children merged; return a node with value ${n.val}.`,'recursion','Merged values finished (post-order)')},'update');stack.pop();return n;}
    return showTree(merge(root1,root2),emit,'Every corresponding position has been summed; unmatched branches remain.');
  },
  623({root,val,depth},emit) {
    let serial=0;const create=(left=null,right=null)=>({id:`new:${serial++}`,val,left,right});
    if(depth===1)return showTree(create(root),emit,'A new root takes the original tree as its left child.');
    let row=[root];for(let d=1;d<depth-1;d++){emit(`At depth ${d}, move the frontier to existing children.`,{active:row.map(n=>n.id),output:row.map(n=>n.val),metrics:{depth:d}});row=row.flatMap(n=>[n.left,n.right].filter(Boolean));}
    for(const n of row){n.left=create(n.left);n.right=create(null,n.right);emit(`Insert children beneath ${n.val}. The old left subtree stays on the new left node; the old right subtree stays on the new right node.`,{active:[n.id,n.left.id,n.right.id],metrics:{insertedValue:val,depth}},'update');}
    return showTree(root,emit);
  },
  637({root},emit) {
    const output=[];let row=[root],depth=0;
    while(row.length){const total=row.reduce((s,n)=>s+n.val,0);output.push(total/row.length);emit(`Depth ${depth}: sum ${total} across ${row.length} nodes, giving average ${total/row.length}.`,{active:row.map(n=>n.id),metrics:{depth,sum:total,count:row.length},...tw(row.map(n=>n.val),output,`Process the whole queue (level ${depth}): average = ${total} / ${row.length}; then enqueue all of their children.`,'queue','Level averages so far')},'update');row=row.flatMap(n=>[n.left,n.right].filter(Boolean));depth++;}return output;
  },
  653({root,k},emit) {
    const seen=new Set(),stack=[root];while(stack.length){const n=stack.pop(),need=k-n.val;emit(`At ${n.val}, look for previously visited complement ${need}. Check before inserting to prevent reusing this node.`,{active:[n.id],metrics:{target:k,complement:need},...tw(stack.map(x=>x.val),[...seen],`Popped ${n.val}; complement ${need} is ${seen.has(need)?'in the seen set, so a pair exists':'not seen yet, so record '+n.val+' and push its children'}.`,'stack','Values seen so far')});if(seen.has(need))return true;seen.add(n.val);if(n.right)stack.push(n.right);if(n.left)stack.push(n.left);}return false;
  },
  654({nums},emit) {
    const stack=[];for(let i=0;i<nums.length;i++){const n={id:`max:${i}`,val:nums[i],left:null,right:null};const popped=[];while(stack.length&&stack.at(-1).val<n.val){const p=stack.pop();popped.push(p.val);n.left=p;}if(stack.length)stack.at(-1).right=n;stack.push(n);emit(`Insert ${n.val}: popped smaller roots become its left subtree; the remaining larger top owns it as right child.`,{trees:[{label:'Maximum tree of processed prefix',root:stack[0]}],active:[n.id],metrics:{processed:i+1},...tw(stack.map(v=>v.val),nums.slice(0,i+1),`${n.val}: ${popped.length?'popped '+popped.join(', ')+' (smaller), the last popped becomes its left child':'nothing smaller on the stack'}; ${stack.length>1?'it becomes the right child of '+stack.at(-2).val:'it is the new bottom (root)'}.`,'stack','Values processed')},'update');}return showTree(stack[0],emit);
  },
  669({root,low,high},emit) {
    const stack=[],kept=[];
    function trim(n){if(!n)return null;stack.push({label:`trim(${n.val})`,note:n.val<low?'too small':n.val>high?'too large':'in range'});const verdict=n.val<low?'too small, discard it and its entire left subtree':n.val>high?'too large, discard it and its entire right subtree':'inside the inclusive range, trim both children';if(n.val>=low&&n.val<=high)kept.push(n.val);emit(`Node ${n.val}: ${verdict}.`,{active:[n.id],metrics:{low,high},...tw(stack,kept,`Compare ${n.val} with [${low}, ${high}]: ${verdict}.`,'recursion','Nodes kept so far (pre-order)')});let result;if(n.val<low)result=trim(n.right);else if(n.val>high)result=trim(n.left);else{n.left=trim(n.left);n.right=trim(n.right);result=n;}stack.pop();return result;}
    return showTree(trim(root),emit,'Only in-range nodes remain, preserving the original relative parent-child order.');
  },
  671({root},emit) {
    let second=Infinity;const minimum=root.val,stack=[root];while(stack.length){const n=stack.pop();if(n.val>minimum)second=Math.min(second,n.val);else{if(n.left)stack.push(n.left);if(n.right)stack.push(n.right);}emit(`Node ${n.val}: ${n.val>minimum?'candidate for the second distinct value; its descendants cannot be smaller':'equal to the minimum, so search below it'}.`,{active:[n.id],metrics:{minimum,second:second===Infinity?'not found':second}},'update');}return second===Infinity?-1:second;
  },
  687({root},emit) {
    let best=0;const returns={},stack=[],done=[];
    function visit(n){if(!n)return 0;stack.push({label:`arm(${n.val})`,note:'needs child arms'});emit(`Call arm(${n.val}): get the equal-value arm lengths of both children first.`,{active:[n.id],nodeLabels:{...returns},metrics:{best},...tw(stack,done,`At ${n.val}: visit left (${n.left?n.left.val:'empty'}) and right (${n.right?n.right.val:'empty'}) before deciding.`,'recursion','Nodes finished (post-order)')});const l=visit(n.left),r=visit(n.right),left=n.left?.val===n.val?l+1:0,right=n.right?.val===n.val?r+1:0;best=Math.max(best,left+right);returns[n.id]=Math.max(left,right);done.push(n.val);emit(`At ${n.val}, matching arms have ${left} and ${right} edges. Join both for a candidate path, but return only one arm to the parent.`,{active:[n.id],nodeLabels:{...returns},metrics:{left,right,best},...tw(stack,done,`Left arm ${left} (child ${n.left?.val===n.val?'equals':'differs from'} ${n.val}), right arm ${right}; candidate ${left+right}, best ${best}; return ${returns[n.id]}.`,'recursion','Nodes finished (post-order)')},'update');stack.pop();return returns[n.id];}
    visit(root);return best;
  },
  700({root,val},emit) {
    let n=root;const path=[];while(n){path.push(n.val);emit(`Compare target ${val} with ${n.val}: ${val===n.val?'found':val<n.val?'search left':'search right'}.`,{active:[n.id],metrics:{target:val},...tw(null,path,`${val} ${val===n.val?'equals':val<n.val?'<':'>'} ${n.val}, so ${val===n.val?'stop: this is the match':val<n.val?'every match must be in the left subtree':'every match must be in the right subtree'}.`,'recursion','Search path so far')});if(n.val===val)return showTree(n,emit,'Return the entire subtree rooted at the matching node.');n=val<n.val?n.left:n.right;}return showTree(null,emit,'The search reached a missing child; the target is absent.');
  },
  701({root,val},emit) {
    const node={id:'inserted',val,left:null,right:null};if(!root)return showTree(node,emit,'Insert the first node as the root.');let n=root;const path=[];while(true){const side=val<n.val?'left':'right';path.push(n.val);emit(`At ${n.val}, value ${val} belongs on the ${side}.`,{active:[n.id],metrics:{insert:val},...tw(null,path,`${val} ${val<n.val?'<':'>'} ${n.val}, so go ${side}${n[side]?'':'; that child is missing, so attach the new leaf here'}.`,'recursion','Insertion path so far')});if(!n[side]){n[side]=node;break;}n=n[side];}return showTree(root,emit,'Attach the new leaf at the first missing child on its BST search path.');
  },
  872({root1,root2},emit) {
    function leaves(root,label){const output=[],stack=[root];while(stack.length){const n=stack.pop();if(!n.left&&!n.right)output.push(n.val);if(n.right)stack.push(n.right);if(n.left)stack.push(n.left);emit(`${label}: ${!n.left&&!n.right?'record leaf '+n.val:'expand internal node '+n.val}. Push right before left to preserve left-to-right order.`,{active:[n.id],metrics:{tree:label},...tw(stack.map(x=>x.val),output,`Popped ${n.val}: ${!n.left&&!n.right?'no children, so it is a leaf and joins the sequence':'it has children, so push the right one first and the left one on top'}.`,'stack',label+' leaves so far')},'update');}return output;}
    const a=leaves(root1,'First tree'),b=leaves(root2,'Second tree');emit('Compare ordered leaf sequences; internal node values and shape do not matter.',{metrics:{firstLeaves:a,secondLeaves:b},...tw(null,a,`First ${JSON.stringify(a)} vs second ${JSON.stringify(b)}: ${JSON.stringify(a)===JSON.stringify(b)?'identical':'different'}.`,'recursion','First tree leaves')});return JSON.stringify(a)===JSON.stringify(b);
  },
  897({root},emit) {
    const nodes=[],stack=[];function inorder(n){if(!n)return;stack.push({label:`inorder(${n.val})`});emit(`Call inorder(${n.val}): finish the left subtree before visiting it.`,{active:[n.id],output:undefined,...tw(stack,nodes.map(v=>v.val),`At ${n.val}: go left first (${n.left?n.left.val:'empty'}).`,'recursion','Inorder (sorted) order so far')});inorder(n.left);nodes.push(n);emit(`Visit ${n.val} in sorted inorder; it will follow every smaller value in the output chain.`,{active:[n.id],...tw(stack,nodes.map(v=>v.val),`Left subtree done: visit ${n.val} now, then go right (${n.right?n.right.val:'empty'}).`,'recursion','Inorder (sorted) order so far')},'update');inorder(n.right);stack.pop();}inorder(root);
    nodes.forEach((n,i)=>{n.left=null;n.right=nodes[i+1]??null;});return showTree(nodes[0]??null,emit,'Every left pointer is null; right pointers follow inorder values.');
  },
  938({root,low,high},emit) {
    const stack=[root],added=[];let total=0;while(stack.length){const n=stack.pop();const inside=n.val>=low&&n.val<=high;if(inside){total+=n.val;added.push(n.val);}const goL=n.left&&n.val>low,goR=n.right&&n.val<high;if(goL)stack.push(n.left);if(goR)stack.push(n.right);emit(`At ${n.val}, ${inside?'add the in-range value':'do not add this value'}. BST ordering prunes branches that cannot enter [${low},${high}].`,{active:[n.id],metrics:{low,total},...tw(stack.map(x=>x.val),added,`${n.val} vs [${low}, ${high}]: ${inside?'inside, add it':'outside, skip it'}; left ${n.left?(goL?'pushed (values above '+low+' may be inside)':'pruned ('+n.val+' <= '+low+')'):'is empty'}; right ${n.right?(goR?'pushed':'pruned ('+n.val+' >= '+high+')'):'is empty'}.`,'stack','In-range values added')},'update');}return total;
  },
  965({root},emit) {
    const value=root.val,stack=[root],checked=[];while(stack.length){const n=stack.pop();checked.push(n.val);emit(`Compare ${n.val} with the root value ${value}.`,{active:[n.id],metrics:{expected:value,matches:n.val===value},...tw(stack.map(x=>x.val),checked,`${n.val} ${n.val===value?'equals':'differs from'} ${value}: ${n.val===value?'keep going, push its children':'stop and return false'}.`,'stack','Nodes compared so far')});if(n.val!==value)return false;if(n.left)stack.push(n.left);if(n.right)stack.push(n.right);}return true;
  },
};
