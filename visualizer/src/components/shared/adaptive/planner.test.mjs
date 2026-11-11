import test from 'node:test';
import assert from 'node:assert/strict';
import {planVisuals,buildAdaptiveSequence,equal} from './planner.js';

test('new tracker joins existing modes without changing an adapter',()=>{
 const run={frames:[{phase:'compare',activeLine:3,snapshot:{dp:[0,8],width:2}},{phase:'compare',activeLine:3,snapshot:{dp:[0,8],width:4}}]};
 const visuals=[{id:'dp',select:({step})=>({cost:step.snapshot.dp[1]}),reads:()=>['cost']}];
 const tracker={id:'variables',select:({step})=>({width:step.snapshot.width})};
 const context={run,step:run.frames[1],previousStep:run.frames[0]};
 const before=structuredClone(run);
 const plans=planVisuals([...visuals,tracker],context);
 assert.deepEqual(plans[0].changedKeys,[]);
 assert.deepEqual(plans[0].reads,['cost']);
 assert.deepEqual(plans[1].changedKeys,['width']);
 assert.equal(plans[1].previousData.width,2);
 assert.ok(plans.every(plan=>plan.visible));
 assert.deepEqual(run,before);
 for(const mode of ['off','steps','why']) assert.equal(buildAdaptiveSequence(run,undefined,mode).length,2);
});
test('reads preserve unchanged comparisons; unrelated visuals are omitted',()=>{
 const context={step:{a:4,b:8},previousStep:{a:4,b:8}};
 const plans=planVisuals([{id:'comparison',select:({step})=>({a:step.a}),reads:()=>['a']},{id:'unrelated',select:({step})=>({b:step.b})}],context);
 assert.equal(plans[0].visible,true);assert.equal(plans[1].visible,false);
});
test('dependencies resolve transitively and cycles terminate',()=>{
 const plans=planVisuals([{id:'a',select:()=>({}),active:()=>true,dependsOn:['b']},{id:'b',select:()=>({}),dependsOn:['a','c']},{id:'c',select:()=>({})}],{step:{},previousStep:{}});
 assert.ok(plans.every(plan=>plan.visible));
 assert.throws(()=>planVisuals([{id:'x',select:()=>({}),active:()=>true,dependsOn:['missing']}],{step:{}}),/Unknown visual/);
});
test('reason first introduces each concept once; step mode is one frame per operation',()=>{
 const run={frames:[{phase:'compare'},{phase:'write'},{phase:'compare'}]};
 const explain=({step})=>({reason:`Why ${step.phase}`});
 assert.deepEqual(buildAdaptiveSequence(run,explain,'steps').map(x=>x.frameIndex),[0,1,2]);
 assert.deepEqual(buildAdaptiveSequence(run,explain,'why').map(x=>[x.kind,x.frameIndex]),[['reason',0],['impact',0],['reason',1],['impact',1],['impact',2]]);
});
test('backward planning and removal use actual snapshots, including special numeric values',()=>{
 assert.ok(equal({a:Infinity,b:NaN},{a:Infinity,b:NaN}));
 assert.ok(!equal({a:Infinity},{a:null}));
 const descriptor={id:'queue',select:({step})=>step};
 const plan=planVisuals([descriptor],{step:{b:0},previousStep:{a:0,b:1}})[0];
 assert.deepEqual(plan.changedKeys,['b','a']);
 assert.deepEqual(planVisuals([descriptor],{step:{a:0,b:1},previousStep:{b:0}})[0].changedKeys,['a','b']);
});
