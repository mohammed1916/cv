import test from 'node:test';
import assert from 'node:assert/strict';
import {hasProAccess,isFreeProblem,accessLabel} from './policy.js';
test('beta Pro requires sign-in, even with stale paid status or a debug flag',()=>{
  assert.equal(hasProAccess({user:null,realPro:true,debugPro:true},true),false);
  assert.equal(hasProAccess({user:{uid:'signed-in'},realPro:false},true),true);
  assert.equal(hasProAccess({user:null},true),false);
});
test('paid mode still requires a paid entitlement or explicit development override',()=>{
  assert.equal(hasProAccess({user:{uid:'signed-in'}},false),false);
  assert.equal(hasProAccess({user:{uid:'signed-in'},realPro:true},false),true);
});
test('free problems remain available and beta labels distinguish locked and unlocked Pro',()=>{
  const free={implemented:true,difficulty:'Easy'};
  const pro={implemented:true,difficulty:'Hard'};
  assert.equal(isFreeProblem(free),true);
  assert.equal(isFreeProblem(pro),false);
  assert.equal(accessLabel(free,false),'Free');
  assert.equal(accessLabel(pro,false),'Free beta · Sign in');
  assert.equal(accessLabel(pro,true),'Beta · Unlocked');
});
