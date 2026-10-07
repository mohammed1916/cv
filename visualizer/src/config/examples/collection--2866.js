// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated stack pops reuse optimal arm sums across a longer skyline",
    "input": "{\"maxHeights\":[12,5,9,3,11,14,8,8,4,10,6]}"
  },
  {
    "label": "Equal caps retain valid no-taller stack anchors",
    "input": "{\"maxHeights\":[7,7,7,7,7]}"
  },
  {
    "label": "A descending skyline can peak at its left boundary",
    "input": "{\"maxHeights\":[15,11,8,5,2]}"
  },
  {
    "label": "One cap is counted once after combining both arms",
    "input": "{\"maxHeights\":[19]}"
  }
];
