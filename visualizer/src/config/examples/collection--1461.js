// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping binary windows cover many patterns",
    "input": "{\"s\":\"0001011100\",\"k\":3}"
  },
  {
    "label": "Not enough windows exist",
    "input": "{\"s\":\"10101\",\"k\":4}"
  },
  {
    "label": "Both single-bit codes are present",
    "input": "{\"s\":\"000111\",\"k\":1}"
  },
  {
    "label": "Repeated windows miss other codes",
    "input": "{\"s\":\"000000\",\"k\":2}"
  }
];
