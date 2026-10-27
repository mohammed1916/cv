// Union-by-size and path compression shared by explicit connectivity stories.
// Union-by-size and path halving. Every find and union is recorded in `ops` so a story can show the
// parent chain that was walked, the nodes path compression re-pointed, and the merge decision.
export class AuthoredUnionFind {
 constructor(n){this.parent=Array.from({length:n},(_,i)=>i);this.size=Array(n).fill(1);this.count=n;this.ops=[];}
 // Non-mutating, unlogged root lookup for display code.
 rootOf(x){while(this.parent[x]!==x)x=this.parent[x];return x;}
 find(x){
  const start=x,chain=[x],before=[...this.parent];
  for(let r=x;this.parent[r]!==r;){r=this.parent[r];chain.push(r);}
  while(this.parent[x]!==x){this.parent[x]=this.parent[this.parent[x]];x=this.parent[x];}
  const root=chain[chain.length-1];
  const repointed=chain.filter(node=>this.parent[node]!==before[node]).map(node=>({node,from:before[node],to:this.parent[node]}));
  this.ops.push({type:'find',node:start,chain,root,repointed});
  return x;
 }
 union(a,b){
  const first=a,second=b;a=this.find(a);b=this.find(b);
  const rootA=a,rootB=b;
  if(a===b){this.ops.push({type:'union',a:first,b:second,rootA,rootB,merged:false});return false;}
  if(this.size[a]<this.size[b])[a,b]=[b,a];
  this.ops.push({type:'union',a:first,b:second,rootA,rootB,merged:true,winner:a,loser:b,winnerSize:this.size[a],loserSize:this.size[b]});
  this.parent[b]=a;this.size[a]+=this.size[b];this.count--;return true;
 }
 takeOps(){const ops=this.ops;this.ops=[];return ops;}
 groups(labels=this.parent.map((_,i)=>i)){const groups=new Map();for(let i=0;i<this.parent.length;i++){const root=this.rootOf(i);if(!groups.has(root))groups.set(root,[]);groups.get(root).push(labels[i]);}return [...groups].map(([root,members])=>[labels[root],members.length,members.join(', ')]);}
}
// The parent/forest view stays readable up to this many elements; larger sets keep only the table.
export const DSU_VIEW_LIMIT=48;
export const dsuView=(dsu,labels)=>{const ops=dsu.takeOps();return dsu.parent.length>DSU_VIEW_LIMIT?{}:{dsu:{parent:[...dsu.parent],size:[...dsu.size],labels:(labels??dsu.parent.map((_,i)=>i)).map(String),ops}};};
export const unionState=(dsu,labels)=>({
 table:dsu.groups(labels),tableHeaders:['Representative','Size','Members'],
 ...dsuView(dsu,labels),
});
export const unionPython=`class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n
        self.count = n

    def find(self, node):
        while self.parent[node] != node:
            self.parent[node] = self.parent[self.parent[node]]
            node = self.parent[node]
        return node

    def union(self, first, second):
        first, second = self.find(first), self.find(second)
        if first == second:
            return False
        if self.size[first] < self.size[second]:
            first, second = second, first
        self.parent[second] = first
        self.size[first] += self.size[second]
        self.count -= 1
        return True

`;
