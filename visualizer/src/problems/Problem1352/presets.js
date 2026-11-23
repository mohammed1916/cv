// Fixed presets for Problem 1352. Written for this site, shared by the workspace and the narration builder.
export const examples = [
  { label: 'Goal example: last two of 2, 4, 3, 5', input: '{"operations":[["add",2],["add",4],["add",3],["add",5],["getProduct",2]]}' },
  { label: 'Zero, then recover', input: '{"operations":[["add",2],["add",4],["add",3],["add",0],["getProduct",2],["add",5],["add",6],["getProduct",2]]}' },
  { label: 'Single value', input: '{"operations":[["add",7],["getProduct",1]]}' },
  { label: 'Equal values', input: '{"operations":[["add",2],["add",2],["add",2],["getProduct",3]]}' },
  { label: 'Eleven nines', input: '{"operations":[["add",9],["add",9],["add",9],["add",9],["add",9],["add",9],["add",9],["add",9],["add",9],["add",9],["add",9],["getProduct",11]]}' },
  { label: 'Long run: twelve operations', input: '{"operations":[["add",4],["add",2],["add",1],["add",7],["add",5],["add",1],["add",9],["add",4],["getProduct",6],["getProduct",4],["getProduct",7],["getProduct",3]]}' },
]
