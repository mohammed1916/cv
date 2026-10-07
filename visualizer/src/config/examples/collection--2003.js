// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "The value-one branch expands through several ancestor subtrees",
    "input": "{\"parents\":[-1,0,0,1,1,2,2,3,3,5,5],\"nums\":[12,8,3,6,9,2,11,1,4,5,7]}"
  },
  {
    "label": "No node carries genetic value one",
    "input": "{\"parents\":[-1,0,0,1],\"nums\":[4,7,9,13]}"
  },
  {
    "label": "The root carries one so only the root can differ",
    "input": "{\"parents\":[-1,0,0,1,1],\"nums\":[1,2,3,4,5]}"
  },
  {
    "label": "A single node carries one",
    "input": "{\"parents\":[-1],\"nums\":[1]}"
  }
];
