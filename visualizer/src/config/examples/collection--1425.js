// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Positive choices bridge bounded negative gaps",
    "input": "{\"nums\":[8,-5,4,-12,7,-2,9,-15,6],\"k\":3}"
  },
  {
    "label": "All negative values still require a nonempty answer",
    "input": "{\"nums\":[-8,-3,-11,-5],\"k\":2}"
  },
  {
    "label": "k one becomes a contiguous maximum-sum choice",
    "input": "{\"nums\":[5,-2,4,-9,6],\"k\":1}"
  },
  {
    "label": "A wide gap allowance can skip all negative entries",
    "input": "{\"nums\":[3,-20,7,-30,11],\"k\":5}"
  }
];
