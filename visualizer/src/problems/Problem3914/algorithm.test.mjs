import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, valueAtStep } from './algorithm.js'
// Independent shortest-path oracle: add one to any subarray, each edge costs one.
function oracle(nums) {
  const queue=[[nums,0]], seen=new Set([nums.join(',')]), ceiling=Math.max(...nums)
  for(let h=0;h<queue.length;h++) {
    const [a,d]=queue[h]
    if(a.every((v,i)=>!i||a[i-1]<=v)) return d
    for(let l=0;l<a.length;l++) for(let r=l;r<a.length;r++) {
      const b=a.map((v,i)=>v+(i>=l&&i<=r)), key=b.join(',')
      if(Math.max(...b)<=ceiling&&!seen.has(key)){seen.add(key);queue.push([b,d+1])}
    }
  }
}
test('minimum cost matches exhaustive subarray-operation search',()=>{
  for(let n=1;n<=4;n++) for(let mask=0;mask<3**n;mask++) {
    let k=mask;const nums=Array.from({length:n},()=>{const v=k%3+1;k=Math.floor(k/3);return v})
    const run=buildTrace(parseInput(JSON.stringify(nums)))
    assert.equal(run.result,oracle(nums),JSON.stringify(nums))
    const final=nums.map((_,i)=>valueAtStep(run,run.frames.at(-1),i))
    assert.ok(final.every((v,i)=>!i||final[i-1]<=v))
    assert.deepEqual(nums.map((_,i)=>valueAtStep(run,run.frames[0],i)),nums)
  }
})
