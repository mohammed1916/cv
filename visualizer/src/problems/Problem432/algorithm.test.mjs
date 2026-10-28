import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'
test('updates and extreme queries match an independent count-map oracle',()=>{
  let seed=432
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed}
  for(let trial=0;trial<50;trial++) {
    const counts=new Map(), operations=[], expected=[]
    for(let i=0;i<120;i++) {
      const key=['a','b','c','d'][rand()%4], type=rand()%4
      if(type===0||type===1&&!(counts.get(key)>0)) {operations.push(['inc',key]);counts.set(key,(counts.get(key)||0)+1)}
      else if(type===1) {operations.push(['dec',key]);const n=counts.get(key)-1;n?counts.set(key,n):counts.delete(key)}
      else {
        operations.push([type===2?'getMinKey':'getMaxKey'])
        const extreme=(type===2?Math.min:Math.max)(...counts.values())
        expected.push(counts.size?[...counts].filter(([,n])=>n===extreme).map(([k])=>k):[''])
      }
    }
    const run=buildTrace(operations)
    assert.equal(run.result.length,expected.length)
    run.result.forEach((key,i)=>assert.ok(expected[i].includes(key)))
    assert.deepEqual([...run.frames.at(-1).map].sort(),[...counts].sort())
  }
})
test('empty queries, ties, deletion, input validation and snapshot isolation',()=>{
 const run=buildTrace([['getMinKey'],['inc','a'],['inc','b'],['getMaxKey'],['dec','a'],['dec','b'],['getMaxKey']])
 assert.equal(run.result[0],'');assert.ok(['a','b'].includes(run.result[1]));assert.equal(run.result[2],'')
 assert.equal(run.frames[2].map.get('a'),1);assert.equal(run.frames[2].map.has('b'),false)
 for(const input of ['{}','[["dec","a"]]','[["inc","A"]]','[["getMinKey",1]]','[["bad"]]']) assert.throws(()=>parseInput(input))
})
