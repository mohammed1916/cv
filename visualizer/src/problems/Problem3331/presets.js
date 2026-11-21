// Fixed presets for Problem 3331. Shared by the workspace and the narration builder.
export const examples = [
  { label: 'Mixed letters', input: '{"parent":[-1,0,1],"s":"aba"}' },
  { label: 'Chain, same letter', input: '{"parent":[-1,0,1,2],"s":"aaaa"}' },
  { label: 'Single node', input: '{"parent":[-1],"s":"a"}' },
  { label: 'Star, same letter', input: '{"parent":[-1,0,0,0,0],"s":"aaaaa"}' },
  { label: 'Ancestor two levels up', input: '{"parent":[-1,0,1,2,0],"s":"abaca"}' },
  { label: 'Longest chain, 10 nodes', input: '{"parent":[-1,0,1,2,3,4,5,6,7,8],"s":"abcdeabcde"}' },
  { label: 'Branching, 10 nodes', input: '{"parent":[-1,0,1,1,1,1,5,3,7,0],"s":"abbebcbbbe"}' },
];
