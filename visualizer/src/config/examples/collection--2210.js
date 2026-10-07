// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Equal plateaus should each count as one extremum",
    "input": "{\"nums\":[3,7,7,4,4,9,2,2,6,6,1,5]}"
  },
  {
    "label": "A constant plateau has no two distinct neighboring heights",
    "input": "{\"nums\":[8,8,8,8]}"
  },
  {
    "label": "Monotone heights have no hill or valley",
    "input": "{\"nums\":[1,3,5,7,9]}"
  },
  {
    "label": "One interior plateau is one hill",
    "input": "{\"nums\":[2,6,6,6,3]}"
  }
];
