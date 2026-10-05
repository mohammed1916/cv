import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeCatalog } from './catalogCoverage.js';
test('legacy folder numbers cannot substitute an unrelated algorithm',()=>{
 const route={number:'577',title:'Employee Free Time',slug:'employee-free-time',folder:'Problem577'};
 const result=mergeCatalog([{number:'577',title:'Employee Bonus',slug:'employee-bonus'},{number:'759',title:'Employee Free Time',slug:'employee-free-time'}],[route]);
 assert.equal(result[0].implemented,false);
 assert.equal(result[1].implemented,true);
 assert.equal(result[1].number,'759');
 assert.equal(result[1].folder,'Problem577');
});
test('a unique title can resolve a legacy slug while preserving working bookmarks',()=>{
 const [result]=mergeCatalog([{number:'578',title:'Get Highest Answer Rate Question',slug:'get-highest-answer-rate-question'}],[{number:'578',title:'Get Highest Answer Rate Question',slug:'highest-answer-rate'}]);
 assert.equal(result.implemented,true);assert.equal(result.slug,'highest-answer-rate');
});
test('ambiguous titles cannot silently choose the wrong route',()=>{
 assert.equal(mergeCatalog([{number:'7',title:'Same',slug:'canonical'}],[{title:'Same',slug:'one'},{title:'Same',slug:'two'}])[0].implemented,false);
});
