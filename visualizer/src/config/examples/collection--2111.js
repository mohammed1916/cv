// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Interleaved residue chains need different numbers of replacements",
    "input": "{\"arr\":[9,4,8,7,3,6,5,5,7,2,6,9],\"k\":3}"
  },
  {
    "label": "Equal values extend a nondecreasing chain",
    "input": "{\"arr\":[4,4,4,4,4],\"k\":1}"
  },
  {
    "label": "One position per chain needs no replacement",
    "input": "{\"arr\":[8,3,7,1],\"k\":4}"
  },
  {
    "label": "A descending single chain keeps one value",
    "input": "{\"arr\":[15,12,9,6,3],\"k\":1}"
  }
];
