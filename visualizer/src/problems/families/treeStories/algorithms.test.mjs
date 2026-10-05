import test from 'node:test';
import assert from 'node:assert/strict';
import {definitions} from './definitions.js';

function decode(a){if(!a.length||a[0]===null)return null;const root={val:a[0],left:null,right:null},queue=[root];let i=1;for(let h=0;h<queue.length&&i<a.length;h++)for(const side of ['left','right']){const value=a[i++];if(value!==null&&value!==undefined){const n={val:value,left:null,right:null};queue[h][side]=n;queue.push(n);}}return root;}
function encode(root){if(!root)return [];let frontier=[root],output=[];while(frontier.some(Boolean)){const next=[];for(const n of frontier){output.push(n?.val??null);if(n)next.push(n.left,n.right);}frontier=next;}while(output.at(-1)===null)output.pop();return output;}
const nodes=n=>n?[n,...nodes(n.left),...nodes(n.right)]:[];
const leaves=n=>!n?[]:!n.left&&!n.right?[n.val]:[...leaves(n.left),...leaves(n.right)];
const inorder=n=>n?[...inorder(n.left),n.val,...inorder(n.right)]:[];
function insert(root,val){if(!root)return{val,left:null,right:null};if(val<root.val)root.left=insert(root.left,val);else root.right=insert(root.right,val);return root;}
const oracles={
  606:({root})=>{function format(n){if(!n)return '';if(!n.left&&!n.right)return String(n.val);return `${n.val}(${format(n.left)})${n.right?'('+format(n.right)+')':''}`;}return format(decode(root));},
  617:({root1,root2})=>{function sum(a,b){if(!a)return b;if(!b)return a;return {val:a.val+b.val,left:sum(a.left,b.left),right:sum(a.right,b.right)};}return encode(sum(decode(root1),decode(root2)));},
  623:({root,val,depth})=>{function add(n,d){if(d===1)return {val,left:n,right:null};if(!n)return null;if(d===2)return {...n,left:{val,left:n.left,right:null},right:{val,left:null,right:n.right}};return {...n,left:add(n.left,d-1),right:add(n.right,d-1)};}return encode(add(decode(root),depth));},
  637:({root})=>{const levels=[];function visit(n,d){if(!n)return;(levels[d]??=[]).push(n.val);visit(n.left,d+1);visit(n.right,d+1);}visit(decode(root),0);return levels.map(a=>a.reduce((s,n)=>s+n,0)/a.length);},
  653:({root,k})=>{const a=nodes(decode(root));return a.some((n,i)=>a.some((m,j)=>i!==j&&n.val+m.val===k));},
  654:({nums})=>{function build(a){if(!a.length)return null;const val=Math.max(...a),i=a.indexOf(val);return {val,left:build(a.slice(0,i)),right:build(a.slice(i+1))};}return encode(build(nums));},
  669:({root,low,high})=>{function keep(n){if(!n)return null;const left=keep(n.left),right=keep(n.right);if(n.val<low)return right;if(n.val>high)return left;return {...n,left,right};}return encode(keep(decode(root)));},
  671:({root})=>[...new Set(nodes(decode(root)).map(n=>n.val))].sort((a,b)=>a-b)[1]??-1,
  687:({root})=>{const tree=decode(root),all=nodes(tree),neighbors=new Map(all.map(n=>[n,[]]));for(const n of all)for(const child of [n.left,n.right])if(child){neighbors.get(n).push(child);neighbors.get(child).push(n);}let best=0;for(const start of all){const queue=[[start,null,0]];while(queue.length){const [n,parent,depth]=queue.shift();best=Math.max(best,depth);for(const child of neighbors.get(n))if(child!==parent&&child.val===start.val)queue.push([child,n,depth+1]);}}return best;},
  700:({root,val})=>encode(nodes(decode(root)).find(n=>n.val===val)??null),
  701:({root,val})=>encode(insert(decode(root),val)),
  872:({root1,root2})=>JSON.stringify(leaves(decode(root1)))===JSON.stringify(leaves(decode(root2))),
  897:({root})=>{const a=inorder(decode(root));return a.flatMap((v,i)=>i===a.length-1?[v]:[v,null]);},
  938:({root,low,high})=>nodes(decode(root)).filter(n=>n.val>=low&&n.val<=high).reduce((s,n)=>s+n.val,0),
  965:({root})=>new Set(nodes(decode(root)).map(n=>n.val)).size===1,
};
function check(id,input){const before=JSON.stringify(input),run=definitions[id].build(input);assert.deepEqual(run.result,oracles[id](input),`${id}: ${before}`);assert.equal(JSON.stringify(input),before);assert.equal(run.frames[0].phase,'start');assert.equal(run.frames.at(-1).phase,'done');for(const f of run.frames)for(const {root}of f.trees){const ids=nodes(root).map(n=>n.id);assert.equal(new Set(ids).size,ids.length,'Node identity remains unique even with repeated values');}return run;}
for(const [id,d]of Object.entries(definitions))test(`${id}: all original tree examples agree with an independent reference`,()=>{for(const e of d.examples)check(id,d.parse(e.input));});

let seed=623;
const rand=n=>{seed=(seed*1664525+1013904223)>>>0;return seed%n;};
test('15 tree solvers pass 100 generated shape and value checks',()=>{
 for(let t=0;t<100;t++){
  let bst=null;const values=[...new Set(Array.from({length:12},()=>rand(50)-20))];for(const v of values)bst=insert(bst,v);const root=encode(bst),general=root.map(v=>v===null?null:Math.abs(v)%4),other=general.map(v=>v===null?null:rand(5));
  for(const id of [606,637,687,965])check(id,{root:general});
  check(617,{root1:general,root2:other});check(623,{root:general,val:rand(10),depth:1+rand(2)});
  check(653,{root,k:rand(50)-15});check(654,{nums:values.map(v=>v+20)});
  check(669,{root,low:-4,high:15});check(700,{root,val:rand(50)-20});check(701,{root,val:51+t});
  check(872,{root1:general,root2:t%2?general:other});check(897,{root});check(938,{root,low:-8,high:19});
  const minTree={val:0,left:{val:1+rand(9),left:null,right:null},right:{val:1+rand(9),left:null,right:null}};minTree.val=Math.min(minTree.left.val,minTree.right.val);check(671,{root:encode(minTree)});
 }
});

test('rewiring and merging preserve initial playback snapshots',()=>{
 const inserted=check(701,{root:[8,3,12],val:10});assert.deepEqual(encode(inserted.frames[0].trees[0].root),[8,3,12]);
 const rearranged=check(897,{root:[8,3,12,1,5]});assert.deepEqual(encode(rearranged.frames[0].trees[0].root),[8,3,12,1,5]);
 const row=check(623,{root:[8,3,12],val:6,depth:2});assert.deepEqual(encode(row.frames[0].trees[0].root),[8,3,12]);
});

test('right-only string structure, edge counts, and equal leaf sequences',()=>{
 assert.equal(check(606,{root:[4,null,9]}).result,'4()(9)');
 assert.equal(check(687,{root:[5,5,5]}).result,2);
 const d=definitions[872];assert.equal(check(872,d.parse(d.examples[0].input)).result,true);
});

test('tree-domain validation rejects orphan nodes, invalid BSTs and wrong special-tree shape',()=>{
 const invalid={606:{root:[null,2]},617:{root1:[1,null,null,2],root2:[]},623:{root:[1],val:4,depth:3},637:{root:[]},653:{root:[8,12,3],k:15},654:{nums:[4,4]},669:{root:[8,3,12],low:9,high:1},671:{root:[4,2,7]},687:{root:[null,2]},700:{root:[3,4],val:4},701:{root:[8,3,12],val:8},872:{root1:[],root2:[1]},897:{root:[5,8,2]},938:{root:[],low:1,high:4},965:{root:[]}};
 for(const [id,input]of Object.entries(invalid))assert.throws(()=>definitions[id].parse(JSON.stringify(input)),undefined,id);
});
