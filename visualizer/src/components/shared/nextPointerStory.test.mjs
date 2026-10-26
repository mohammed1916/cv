import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNextPointerStory } from './nextPointerStory.js';
test('perfect and sparse next chains match independent level order',()=>{
  for(const [mode,inputs] of [['perfect',['[]','[1]','[1,2,3,4,5,6,7]','[1,1,1]']],['sparse',['[]','[1,null,2,3]','[1,2,3,4,5,null,7]','[1,1,1,null,1,1]']]])for(const input of inputs){
    const story=buildNextPointerStory(input,mode),rows=new Map();
    for(const n of story.nodes){const y=story.positions.get(n.id).y;if(!rows.has(y))rows.set(y,[]);rows.get(y).push(n.id);}
    for(const ids of rows.values())ids.forEach((id,i)=>assert.equal(story.frames.at(-1).next[id],ids[i+1]??null));
    assert.ok(Object.values(story.frames[0].next).every(id=>id===null));
  }
});
test('perfect-tree contract rejects gaps and unequal leaf depths; sparse mode bridges gaps',()=>{
  assert.throws(()=>buildNextPointerStory('[1,2]','perfect'),/perfect tree/);
  assert.throws(()=>buildNextPointerStory('[1,2,3,4,5]','perfect'),/same depth/);
  const story=buildNextPointerStory('[1,2,3,4,null,null,7]','sparse');
  const from=story.nodes.find(n=>n.val===4).id,to=story.nodes.find(n=>n.val===7).id;
  assert.equal(story.frames.at(-1).next[from],to);
  assert.ok(story.frames.some(f=>f.phase==='append'&&f.changed.from===from&&f.changed.to===to));
});
