// Shared priority queue for explicit authored state-space searches.
export class AuthoredMinHeap {
  constructor(compare=(a,b)=>a[0]-b[0], onStep=null){this.data=[];this.compare=compare;this.onStep=onStep;}
  emit(type, indices=[]){if(this.onStep)this.onStep({type,indices:[...indices],heap:[...this.data]});}
  get size(){return this.data.length;}
  push(value){const a=this.data;a.push(value);let i=a.length-1;this.emit('append',[i]);while(i>0){const p=Math.floor((i-1)/2);this.emit('compare',[p,i]);if(this.compare(a[p],a[i])<=0)break;[a[p],a[i]]=[a[i],a[p]];this.emit('swap',[p,i]);i=p;}}
  pop(){const a=this.data;if(!a.length)return undefined;const result=a[0],last=a.pop();if(a.length){a[0]=last;this.emit('remove',[0]);let i=0;while(true){let best=i;for(const child of [2*i+1,2*i+2])if(child<a.length){this.emit('compare',[best,child]);if(this.compare(a[child],a[best])<0)best=child;}if(best===i)break;[a[i],a[best]]=[a[best],a[i]];this.emit('swap',[i,best]);i=best;}}else this.emit('remove');return result;}
}
