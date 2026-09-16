export function reconstructTreeStory(inorderText, traversalText, order = 'preorder') {
  const inorder=JSON.parse(inorderText), traversal=JSON.parse(traversalText);
  if (![inorder,traversal].every(a=>Array.isArray(a)&&a.every(Number.isSafeInteger))) throw new Error('Use two arrays of integers.');
  if (inorder.length !== traversal.length || new Set(inorder).size !== inorder.length || new Set(traversal).size !== traversal.length || traversal.some(v=>!inorder.includes(v))) throw new Error('Both traversals must contain the same unique values.');
  if(inorder.length>200)throw new Error('This construction story supports up to 200 nodes.');
  const post=order==='postorder', frames=[], nodes=[], index=new Map(inorder.map((v,i)=>[v,i]));
  const emit=(phase,activeLine,message,extra={})=>{frames.push({phase,activeLine,message,lo:0,hi:inorder.length,start:0,end:traversal.length,...extra});return frames.length-1;};
  emit('init',1,post?'The last postorder value is the root; inorder determines its two subtrees.':'The first preorder value is the root; inorder determines its two subtrees.');
  function build(lo,hi,start,end,parent=null,side=null){
    if(lo===hi){emit('return',2,'Empty interval: no child.',{lo,hi,start,end,parent,side});return null;}
    const cursor=post?end-1:start,val=traversal[cursor],mid=index.get(val);
    if(mid===undefined||mid<lo||mid>=hi)throw new Error('These traversals imply conflicting subtree boundaries.');
    const extra={lo,hi,start,end,cursor,mid,parent,side};
    emit('pick_root',3,`${order}[${cursor}] = ${val} is the root of this interval.`,extra);
    const node={id:mid,val,parent,left:null,right:null};
    const split=()=>emit('compare',post?5:4,`Inorder index ${mid} splits ${mid-lo} left and ${hi-mid-1} right nodes.`,extra);
    if(!post)split();
    node.createdAt=emit('create',post?4:5,`Create node ${val}${parent===null?' as the root':` as the ${side} child`}.`,extra);nodes.push(node);
    if(post)split();
    const leftSize=mid-lo,leftStart=post?start:start+1,leftEnd=leftStart+leftSize;
    emit('visit',6,'Construct the left subtree from its matching traversal interval.',extra);
    node.left=build(lo,mid,leftStart,leftEnd,mid,'left');
    emit('visit',post?9:8,'Construct the right subtree from the remaining interval.',extra);
    node.right=build(mid+1,hi,leftEnd,post?end-1:end,mid,'right');
    node.returnedAt=emit('return',post?12:10,`Return completed subtree rooted at ${val}.`,extra);
    return node;
  }
  const root=build(0,inorder.length,0,traversal.length);
  emit('done',post?12:10,'Construction complete: the tree reproduces both supplied traversals.');
  return {root,nodes,frames,inorder,traversal,order};
}
