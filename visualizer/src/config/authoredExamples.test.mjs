import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parse} from '@babel/parser';
import {AUTHORED_EXAMPLES as suites} from './authoredExamples.js';
import {generateSteps as allOne} from '../problems/Problem432/algorithm.js';

test('answer-rate presets match the accepted-answer table schema', () => {
 for (const example of suites['highest-answer-rate']) {
  for (const answer of example.answers) {
   assert.equal(answer.is_accepted, 1);
   assert.ok(Number.isInteger(answer.id));
   assert.ok(example.questions.some(q => q.id === answer.question_id));
  }
 }
 assert.equal(suites['highest-answer-rate'][0].answers.filter(a => a.question_id === 11 && a.is_accepted).length, 2);
});

test('every suite has named distinct cases and fully defined data',()=>{
 for(const [key,examples] of Object.entries(suites)){
  assert.ok(examples.length>=3,key);
  assert.equal(new Set(examples.map(e=>e.label)).size,examples.length,key);
  for(const e of examples){
   assert.ok(e.label.length>=3,`${key}: meaningful label`);
   assert.ok(Object.keys(e).length>1,key);
   assert.ok(!JSON.stringify(e).includes('learning algorithm structures'),key);
   assert.ok(Object.values(e).every(v=>v!==undefined),key);
  }
 }
});

test('single-number suites preserve their occurrence-count promises',()=>{
 for(const [key,repeat,extract] of [
  ['single-number',2,e=>e.nums],['single-number-ii',3,e=>JSON.parse(e.input)],
 ])for(const e of suites[key]){
  const counts=new Map();for(const n of extract(e))counts.set(n,(counts.get(n)||0)+1);
  assert.equal([...counts.values()].filter(n=>n===1).length,1,e.label);
  assert.ok([...counts.values()].every(n=>n===1||n===repeat),e.label);
 }
});

test('index-marker problems keep values in their required domains',()=>{
 for(const e of suites['find-duplicate']){
  assert.ok(e.nums.every(n=>Number.isInteger(n)&&n>=1&&n<e.nums.length),e.label);
  const counts=new Map();for(const n of e.nums)counts.set(n,(counts.get(n)||0)+1);
  assert.equal([...counts.values()].filter(n=>n>1).length,1,e.label);
 }
 for(const e of suites['missing-number']){
  assert.equal(new Set(e.nums).size,e.nums.length,e.label);
  assert.ok(e.nums.every(n=>n>=0&&n<=e.nums.length),e.label);
 }
 for(const e of suites['array-nesting'])assert.deepEqual([...e.array].sort((a,b)=>a-b),e.array.map((_,i)=>i),e.label);
});

test('sorted searches and list conversions receive sorted data',()=>{
 for(const [key,field] of [['binary-search','nums'],['find-first-last-position','nums'],['two-sum-ii','numbers'],['convert-sorted-array-to-binary-search-tree','arr'],['convert-sorted-list-to-binary-search-tree','list']]){
  for(const e of suites[key])assert.ok(e[field].every((v,i,a)=>!i||a[i-1]<=v),`${key}: ${e.label}`);
 }
 for(const e of suites['median-of-two-sorted-arrays'])for(const arr of [e.nums1,e.nums2])assert.ok(arr.every((v,i)=>!i||arr[i-1]<=v),e.label);
});

test('grids have rectangular rows and domain-appropriate cell values',()=>{
 for(const [key,field,allowed] of [['01-matrix','mat',[0,1]],['max-area-of-island','grid',[0,1]],['rotting-oranges','grid',[0,1,2]],['minesweeper','board',['E','M','B','X','1','2','3','4','5','6','7','8']],['word-search','board',null]]){
  for(const e of suites[key]){
   const grid=e[field];assert.ok(grid.every(r=>r.length===grid[0].length),`${key}: ${e.label}`);
   if(allowed)assert.ok(grid.flat().every(v=>allowed.includes(v)),`${key}: ${e.label}`);
   if(key==='01-matrix')assert.ok(grid.flat().includes(0),e.label);
  }
 }
});

test('graph endpoints, random pointers and queries stay in bounds',()=>{
 for(const key of ['connected-components-undirected','minimum-height-trees'])for(const e of suites[key])assert.ok(e.edges.every(edge=>edge.length===2&&edge.every(n=>n>=0&&n<e.n)),`${key}: ${e.label}`);
 for(const e of suites['course-schedule'])assert.ok(e.prerequisites.every(edge=>edge.every(n=>n>=0&&n<e.numCourses)),e.label);
 for(const e of suites['copy-list-random'])assert.ok(e.nodes.every(n=>n.random===null||n.random>=0&&n.random<e.nodes.length),e.label);
 for(const e of suites['range-sum-query-2d-immutable'])assert.ok(e.row1>=0&&e.row1<=e.row2&&e.row2<e.matrix.length&&e.col1>=0&&e.col1<=e.col2&&e.col2<e.matrix[0].length,e.label);
});

test('each solver Sudoku agrees with its independently constructed completion',()=>{
 const full=suites['sudoku-solver'].find(e=>e.label==='Already solved').board;
 for(let i=0;i<9;i++){
  assert.equal(new Set(full[i]).size,9);
  assert.equal(new Set(full.map(row=>row[i])).size,9);
  const r=Math.floor(i/3)*3,c=i%3*3;
  assert.equal(new Set(full.slice(r,r+3).flatMap(row=>row.slice(c,c+3))).size,9);
 }
 for(const e of suites['sudoku-solver'])e.board.forEach((row,r)=>row.forEach((v,c)=>assert.ok(v==='.'||v===full[r][c],e.label)));
});

test('AllOne traces handle ties, disappearing buckets and empty extrema',()=>{
 for(const e of suites['all-o1-data-structure']){
  const trace=allOne(e.operations),reference=new Map();let cursor=1;
  for(const [op,key] of e.operations){
   const frame=trace[cursor++];
   if(op==='inc')reference.set(key,(reference.get(key)||0)+1);
   if(op==='dec'){const count=reference.get(key)-1;if(count)reference.set(key,count);else reference.delete(key);}
   if(op.startsWith('get')){
    if(!reference.size)assert.equal(frame.result,'');
    else assert.equal(reference.get(frame.result),(op==='getMinKey'?Math.min:Math.max)(...reference.values()));
   }
   assert.deepEqual([...frame.map].sort(),[...reference].sort());
  }
 }
});

function localTrace(file,constants=''){
 const source=fs.readFileSync(new URL(file,import.meta.url),'utf8');
 const ast=parse(source,{sourceType:'module',plugins:['jsx']});
 const fn=ast.program.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='generateSteps');
 const context=vm.createContext({Math,Map,Set,JSON});
 vm.runInContext(constants+'\n'+source.slice(fn.start,fn.end),context);
 return (...args)=>{context.args=args;return vm.runInContext('generateSteps(...args)',context,{timeout:1000});};
}

test('reverse-list trace terminates after visiting the final node',()=>{
 const trace=localTrace('../problems/Problem206/ReverseLinkedListVisualizer.jsx');
 for(const e of suites['reverse-linked-list']){
  const frames=trace(e.values);assert.equal(frames.at(-1).phase,'done');assert.ok(frames.length<=4*e.values.length+2);
 }
});
test('LFU zero capacity ignores writes and still returns misses',()=>{
 const trace=localTrace('../problems/Problem460/LFUCacheVisualizer.jsx');
 const frames=trace(0,[{type:'put',key:8,val:19},{type:'get',key:8}]);
 assert.equal(frames.find(f=>f.phase==='miss').result,-1);
});
test('reconstructed-digit traces match the authored number-word multiset',()=>{
 const trace=localTrace('../problems/Problem423/Problem423Visualizer.jsx');
 const expected=['02369','777','0','159'];
 suites['reconstruct-original-digits'].forEach((e,i)=>assert.equal(trace(e.s).at(-1).result,expected[i],e.label));
});
