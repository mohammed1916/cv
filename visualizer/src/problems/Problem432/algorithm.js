// Doubly linked count buckets keep both extreme counts available in O(1).
export function generateSteps(operations) {
  const head={count:0,keys:new Set()},tail={count:Infinity,keys:new Set()};
  head.next=tail;tail.prev=head;
  const locations=new Map(),steps=[];
  const insertAfter=(previous,count)=>{
    const bucket={count,keys:new Set(),prev:previous,next:previous.next};
    previous.next.prev=bucket;previous.next=bucket;return bucket;
  };
  const snapshot=(activeLine,message,extra={})=>{
    const counts=new Map([...locations].map(([key,bucket])=>[key,bucket.count]));
    steps.push({activeLine,message,map:counts,array:[...counts.keys()],...extra});
  };
  snapshot(1,'Start with no keys and two sentinel count buckets.');
  for(const operation of operations){
    if(!Array.isArray(operation))throw new Error('Use ["inc", "key"], ["dec", "key"], ["getMinKey"], or ["getMaxKey"].');
    const [type,key]=operation;
    if(type==='inc'||type==='dec'){
      if(typeof key!=='string'||!key)throw new Error('A count update needs a nonempty key.');
      const old=locations.get(key);
      if(type==='dec'&&!old)throw new Error('Cannot decrement an absent key.');
      const nextCount=(old?.count||0)+(type==='inc'?1:-1);
      if(nextCount>0){
        let destination;
        if(type==='inc'){
          const previous=old||head;
          destination=previous.next.count===nextCount?previous.next:insertAfter(previous,nextCount);
        }else destination=old.prev.count===nextCount?old.prev:insertAfter(old.prev,nextCount);
        destination.keys.add(key);locations.set(key,destination);
      }else locations.delete(key);
      if(old){old.keys.delete(key);if(!old.keys.size){old.prev.next=old.next;old.next.prev=old.prev;}}
      snapshot(type==='inc'?4:8,`${type}(${key}): ${nextCount?`move to count ${nextCount}`:'remove the zero-count key'}.`,{currentOp:`${type}(${key})`});
    }else if(type==='getMinKey'||type==='getMaxKey'){
      const bucket=type==='getMinKey'?head.next:tail.prev;
      const result=bucket===head||bucket===tail?'':bucket.keys.values().next().value;
      snapshot(type==='getMinKey'?11:13,`${type}(): ${result?`return ${result} at count ${bucket.count}`:'return an empty string'}.`,{result,currentOp:`${type}()`});
    }else throw new Error(`Unsupported operation: ${type}`);
  }
  snapshot(14,'All count updates and extreme-key queries are complete.',{done:true});
  return steps;
}

export const CODE = [
 'class AllOne:  # linked count buckets + key-to-bucket map',
 '    def inc(self, key):',
 '        old = self.location.get(key, self.head)',
 '        move_key(key, old, bucket_after(old, old.count + 1))',
 '        remove_if_empty(old)',
 '    def dec(self, key):',
 '        old = self.location[key]',
 '        move_or_delete(key, old, old.count - 1)',
 '        remove_if_empty(old)',
 '    def getMinKey(self):',
 '        return any_key(self.head.next)  # empty sentinel -> ""',
 '    def getMaxKey(self):',
 '        return any_key(self.tail.prev)  # empty sentinel -> ""',
 '    # Neighbor buckets and extreme queries take O(1).',
].map((text,index)=>({line:index+1,text}));
