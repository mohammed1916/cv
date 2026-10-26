// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different minimum owners contribute weighted range sums",
    "input": "{\"strength\":[7,2,5,3,8,1,6]}"
  },
  {
    "label": "Repeated equal minima need a consistent ownership rule",
    "input": "{\"strength\":[4,4,4,4]}"
  },
  {
    "label": "One strength contributes its own square",
    "input": "{\"strength\":[13]}"
  },
  {
    "label": "Large strengths require exact modular arithmetic",
    "input": "{\"strength\":[999999,888888,777777,666666]}"
  }
];
