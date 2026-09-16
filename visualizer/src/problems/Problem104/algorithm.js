import { parseLevelOrderTree } from '../../components/shared/levelOrderTree.js';
import { binaryTreeLayout } from '../../components/shared/binaryTreeLayout.js';

export function generateSteps(text) {
  const root=parseLevelOrderTree(text),layout=binaryTreeLayout(root),steps=[],returnValues=new Map(),paths=new Map();
  const stack=root?[{node:root,stage:0}]:[];
  const emit=(phase,activeLine,node,message,extra={})=>steps.push({phase,activeLine,activeId:node?.id??-1,callStack:stack.map(w=>w.node.val),returnValues:new Map(returnValues),message,...extra});
  while(stack.length){
    const work=stack.at(-1),node=work.node;
    if(work.stage===0){emit('call',4,node,`Explore the left subtree of ${node.val}. A missing child contributes zero.`);work.stage=1;if(node.left)stack.push({node:node.left,stage:0});continue;}
    const left=node.left?returnValues.get(node.left.id):0;
    if(work.stage===1){emit('right',5,node,`Left depth is ${left}. Explore the right subtree.`,{left});work.stage=2;if(node.right)stack.push({node:node.right,stage:0});continue;}
    const right=node.right?returnValues.get(node.right.id):0,depth=1+Math.max(left,right),chosen=left>=right?node.left:node.right;
    returnValues.set(node.id,depth);paths.set(node.id,[node.id,...(chosen?paths.get(chosen.id):[])]);
    emit('return',6,node,`Return ${depth}: this node plus the deeper child (${left} versus ${right}).`,{left,right,path:paths.get(node.id)});
    stack.pop();
  }
  emit('done',root?6:3,null,`Maximum depth = ${root?returnValues.get(root.id):0}`,{path:root?paths.get(root.id):[],total:root?returnValues.get(root.id):0});
  return {...layout,steps};
}
