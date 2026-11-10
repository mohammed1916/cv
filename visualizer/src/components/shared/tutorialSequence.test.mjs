import test from 'node:test';
import assert from 'node:assert/strict';
import {buildTutorialSequence,tutorialPosition} from './tutorialSequence.js';
import {buildTrace as servers,buildAlternativeTrace,code as serverCode,alternativeCode} from '../../problems/Problem1606/algorithm.js';
import {serverTutorial} from '../../problems/Problem1606/tutorial.js';
import {buildTrace as trees,code as treeCode} from '../../problems/Problem100/algorithm.js';
import {sameTreeTutorial} from '../../problems/Problem100/tutorial.js';

for (const [name,build,adapter,code,input] of [
  ['server list',servers,serverTutorial,serverCode,{k:2,arrival:[1,2,4,8],load:[5,2,1,3]}],
  ['server heap',buildAlternativeTrace,serverTutorial,alternativeCode,{k:2,arrival:[1,2,4,8],load:[5,2,1,3]}],
  ['matching trees',trees,sameTreeTutorial,treeCode,{p:[7,3,9,null,4],q:[7,3,9,null,4]}],
  ['different trees',trees,sameTreeTutorial,treeCode,{p:[7,3],q:[7,null,3]}],
  ['empty trees',trees,sameTreeTutorial,treeCode,{p:[],q:[]}],
]) test(`${name}: separate reason/code/effect beats retain trace identity in both directions`,()=>{
  const run=build(input), saved=structuredClone(run);
  for(const mode of ['steps','why']) {
    const sequence=buildTutorialSequence(run,adapter,mode);
    const kinds=mode==='why'?['reason','code','impact']:['code','impact'];
    assert.equal(sequence.length,run.frames.length*kinds.length);
    for(let i=0;i<run.frames.length;i++) {
      const start=tutorialPosition(sequence,i);
      assert.deepEqual(sequence.slice(start,start+kinds.length).map(b=>b.kind),kinds);
      assert.equal(sequence[start].frameIndex,i);
    }
    for(const beat of [...sequence,...sequence.toReversed()]) {
      const frame=run.frames[beat.frameIndex];
      assert.ok(code.some(line=>line.line===frame.activeLine));
      assert.ok(beat.scene.reason && beat.scene.action);
      assert.ok(beat.scene.focus.length<=2);
    }
  }
  assert.deepEqual(run,saved);
  assert.deepEqual(buildTutorialSequence(run,adapter,'off'),[]);
});
