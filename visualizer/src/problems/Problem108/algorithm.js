import { parseSortedList, buildSortedTreeStory } from '../../components/shared/sortedTreeTrace.js';
export function buildSortedArrayStory(text) {
  const values = parseSortedList(text);
  if(values.some((v,i)=>i>0&&v===values[i-1]))throw new Error('Use strictly increasing array values.');
  return {values,...buildSortedTreeStory(values,'array')};
}
