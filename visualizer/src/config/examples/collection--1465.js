// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Largest horizontal and vertical gaps occur between different cuts",
    "input": "{\"h\":23,\"w\":31,\"horizontalCuts\":[4,9,18],\"verticalCuts\":[3,11,16,27]}"
  },
  {
    "label": "Boundary gaps are the largest",
    "input": "{\"h\":20,\"w\":18,\"horizontalCuts\":[2,4],\"verticalCuts\":[14,16]}"
  },
  {
    "label": "Evenly spaced cuts create equal pieces",
    "input": "{\"h\":12,\"w\":15,\"horizontalCuts\":[3,6,9],\"verticalCuts\":[5,10]}"
  },
  {
    "label": "Large dimensions require exact modular area",
    "input": "{\"h\":1000000000,\"w\":1000000000,\"horizontalCuts\":[2],\"verticalCuts\":[3]}"
  }
];
