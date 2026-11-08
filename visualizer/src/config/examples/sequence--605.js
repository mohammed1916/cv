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
  },
  {
    "label": "Single empty plot with no flowers requested",
    "input": "{\"flowerbed\":[0],\"n\":0}"
  },
  {
    "label": "Equal gaps fill to the limit",
    "input": "{\"flowerbed\":[1,0,0,0,1],\"n\":1}"
  },
  {
    "label": "Flowers at both ends with room between",
    "input": "{\"flowerbed\":[1,0,0,0,0,0,0,0,1],\"n\":3}"
  },
  {
    "label": "Long run: 40 plots",
    "input": "{\"flowerbed\":[0,0,0,0,1,0,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0,1,0,1,0,0,0],\"n\":6}"
  }
];
