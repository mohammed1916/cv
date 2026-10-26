// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Large neighboring slices compete around a longer cycle",
    "input": "{\"slices\":[8,3,11,5,9,2,10,4,7]}"
  },
  {
    "label": "Three slices permit selecting only the largest",
    "input": "{\"slices\":[4,12,7]}"
  },
  {
    "label": "Equal slices make every legal fixed-count choice equal",
    "input": "{\"slices\":[6,6,6,6,6,6]}"
  },
  {
    "label": "Large values at both cycle ends cannot both be selected",
    "input": "{\"slices\":[15,2,3,8,4,14]}"
  }
];
