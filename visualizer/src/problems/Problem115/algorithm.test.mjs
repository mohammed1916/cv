import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSubsequenceStory, subsequenceCellAt } from './algorithm.js';
test('prefix counts agree with exhaustive position choices',()=>{
  const count=(s,t)=>{let n=0;for(let mask=0;mask<2**s.length;mask++){let candidate='';for(let i=0;i<s.length;i++)if(mask&(1<<i))candidate+=s[i];if(candidate===t)n++;}return String(n);};
  for(const s of ['','a','aaa','abab','rabbbit','babgbag'])for(const t of ['','a','ab','rabbit','bag','aaaa'])assert.equal(buildSubsequenceStory(s,t).frames.at(-1).value,count(s,t));
});
test('earlier cells do not reveal future writes; skip and use have separate frames',()=>{
  const story=buildSubsequenceStory('aaa','aa');
  assert.equal(subsequenceCellAt(story,0,3,2),'0');
  const index=story.frames.findIndex(f=>f.i===3&&f.j===2&&f.phase==='skip');
  assert.equal(subsequenceCellAt(story,index,3,2),'1');
  assert.equal(subsequenceCellAt(story,index+2,3,2),'3');
  assert.equal(story.values[3][2],'3');
  assert.equal(buildSubsequenceStory('a'.repeat(64),'a'.repeat(32)).frames.at(-1).value,'1832624140942590534');
  assert.throws(()=>buildSubsequenceStory('a'.repeat(65),''));
});

// ─── Statement contract tests (parseInput / buildTrace / python) ───
import { parseInput, buildTrace, code, python } from './algorithm.js'

test('statement examples and boundary presets', () => {
  assert.equal(buildTrace(parseInput('{"s":"rabbbit","t":"rabbit"}')).result, 3)
  assert.equal(buildTrace(parseInput('{"s":"babgbag","t":"bag"}')).result, 5)
  assert.equal(buildTrace(parseInput('{"s":"mmmmmm","t":"mmm"}')).result, 20)
  assert.equal(buildTrace(parseInput('{"s":"","t":""}')).result, 1)
  assert.equal(buildTrace(parseInput('{"s":"","t":"a"}')).result, 0)
})

test('validation rejects malformed input with clear errors', () => {
  assert.throws(() => parseInput('["a","b"]'), /string fields "s" and "t"/)
  assert.throws(() => parseInput('{"s":"a1","t":"a"}'), /English letters only/)
  assert.throws(() => parseInput('{"s":"' + 'a'.repeat(31) + '","t":""}'), /at most 30/)
})

test('every frame points at a pseudocode line and the python export is present', () => {
  const trace = buildTrace(parseInput('{"s":"rabbbit","t":"rabbit"}'))
  for (const f of trace.frames) assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
  assert.match(python, /def distinct_subsequences\(s, t\):/)
})

test('seeded random strings match a brute-force oracle over all index subsets', () => {
  let seed = 115
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const brute = (s, t) => {
    let count = 0
    for (let mask = 0; mask < 1 << s.length; mask++) {
      let picked = ''
      for (let k = 0; k < s.length; k++) if (mask & (1 << k)) picked += s[k]
      if (picked === t) count++
    }
    return count
  }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let k = 0; k < 150; k++) {
    const s = word(rnd(13)), t = word(rnd(7))
    assert.equal(buildTrace(parseInput(JSON.stringify({ s, t }))).result, brute(s, t), `${s} / ${t}`)
  }
})
