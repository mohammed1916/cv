// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several mixed seat pairs form connected couple groups",
    "input": "{\"row\":[0,3,2,5,4,1,6,9,8,7,10,11]}"
  },
  {
    "label": "Every couple is already seated together",
    "input": "{\"row\":[3,2,0,1,5,4]}"
  },
  {
    "label": "One long couple cycle needs one fewer swap than couples",
    "input": "{\"row\":[0,3,2,5,4,7,6,1]}"
  },
  {
    "label": "A single couple needs no swaps",
    "input": "{\"row\":[1,0]}"
  }
];
