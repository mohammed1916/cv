// Fixed presets for Problem 353. Written for this site, shared by the workspace and the narration builder.
export const examples = [
  { label: 'Eat, turn, eat', input: '{"width":3,"height":2,"food":[[1,2],[0,2]],"moves":["R","D","R","U","L","L"]}' },
  { label: 'Hit the wall', input: '{"width":2,"height":2,"food":[],"moves":["R","R"]}' },
  { label: 'Food on the first move', input: '{"width":2,"height":2,"food":[[0,1]],"moves":["R","D","L","U"]}' },
  { label: 'Tail frees the cell', input: '{"width":2,"height":2,"food":[[0,1],[1,1],[1,0]],"moves":["R","D","L","U"]}' },
  { label: 'Bite the body', input: '{"width":2,"height":2,"food":[[0,1],[1,1],[1,0],[0,0]],"moves":["R","D","L","U"]}' },
]
