// Stable path IDs distinguish equal values; siblings retain their input order.
export function naryTreeLayout(root) {
  const positions=new Map(),nodes=[],edges=[];
  let column=0,maxDepth=0;
  function visit(value,id,depth){
    const node={id,val:value.val,children:[]};nodes.push(node);maxDepth=Math.max(maxDepth,depth);
    node.children=(value.children??[]).map((child,index)=>{const next=visit(child,`${id}.${index}`,depth+1);edges.push({fromId:id,toId:next.id});return next;});
    const x=node.children.length?(positions.get(node.children[0].id).x+positions.get(node.children.at(-1).id).x)/2:48+column++*76;
    positions.set(id,{x,y:48+depth*86});return node;
  }
  const tree=root?visit(root,'root',0):null;
  return {tree,positions,nodes,edges,width:Math.max(320,96+Math.max(0,column-1)*76),height:Math.max(240,96+maxDepth*86)};
}
