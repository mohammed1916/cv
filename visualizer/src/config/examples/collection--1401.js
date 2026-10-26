// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Nearest rectangle corner determines a near overlap",
    "input": "{\"radius\":6,\"xCenter\":9,\"yCenter\":12,\"x1\":1,\"y1\":2,\"x2\":6,\"y2\":8}"
  },
  {
    "label": "Center lies inside rectangle",
    "input": "{\"radius\":2,\"xCenter\":4,\"yCenter\":5,\"x1\":1,\"y1\":1,\"x2\":8,\"y2\":9}"
  },
  {
    "label": "Exact edge tangency",
    "input": "{\"radius\":3,\"xCenter\":8,\"yCenter\":4,\"x1\":1,\"y1\":1,\"x2\":5,\"y2\":7}"
  },
  {
    "label": "Separated shapes",
    "input": "{\"radius\":2,\"xCenter\":-5,\"yCenter\":-4,\"x1\":0,\"y1\":0,\"x2\":4,\"y2\":6}"
  }
];
