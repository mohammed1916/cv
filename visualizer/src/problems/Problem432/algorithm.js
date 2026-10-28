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

export function parseInput(input) {
  const operations = typeof input === 'string' ? JSON.parse(input) : input
  if (!Array.isArray(operations) || operations.length > 200) throw new Error('Use at most 200 operations for visualization.')
  const counts = new Map()
  for (const operation of operations) {
    if (!Array.isArray(operation)) throw new Error('Each operation must be an array.')
    const [type, key] = operation
    if (type === 'inc' || type === 'dec') {
      if (operation.length !== 2 || typeof key !== 'string' || !/^[a-z]{1,10}$/.test(key)) throw new Error('Use a lowercase key of 1–10 letters.')
      const old = counts.get(key) || 0
      if (type === 'dec' && !old) throw new Error('Cannot decrement an absent key.')
      counts.set(key, old + (type === 'inc' ? 1 : -1))
    } else if (!['getMinKey', 'getMaxKey'].includes(type) || operation.length !== 1) throw new Error('Unknown operation or extra arguments.')
  }
  return operations
}
export function buildTrace(input) {
  const operations = parseInput(input)
  const frames = generateSteps(operations).map((frame, i, all) => ({ ...frame, phase: i === 0 ? 'start' : i === all.length - 1 ? 'done' : 'operation' }))
  return { input: operations, frames, result: frames.filter(f => Object.hasOwn(f, 'result')).map(f => f.result) }
}
export const code = [
  'INITIALIZE linked count buckets and a key-to-bucket map',
  'ON inc(key)',
  '    FIND or create the next count bucket',
  '    MOVE key there; remove its old bucket if empty',
  'ON dec(key)',
  '    FIND the current bucket',
  '    MOVE key to the preceding count, or delete a zero-count key',
  '    REMOVE its old bucket if empty',
  'ON getMinKey()',
  '    READ the first count bucket',
  '    RETURN any key in it, or an empty string',
  'ON getMaxKey()',
  '    RETURN any key in the last count bucket, or an empty string',
  'FINISH the operation sequence',
].map((text, index) => ({ line: index + 1, text }))

export const python = `class Bucket:
    def __init__(self, count):
        self.count = count
        self.keys = set()
        self.prev = self.next = None

class AllOne:
    def __init__(self):
        self.head, self.tail = Bucket(0), Bucket(float('inf'))
        self.head.next, self.tail.prev = self.tail, self.head
        self.location = {}

    def _insert(self, previous, count):
        bucket = Bucket(count)
        bucket.prev, bucket.next = previous, previous.next
        previous.next.prev = bucket
        previous.next = bucket
        return bucket

    def _remove_empty(self, bucket):
        if not bucket.keys:
            bucket.prev.next = bucket.next
            bucket.next.prev = bucket.prev

    def inc(self, key):
        old = self.location.get(key, self.head)
        count = old.count + 1
        target = old.next
        if target.count != count:
            target = self._insert(old, count)
        target.keys.add(key)
        self.location[key] = target
        if old is not self.head:
            old.keys.remove(key)
            self._remove_empty(old)

    def dec(self, key):
        old = self.location[key]
        count = old.count - 1
        if count:
            target = old.prev
            if target.count != count:
                target = self._insert(old.prev, count)
            target.keys.add(key)
            self.location[key] = target
        else:
            del self.location[key]
        old.keys.remove(key)
        self._remove_empty(old)

    def getMinKey(self):
        return next(iter(self.head.next.keys), '')

    def getMaxKey(self):
        return next(iter(self.tail.prev.keys), '')`

// Compatibility for the retained legacy visual module.
export const CODE = code;
