export const makeListNodes=values=>values.map((val,i)=>({val,next:i+1<values.length?i+1:null}));
export function snapshotLinkedList(nodes,head,pointers=[],highlightedIds=[]){
  const ordered=[];
  for(let node=head;node!==null;node=nodes[node].next)ordered.push({id:node,val:nodes[node].val,nextId:nodes[node].next});
  return{nodes:ordered,pointers:[{label:'head',nodeId:head},...pointers],highlightedIds};
}
