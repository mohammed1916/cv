// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Off-center rings reach different matrix edges",
    "input": "{\"rows\":5,\"cols\":6,\"rCenter\":1,\"cCenter\":4}"
  },
  {
    "label": "Only one cell",
    "input": "{\"rows\":1,\"cols\":1,\"rCenter\":0,\"cCenter\":0}"
  },
  {
    "label": "A single row with distance ties",
    "input": "{\"rows\":1,\"cols\":7,\"rCenter\":0,\"cCenter\":3}"
  },
  {
    "label": "Center in the corner",
    "input": "{\"rows\":3,\"cols\":4,\"rCenter\":0,\"cCenter\":0}"
  }
];
