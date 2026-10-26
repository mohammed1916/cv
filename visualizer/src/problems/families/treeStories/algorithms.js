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

export const solvers={
  606({root},emit) {
    function visit(n){if(!n)return '';const left=visit(n.left),right=visit(n.right);const value=String(n.val)+(n.left||n.right?`(${left})`:'')+(n.right?`(${right})`:'');emit(`Subtree ${n.val} becomes '${value}'. Keep empty left parentheses only when a right child exists.`,{active:[n.id],metrics:{subtreeString:value}},'update');return value;}
    return visit(root);
  },
  617({root1,root2},emit) {
    function merge(a,b){if(!a&&!b)return null;const n={id:`merge:${a?.id??'-'}:${b?.id??'-'}`,val:(a?.val??0)+(b?.val??0),left:null,right:null};n.left=merge(a?.left,b?.left);n.right=merge(a?.right,b?.right);emit(`Combine ${a?.val??'missing'} and ${b?.val??'missing'} at corresponding positions. Missing nodes contribute zero.`,{active:[a?.id,b?.id].filter(Boolean),trees:[{label:'First input',root:root1},{label:'Second input',root:root2},{label:'Completed merged subtree',root:n}],metrics:{sum:n.val}},'update');return n;}
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
    while(row.length){const total=row.reduce((s,n)=>s+n.val,0);output.push(total/row.length);emit(`Depth ${depth}: sum ${total} across ${row.length} nodes, giving average ${total/row.length}.`,{active:row.map(n=>n.id),output,metrics:{depth,sum:total,count:row.length}},'update');row=row.flatMap(n=>[n.left,n.right].filter(Boolean));depth++;}return output;
  },
  653({root,k},emit) {
    const seen=new Set(),stack=[root];while(stack.length){const n=stack.pop(),need=k-n.val;emit(`At ${n.val}, look for previously visited complement ${need}. Check before inserting to prevent reusing this node.`,{active:[n.id],output:[...seen],metrics:{target:k,complement:need}});if(seen.has(need))return true;seen.add(n.val);if(n.right)stack.push(n.right);if(n.left)stack.push(n.left);}return false;
  },
  654({nums},emit) {
    const stack=[];for(let i=0;i<nums.length;i++){const n={id:`max:${i}`,val:nums[i],left:null,right:null};while(stack.length&&stack.at(-1).val<n.val)n.left=stack.pop();if(stack.length)stack.at(-1).right=n;stack.push(n);emit(`Insert ${n.val}: popped smaller roots become its left subtree; the remaining larger top owns it as right child.`,{trees:[{label:'Maximum tree of processed prefix',root:stack[0]}],active:[n.id],output:stack.map(v=>v.val),metrics:{processed:i+1}},'update');}return showTree(stack[0],emit);
  },
  669({root,low,high},emit) {
    function trim(n){if(!n)return null;emit(`Node ${n.val}: ${n.val<low?'too small, discard it and its entire left subtree':n.val>high?'too large, discard it and its entire right subtree':'inside the inclusive range, trim both children'}.`,{active:[n.id],metrics:{low,high}});if(n.val<low)return trim(n.right);if(n.val>high)return trim(n.left);n.left=trim(n.left);n.right=trim(n.right);return n;}
    return showTree(trim(root),emit,'Only in-range nodes remain, preserving the original relative parent-child order.');
  },
  671({root},emit) {
    let second=Infinity;const minimum=root.val,stack=[root];while(stack.length){const n=stack.pop();if(n.val>minimum)second=Math.min(second,n.val);else{if(n.left)stack.push(n.left);if(n.right)stack.push(n.right);}emit(`Node ${n.val}: ${n.val>minimum?'candidate for the second distinct value; its descendants cannot be smaller':'equal to the minimum, so search below it'}.`,{active:[n.id],metrics:{minimum,second:second===Infinity?'not found':second}},'update');}return second===Infinity?-1:second;
  },
  687({root},emit) {
    let best=0;const returns={};
    function visit(n){if(!n)return 0;const l=visit(n.left),r=visit(n.right),left=n.left?.val===n.val?l+1:0,right=n.right?.val===n.val?r+1:0;best=Math.max(best,left+right);returns[n.id]=Math.max(left,right);emit(`At ${n.val}, matching arms have ${left} and ${right} edges. Join both for a candidate path, but return only one arm to the parent.`,{active:[n.id],nodeLabels:{...returns},metrics:{left,right,best}},'update');return returns[n.id];}
    visit(root);return best;
  },
  700({root,val},emit) {
    let n=root;while(n){emit(`Compare target ${val} with ${n.val}: ${val===n.val?'found':val<n.val?'search left':'search right'}.`,{active:[n.id],metrics:{target:val}});if(n.val===val)return showTree(n,emit,'Return the entire subtree rooted at the matching node.');n=val<n.val?n.left:n.right;}return showTree(null,emit,'The search reached a missing child; the target is absent.');
  },
  701({root,val},emit) {
    const node={id:'inserted',val,left:null,right:null};if(!root)return showTree(node,emit,'Insert the first node as the root.');let n=root;while(true){const side=val<n.val?'left':'right';emit(`At ${n.val}, value ${val} belongs on the ${side}.`,{active:[n.id],metrics:{insert:val}});if(!n[side]){n[side]=node;break;}n=n[side];}return showTree(root,emit,'Attach the new leaf at the first missing child on its BST search path.');
  },
  872({root1,root2},emit) {
    function leaves(root,label){const output=[],stack=[root];while(stack.length){const n=stack.pop();if(!n.left&&!n.right)output.push(n.val);if(n.right)stack.push(n.right);if(n.left)stack.push(n.left);emit(`${label}: ${!n.left&&!n.right?'record leaf '+n.val:'expand internal node '+n.val}. Push right before left to preserve left-to-right order.`,{active:[n.id],output,metrics:{tree:label}},'update');}return output;}
    const a=leaves(root1,'First tree'),b=leaves(root2,'Second tree');emit('Compare ordered leaf sequences; internal node values and shape do not matter.',{metrics:{firstLeaves:a,secondLeaves:b}});return JSON.stringify(a)===JSON.stringify(b);
  },
  897({root},emit) {
    const nodes=[];function inorder(n){if(!n)return;inorder(n.left);nodes.push(n);emit(`Visit ${n.val} in sorted inorder; it will follow every smaller value in the output chain.`,{active:[n.id],output:nodes.map(v=>v.val)},'update');inorder(n.right);}inorder(root);
    nodes.forEach((n,i)=>{n.left=null;n.right=nodes[i+1]??null;});return showTree(nodes[0]??null,emit,'Every left pointer is null; right pointers follow inorder values.');
  },
  938({root,low,high},emit) {
    const stack=[root];let total=0;while(stack.length){const n=stack.pop();if(n.val>=low&&n.val<=high)total+=n.val;if(n.left&&n.val>low)stack.push(n.left);if(n.right&&n.val<high)stack.push(n.right);emit(`At ${n.val}, ${n.val>=low&&n.val<=high?'add the in-range value':'do not add this value'}. BST ordering prunes branches that cannot enter [${low},${high}].`,{active:[n.id],metrics:{low,high,total},output:stack.map(v=>v.val)},'update');}return total;
  },
  965({root},emit) {
    const value=root.val,stack=[root];while(stack.length){const n=stack.pop();emit(`Compare ${n.val} with the root value ${value}.`,{active:[n.id],metrics:{expected:value,matches:n.val===value}});if(n.val!==value)return false;if(n.left)stack.push(n.left);if(n.right)stack.push(n.right);}return true;
  },
};
