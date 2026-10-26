// Union-by-size and path compression shared by explicit connectivity stories.
export class AuthoredUnionFind {
 constructor(n){this.parent=Array.from({length:n},(_,i)=>i);this.size=Array(n).fill(1);this.count=n;}
 find(x){while(this.parent[x]!==x){this.parent[x]=this.parent[this.parent[x]];x=this.parent[x];}return x;}
 union(a,b){a=this.find(a);b=this.find(b);if(a===b)return false;if(this.size[a]<this.size[b])[a,b]=[b,a];this.parent[b]=a;this.size[a]+=this.size[b];this.count--;return true;}
 groups(labels=this.parent.map((_,i)=>i)){const groups=new Map();for(let i=0;i<this.parent.length;i++){const root=this.find(i);if(!groups.has(root))groups.set(root,[]);groups.get(root).push(labels[i]);}return [...groups].map(([root,members])=>[labels[root],members.length,members.join(', ')]);}
}
export const unionState=(dsu,labels)=>({table:dsu.groups(labels),tableHeaders:['Representative','Size','Members']});
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
