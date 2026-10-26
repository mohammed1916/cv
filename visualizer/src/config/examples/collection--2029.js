// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "All residue groups appear with different counts",
    "input": "{\"stones\":[3,6,9,1,4,7,10,2,5]}"
  },
  {
    "label": "Even zero count but one nonzero group is missing",
    "input": "{\"stones\":[3,6,1,4,7]}"
  },
  {
    "label": "Odd zero count needs a strict imbalance above two",
    "input": "{\"stones\":[3,1,4,7,10,2]}"
  },
  {
    "label": "An imbalance of exactly two is insufficient in the odd case",
    "input": "{\"stones\":[3,1,4,7,2]}"
  }
];
