// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several rounds concatenate multi-digit group sums",
    "input": "{\"s\":\"987654321998877665544\",\"k\":3}"
  },
  {
    "label": "A short enough input is returned unchanged",
    "input": "{\"s\":\"507\",\"k\":4}"
  },
  {
    "label": "All-zero groups may shorten without gaining digits",
    "input": "{\"s\":\"0000000000\",\"k\":2}"
  },
  {
    "label": "Two-digit group sums can initially preserve length",
    "input": "{\"s\":\"99999999\",\"k\":2}"
  }
];
