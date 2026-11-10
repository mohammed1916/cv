import {heapLayout} from './heapModel.js';
// Retain original indices and true parent edges. Never re-heapify a cropped view.
export function tutorialHeapModel(items, ops = []) {
  const nodes = heapLayout(items.length);
  const active = new Set();
  const op = ops.at(-1);
  for (const index of [op?.end, ...(op?.steps || []).flatMap(s => [s.index,s.parent,s.child])]) {
    if (Number.isInteger(index) && index >= 0 && index < items.length) active.add(index);
  }
  if (!active.size && items.length) active.add(0);
  const keep = new Set(active);
  for (const index of active) {
    if (index > 0) keep.add((index-1)>>1);
    for (const child of [index*2+1,index*2+2]) if (child<items.length) keep.add(child);
  }
  const visible = nodes.filter(n=>keep.has(n.index)).map(n=>({...n,x:n.x*64,y:n.depth*70,active:active.has(n.index)}));
  const xs=visible.map(n=>n.x),ys=visible.map(n=>n.y);
  const minX=xs.length?Math.min(...xs)-40:0,minY=ys.length?Math.min(...ys)-40:0;
  return {nodes:visible,hidden:items.length-visible.length,viewBox:`${minX} ${minY} ${xs.length?Math.max(140,Math.max(...xs)-minX+40):140} ${ys.length?Math.max(140,Math.max(...ys)-minY+40):140}`};
}
