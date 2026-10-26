// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Empty rows separate several nonempty device rows",
    "input": "{\"bank\":[\"1010101\",\"0000000\",\"1100010\",\"0000000\",\"0011100\",\"1000001\"]}"
  },
  {
    "label": "A single nonempty row cannot form a beam",
    "input": "{\"bank\":[\"0000\",\"1011\",\"0000\"]}"
  },
  {
    "label": "No devices produce no beams",
    "input": "{\"bank\":[\"000\",\"000\",\"000\"]}"
  },
  {
    "label": "One-column devices connect across empty rows",
    "input": "{\"bank\":[\"1\",\"0\",\"1\",\"1\",\"0\",\"1\"]}"
  }
];
