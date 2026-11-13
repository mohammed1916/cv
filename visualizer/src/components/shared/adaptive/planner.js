// Pure presentation planning. Reads are explicit: equal snapshots cannot reveal a comparison.
export function equal(a, b) {
  if (Object.is(a,b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keys=Object.keys(a);
  return keys.length===Object.keys(b).length && keys.every(key=>Object.hasOwn(b,key)&&equal(a[key],b[key]));
}
export function planVisuals(visuals, context) {
  const ids=new Set();
  const plans=visuals.map(visual=>{
    if(ids.has(visual.id)) throw new Error(`Duplicate visual ID: ${visual.id}`);
    ids.add(visual.id);
    const data=visual.select(context) || {};
    const previousData=context.previousStep ? visual.select({...context,step:context.previousStep}) || {} : {};
    const reads=(visual.reads?.(context) || []).map(String);
    // An initial snapshot is a baseline, not evidence that every graph node
    // or DP cell was just changed. Explicit reads identify the first focus.
    const changedKeys=context.previousStep
      ? [...new Set([...Object.keys(data),...Object.keys(previousData)])].filter(key=>Object.hasOwn(data,key)!==Object.hasOwn(previousData,key) || !equal(data[key],previousData[key]))
      : [];
    const focusKeys=[...new Set([...reads,...changedKeys])];
    return {id:visual.id,data,previousData,changedKeys,reads,focusKeys,visible:focusKeys.length>0 || !!visual.active?.(context)};
  });
  // Dependencies are registered by the visual, so adding a tracker never edits a scene adapter.
  let added=true;
  while(added) {
    added=false;
    visuals.forEach((visual,index)=>{
      if(!plans[index].visible) return;
      for(const id of visual.dependsOn || []) {
        const dependency=plans.find(plan=>plan.id===id);
        if(!dependency) throw new Error(`Unknown visual dependency: ${id}`);
        if(!dependency.visible) {dependency.visible=true; added=true;}
      }
    });
  }
  // An unchanged unannotated frame gets context, not an invented mutation.
  if(!plans.some(plan=>plan.visible)) plans.forEach(plan=>{plan.visible=true;});
  return plans;
}
export function buildAdaptiveSequence(run, explain, mode) {
  if(!run) return [];
  const seen=new Set();
  return run.frames.flatMap((step,frameIndex)=>{
    const lesson=explain?.({run,step,previousStep:run.frames[frameIndex-1]});
    const key=lesson?.reasonKey ?? step.kind ?? step.phase;
    const effect={frameIndex,kind:'impact',lesson};
    if(mode==='why' && lesson?.reason && !seen.has(key)) {
      seen.add(key);
      return [{frameIndex,kind:'reason',lesson},effect];
    }
    return [effect];
  });
}

// Transfers require an authored semantic declaration and a real item change.
// A dependency alone never implies that an object moved.
export function planTransfer(visuals, context, plans) {
  if (!context.previousStep) return null;
  for (const visual of visuals) {
    const transfer=visual.transfer?.(context);
    if (!transfer) continue;
    const source=plans.find(plan=>plan.id===transfer.from);
    const target=plans.find(plan=>plan.id===transfer.to);
    const changed=plans.find(plan=>plan.id===transfer.changedVisual);
    const item=String(transfer.item);
    if (!source?.visible || !target?.visible || !changed?.changedKeys.includes(item)) continue;
    const before=Object.hasOwn(changed.previousData,item);
    const after=Object.hasOwn(changed.data,item);
    if ((transfer.operation==='insert' && !before && after) || (transfer.operation==='remove' && before && !after)) {
      return {...transfer,item};
    }
  }
  return null;
}
