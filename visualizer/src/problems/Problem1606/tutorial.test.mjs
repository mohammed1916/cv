import test from 'node:test';
import assert from 'node:assert/strict';
import {buildTrace,buildAlternativeTrace} from './algorithm.js';
import {serverTutorial} from './tutorial.js';
import {tutorialHeapModel} from '../../components/shared/tutorialHeapModel.js';
test('both approaches provide meaningful focus and reasons for arbitrary valid traces',()=>{
  for (const build of [buildTrace,buildAlternativeTrace]) {
    for (const input of [{k:1,arrival:[1,2,5],load:[3,1,2]},{k:6,arrival:[1,3,5,7,9,11,16,20],load:[8,4,2,8,2,3,1,2]}]) {
      const run=build(input);
      const originals=JSON.stringify(run);
      for (const step of [...run.frames,...run.frames.toReversed()]) {
        const scene=serverTutorial({run,step});
        assert.ok(scene.reason.length>20);assert.ok(scene.action);
        assert.ok(scene.focus.length>=1 && scene.focus.length<=2);
        assert.ok(scene.focus.every(id=>['request','free','busy','servers','timeline','result'].includes(id)));
        assert.ok(Object.values(scene.variables).every(v=>v!==undefined && !String(v).includes('undefined')));
      }
      assert.equal(JSON.stringify(run),originals,'tutorial must not mutate playback');
    }
  }
});
test('heap focus retains involved indices and actual parents without renumbering',()=>{
  const items=Array.from({length:31},(_,i)=>String(i));
  const model=tutorialHeapModel(items,[{type:'push',end:14,steps:[{index:30,parent:14,swap:true}]}]);
  assert.ok(model.hidden>0);
  assert.ok(model.nodes.some(n=>n.index===30));
  assert.equal(model.nodes.find(n=>n.index===30).parent,14);
  assert.ok(model.nodes.some(n=>n.index===14 && n.active));
  assert.equal(tutorialHeapModel([],[]).nodes.length,0);
  assert.equal(tutorialHeapModel(['1'],[{type:'pop',end:-1,steps:[]}]).nodes[0].index,0);
});
