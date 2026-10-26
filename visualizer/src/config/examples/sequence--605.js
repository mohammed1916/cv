// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several separated planting opportunities",
    "input": "{\"flowerbed\":[0,0,0,1,0,0,0,0,1,0,0,0,0],\"n\":4}"
  },
  {
    "label": "Both boundaries available",
    "input": "{\"flowerbed\":[0,0,1,0,0],\"n\":2}"
  },
  {
    "label": "No flowers requested",
    "input": "{\"flowerbed\":[1,0,1],\"n\":0}"
  },
  {
    "label": "Only one slot",
    "input": "{\"flowerbed\":[0],\"n\":1}"
  },
  {
    "label": "Not enough space",
    "input": "{\"flowerbed\":[0,0,0,0,0],\"n\":4}"
  }
];
