// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Stock spans absorb several earlier blocks",
    "input": "{\"prices\":[47,31,35,29,42,42,38,55,49,61]}"
  },
  {
    "label": "Strictly decreasing prices",
    "input": "{\"prices\":[90,70,50,30]}"
  },
  {
    "label": "Equal prices all join",
    "input": "{\"prices\":[18,18,18,18]}"
  },
  {
    "label": "Single quote",
    "input": "{\"prices\":[73]}"
  }
];
