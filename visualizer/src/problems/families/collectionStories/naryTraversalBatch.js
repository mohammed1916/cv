import {naryTreeLayout} from '../../../components/shared/naryTreeLayout.js';
const specs={
589:['root','Visit an N-ary tree in root-first order while preserving left-to-right child order.','A stack supplies the next node. Output the node immediately, then push its children in reverse order so the leftmost child becomes the next stack top.','put the root on a stack when it exists|pop the next node|append its value before processing its children|push children from right to left|return the root-first traversal','O(nodes) time and O(nodes) worst-case stack space.'],
590:['root','Visit every child subtree before its parent in left-to-right order.','A stack entry records whether its children have already been scheduled. First defer the parent beneath its reversed children; when the deferred parent returns to the top, all child subtrees are complete.','put the root on a stack marked not expanded|pop an entry and inspect its expanded flag|defer an unexpanded node beneath its children|append an expanded node after its children finish|return the children-first traversal','O(nodes) time and O(nodes) worst-case stack space.'],
};
function solve(id,{root},emit){const layout=naryTreeLayout(root),stack=layout.tree?[[layout.tree,false]]:[],output=[],visited=new Set();while(stack.length){const[node,expanded]=stack.pop();let stage,message;if(id===589){output.push(node.val);visited.add(node.id);for(let i=node.children.length-1;i>=0;i--)stack.push([node.children[i],false]);stage='visit';message='Visit this node before its descendants. Reverse child pushes preserve left-to-right processing on a last-in-first-out stack.';}else if(expanded){output.push(node.val);visited.add(node.id);stage='visit';message='This deferred parent returns after all its children have finished. It can now enter the postorder output.';}else{stack.push([node,true]);for(let i=node.children.length-1;i>=0;i--)stack.push([node.children[i],false]);stage='defer';message='Keep an expanded parent frame below its children. The stack will finish each child subtree before returning to this parent.';}emit(message,{treeDiagram:{...layout,activeIds:new Set([node.id]),visitedIds:new Set(visited),queueIds:new Set(stack.map(([n])=>n.id))},output:[...output],table:[...stack].reverse().map(([n,done])=>[n.id,n.val,done?'children scheduled':'first visit']),tableHeaders:['Stack top first: node ID','Value','Frame state'],codeStage:stage,metrics:{current:node.val,emitted:output.length,pendingFrames:stack.length}},'update');}return output;}
const solvers={589:(input,emit)=>solve(589,input,emit),590:(input,emit)=>solve(590,input,emit)};
const python={
589:`def preorder(root):
    stack = [root] if root is not None else []
    output = []
    while stack:
        node = stack.pop()
        output.append(node['val'])  # step: visit
        stack.extend(reversed(node.get('children', [])))
    return output  # step: return`,
590:`def postorder(root):
    stack = [(root, False)] if root is not None else []
    output = []
    while stack:
        node, expanded = stack.pop()
        if expanded:
            output.append(node['val'])  # step: visit
        else:
            stack.append((node, True))  # step: defer
            stack.extend((child, False) for child in reversed(node.get('children', [])))
    return output  # step: return`,
};
const node=(val,...children)=>({val,children});
const examples=[['Several branches and grandchildren distinguish parent timing',{root:node(40,node(12,node(5),node(17,node(14),node(19))),node(23),node(61,node(48),node(72),node(86,node(81))))}],['An empty tree has no traversal values',{root:null}],['Repeated values retain distinct node identities',{root:node(7,node(7,node(7)),node(7),node(7))}],['A single long child chain exposes reversed traversal order',{root:node(3,node(8,node(15,node(24,node(35)))))}]];
function validate(id,input){let count=0;function visit(node,depth){if(!node||typeof node!=='object'||Array.isArray(node)||!Number.isSafeInteger(node.val)||Math.abs(node.val)>1000000||!Array.isArray(node.children??[]))throw new Error('Each node needs an integer val and an optional children array. Use null for an empty root.');if(++count>60||depth>15)throw new Error('Use at most 60 nodes and depth 15 for an inspectable tree.');for(const child of node.children??[])visit(child,depth+1);}if(input.root!==null)visit(input.root,0);return input;}
export default {specs,solvers,python,cases:{589:examples,590:examples},validate,inputState:(id,input)=>({treeDiagram:naryTreeLayout(input.root)}),pseudocodeStages:{589:{visit:3},590:{defer:3,visit:4}},tags:{589:['Tree','Stack'],590:['Tree','Stack']}};
