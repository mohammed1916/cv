// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Hour hand sits between hour marks",
    "input": "{\"hour\":7,\"minutes\":43}"
  },
  {
    "label": "Hands coincide at noon",
    "input": "{\"hour\":12,\"minutes\":0}"
  },
  {
    "label": "Straight angle",
    "input": "{\"hour\":6,\"minutes\":0}"
  },
  {
    "label": "Near the wraparound boundary",
    "input": "{\"hour\":11,\"minutes\":59}"
  }
];
