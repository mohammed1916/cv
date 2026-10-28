import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'
test('valid elements agree with direct comparisons for every ternary array through length seven', () => {
  for (let n=1;n<=7;n++) for(let mask=0;mask<3**n;mask++) {
    let k=mask; const nums=Array.from({length:n},()=>{const v=k%3+1;k=Math.floor(k/3);return v})
    const expected=nums.filter((v,i)=>nums.slice(0,i).every(x=>x<v)||nums.slice(i+1).every(x=>x<v))
    assert.deepEqual(buildTrace(parseInput(JSON.stringify(nums))).result,expected)
  }
})
test('official examples preserve duplicate endpoints',()=>{
  for(const [nums,result] of [[[1,2,4,2,3,2],[1,2,4,3,2]],[[5,5,5,5],[5,5]],[[1],[1]]]) assert.deepEqual(buildTrace(nums).result,result)
  for(const input of ['[]','[0]','[101]','[1.5]']) assert.throws(()=>parseInput(input))
})
