// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several merge orders compete across a longer pile sequence",
    "input": "{\"stones\":[4,7,2,9,3,6,5],\"k\":3}"
  },
  {
    "label": "Pile count can make k-way completion impossible",
    "input": "{\"stones\":[3,8,4,6],\"k\":3}"
  },
  {
    "label": "One existing pile needs no merge cost",
    "input": "{\"stones\":[12],\"k\":4}"
  },
  {
    "label": "Binary merges compare many parenthesizations",
    "input": "{\"stones\":[5,1,8,2,6],\"k\":2}"
  }
];
