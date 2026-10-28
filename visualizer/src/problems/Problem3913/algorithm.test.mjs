import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'
test('official examples and nonalphabetic frequency ties',()=>{
  for(const [s,expected] of [['leetcode','leetcedo'],['aeiaaioooa','aaaaoooiie'],['baeiou','baeiou'],['uoeai','uoeai'],['uoauoa','uuooaa'],['bcdf','bcdf']]) assert.equal(buildTrace(parseInput(JSON.stringify(s))).result,expected)
})
test('consonant slots and vowel multiset survive exhaustive short inputs',()=>{
  const alphabet='ueab'
  for(let n=1;n<=5;n++) for(let mask=0;mask<4**n;mask++) {
    let k=mask;const s=Array.from({length:n},()=>{const c=alphabet[k%4];k=Math.floor(k/4);return c}).join('')
    const vowels=[...s].filter(c=>'aeiou'.includes(c))
    vowels.sort((a,b)=>[...s].filter(c=>c===b).length-[...s].filter(c=>c===a).length||s.indexOf(a)-s.indexOf(b))
    let i=0;const expected=[...s].map(c=>'aeiou'.includes(c)?vowels[i++]:c).join('')
    assert.equal(buildTrace(s).result,expected)
  }
})
