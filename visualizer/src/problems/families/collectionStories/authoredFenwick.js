// Fenwick (binary indexed) tree that logs every update and query so a story can show the bit jumps.
// mode 'sum' adds deltas; mode 'max' keeps prefix maxima. Cells are 1-indexed like the textbook version.
export class AuthoredFenwick {
 constructor(n,mode='sum'){this.n=n;this.mode=mode;this.tree=Array(n+1).fill(0);this.ops=[];}
 update(index,value){
  const chain=[];
  for(let i=index;i<=this.n;i+=i&-i){chain.push(i);this.tree[i]=this.mode==='max'?Math.max(this.tree[i],value):this.tree[i]+value;}
  this.ops.push({type:'update',index,value,chain,mode:this.mode});
 }
 query(index){
  const chain=[],parts=[];let total=0;
  for(let i=index;i>0;i-=i&-i){chain.push(i);parts.push({cell:i,value:this.tree[i]});total=this.mode==='max'?Math.max(total,this.tree[i]):total+this.tree[i];}
  this.ops.push({type:'query',index,chain,parts,total,mode:this.mode});
  return total;
 }
 takeOps(){const ops=this.ops;this.ops=[];return ops;}
}
// The cell array stays readable up to this many cells; larger trees keep only their table.
export const FENWICK_VIEW_LIMIT=48;
export const fenwickView=(f,title)=>{const ops=f.takeOps();return f.n>FENWICK_VIEW_LIMIT?{}:{fenwick:{tree:f.tree.slice(1),ops,title,mode:f.mode}};};
