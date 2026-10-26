import test from 'node:test';
import assert from 'node:assert/strict';
import {reconstructTreeStory} from './reconstructTreeStory.js';
test('preorder and postorder rebuild the same tree with accurate creation phases',()=>{
  for(const order of ['preorder','postorder']){
    const traversal=order==='preorder'?[3,9,20,15,7]:[9,15,7,20,3];
    const story=reconstructTreeStory('[9,3,15,20,7]',JSON.stringify(traversal),order);
    const ino=[],pre=[],post=[];
    function walk(n){if(!n)return;pre.push(n.val);walk(n.left);ino.push(n.val);walk(n.right);post.push(n.val);assert.ok(n.createdAt<n.returnedAt);}
    walk(story.root);assert.deepEqual(ino,story.inorder);assert.deepEqual(order==='preorder'?pre:post,traversal);
    for(const n of story.nodes)assert.equal(story.frames[n.createdAt].activeLine,order==='preorder'?5:4);
  }
});
test('empty, duplicate, inconsistent and invalid traversals',()=>{
  assert.equal(reconstructTreeStory('[]','[]').root,null);
  for(const pair of [['[1,1]','[1,1]'],['[1]','[2]'],['[1,2,3]','[2,3,1]'],['[null]','[null]']])assert.throws(()=>reconstructTreeStory(...pair));
});
