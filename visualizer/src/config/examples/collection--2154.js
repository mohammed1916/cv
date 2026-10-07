// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A chain of doublings ignores unrelated values and duplicates",
    "input": "{\"nums\":[3,6,12,5,24,48,6,11,96,7],\"original\":3}"
  },
  {
    "label": "The initial value is absent",
    "input": "{\"nums\":[2,5,9,14],\"original\":7}"
  },
  {
    "label": "Repeated occurrences do not repeat the same doubling",
    "input": "{\"nums\":[4,4,4,8,8],\"original\":4}"
  },
  {
    "label": "A large final doubling leaves the membership set",
    "input": "{\"nums\":[125,250,500,1000],\"original\":125}"
  }
];
