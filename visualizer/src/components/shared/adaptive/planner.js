// Pure presentation planning. Reads are explicit: equal snapshots cannot reveal a comparison.
export function equal(a, b) {
  if (Object.is(a,b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
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
    const changedKeys=[...new Set([...Object.keys(data),...Object.keys(previousData)])].filter(key=>!equal(data[key],previousData[key]));
    const reads=(visual.reads?.(context) || []).map(String);
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
