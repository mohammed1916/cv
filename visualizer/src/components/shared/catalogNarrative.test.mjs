import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { catalogNarrative, traceText } from './catalogNarrative.js';
import { auditCatalogStories } from '../../../scripts/catalog-story-audit-lib.mjs';

const root = new URL('../../problems/',import.meta.url);
const inventory = JSON.parse(fs.readFileSync(new URL('../../../docs/catalog-story-inventory.json',import.meta.url),'utf8'));

test('every implemented route has a story, boundary evidence and a reachable frame publisher', async () => {
  const audit = await auditCatalogStories();
  assert.deepEqual(audit.failures, []);
  assert.equal(audit.routes, inventory.routes);
  assert.equal(audit.covered, audit.routes);
  assert.equal(audit.routes, 1522, 'Update the route contract when adding or removing catalog entries');
});

for (const route of inventory.entries.filter(entry=>entry.kind==='catalog-story')) {
  test(`${route.number}: problem-specific guide follows ready, forward, backward and reset snapshots`, () => {
    const guide = JSON.parse(fs.readFileSync(new URL(`${route.folder}/storyGuide.json`,root),'utf8'));
    assert.equal(guide.title,route.title);
    assert.ok(guide.strategy.length >= 30);
    assert.ok(guide.edgeCases.length || guide.checks.length, 'Require algorithm boundary content, not only an input validator');
    const ready = catalogNarrative(guide,null);
    assert.match(ready.achieved,/No steps have run/);
    assert.ok(ready.edgeCases.length);
    for(const phase of [...guide.phases, 'done']) {
      const first={phase,activeLine:2,message:'Only the first prefix has been processed.',explanation:'Preserve the earlier prefix before considering the next candidate.'};
      const second={phase,activeLine:3,message:'The next candidate has now been processed.'};
      const a=catalogNarrative(guide,first);
      const b=catalogNarrative(guide,second);
      assert.equal(a.achieved,first.message);
      assert.equal(b.achieved,second.message);
      assert.equal(catalogNarrative(guide,first).achieved,first.message);
      assert.equal(a.why,first.explanation);
      assert.equal(a.chapters[a.chapter],phase.replaceAll('_',' ').replaceAll('-',' '));
      assert.equal(catalogNarrative(guide,null).achieved,ready.achieved);
    }
  });
}

test('legacy placeholders read only current-frame own properties and cannot execute code', () => {
  assert.equal(traceText('Value ${n}; previous ${prevMap[diff]}', {n:4,diff:3,prevMap:{3:1}}),'Value 4; previous 1');
  assert.equal(traceText('${constructor}',{}),'[value]');
  assert.equal(traceText('${globalThis.process.exit()}',{}),'[globalThis.process.exit()]');
  assert.equal(traceText('${futureResult}',{}),'[futureResult]');
});

test('rendered code and explicit boundary decisions remain separate from computed results', () => {
  const guide={title:'Example',goal:'Find a match',strategy:'Search earlier positions for a matching complement.',phases:['search'],checks:[{condition:'not nums',outcome:'return []'}],edgeCases:[],inputRules:[]};
  const result=catalogNarrative(guide,{phase:'search',activeLine:4},[{line:4,text:'if complement in seen:'}]);
  assert.match(result.achieved,/Current code: if complement in seen/);
  assert.doesNotMatch(result.achieved,/return \[\]/);
  assert.match(result.edgeCases[0],/when not nums/);
});

test('playback reset and invalid input hide a stale result; early returns finish the story', () => {
  const guide={title:'Lookup',goal:'Find a match',strategy:'Search earlier positions for a matching complement.',phases:['found']};
  const frame={phase:'found',message:'The pair has been found.',activeLine:8};
  assert.match(catalogNarrative(guide,frame,[],{stepIndex:-1,total:10}).achieved,/No steps/);
  assert.match(catalogNarrative(guide,frame,[],{stepIndex:4,total:0}).achieved,/No steps/);
  assert.match(catalogNarrative(guide,frame,[],{stepIndex:4,total:5}).next,/final result/);
  assert.doesNotMatch(catalogNarrative(guide,frame,[],{stepIndex:4,total:10}).next,/final result/);
});

test('newer algorithm edge-case traces retain their actual outcomes in the narrative', async () => {
  const cases=[
    [3894,[0,30,31,90,91]],
    [3908,[{n:0,x:0},{n:101,x:0},{n:101,x:1}]],
    [3909,[[1,3,1],[1,2,3],[3,2,1]]],
    [3913,['bcdf','aeea','hello']],
    [3914,[[1],[1,2,3],[3,2,1]]],
    [3915,[{nums:[5],k:1},{nums:[5,5,5],k:1},{nums:[3,5,4,2,4],k:1}]],
  ];
  for(const [id,inputs] of cases){
    const {parseInput,buildTrace}=await import(new URL(`Problem${id}/algorithm.js`,root));
    const guide=JSON.parse(fs.readFileSync(new URL(`Problem${id}/storyGuide.json`,root),'utf8'));
    for(const input of inputs){
      const run=buildTrace(parseInput(JSON.stringify(input)));
      for(const step of run.frames){
        const n=catalogNarrative(guide,step);
        assert.equal(n.achieved,step.message);
        assert.ok(n.why);
        assert.ok(n.edgeCases.length);
      }
    }
  }
});
