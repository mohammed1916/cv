import {diffListLinks,detachedIds} from '../../../components/shared/listPointerModel.js';
export const makeListNodes=values=>values.map((val,i)=>({val,next:i+1<values.length?i+1:null}));
// Remember the previous link table per node array so each snapshot can report the pointers rewritten since the last one.
const previousLinks=new WeakMap();
export function snapshotLinkedList(nodes,head,pointers=[],highlightedIds=[]){
  const ordered=[],seen=new Set();
  for(let node=head;node!==null&&node!==undefined&&!seen.has(node);node=nodes[node].next){seen.add(node);ordered.push({id:node,val:nodes[node].val,nextId:nodes[node].next});}
  const links={head:head??null,nexts:Object.fromEntries(nodes.map((node,i)=>[i,node.next]))};
  const rewrites=diffListLinks(previousLinks.get(nodes),links);
  previousLinks.set(nodes,links);
  const detached=detachedIds(nodes.map((_,i)=>i),links.nexts,head??null).map(id=>({id,val:nodes[id].val,nextId:nodes[id].next}));
  return{nodes:ordered,pointers:[{label:'head',nodeId:head},...pointers],highlightedIds,detached,rewrites};
}
