import LinkedListGraph from './LinkedListGraph';

// Reuse the same stable-ID node renderer for both link directions.
export default function DoublyLinkedListState({nodes=[],headId=null,activeIds=[]}) {
  const pointers=headId===null?[]:[{label:'head',nodeId:headId}];
  return <section aria-label="Doubly linked list state">
    <p>Forward links follow next; reverse links follow previous. Node IDs stay the same in both views.</p>
    <LinkedListGraph nodes={nodes.map(node=>({...node,nextId:node.nextId??null}))} pointers={pointers} highlightedIds={activeIds} label="Forward next links" />
    <LinkedListGraph nodes={[...nodes].reverse().map(node=>({...node,nextId:node.prevId??null}))} pointers={pointers} highlightedIds={activeIds} label="Reverse previous links" />
  </section>;
}
