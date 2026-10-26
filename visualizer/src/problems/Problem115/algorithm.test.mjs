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
