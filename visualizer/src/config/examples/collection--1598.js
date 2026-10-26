// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Navigate through children, stays, and parents",
    "input": "{\"logs\":[\"grove/\",\"east/\",\"./\",\"../\",\"west/\",\"deep/\",\"../\",\"../\",\"north/\",\"../\"]}"
  },
  {
    "label": "Parent cannot pass root",
    "input": "{\"logs\":[\"../\",\"../\",\"./\"]}"
  },
  {
    "label": "Only descend",
    "input": "{\"logs\":[\"oak/\",\"leaf/\",\"bud/\"]}"
  },
  {
    "label": "Return exactly to root",
    "input": "{\"logs\":[\"a/\",\"b/\",\"../\",\"../\"]}"
  }
];
