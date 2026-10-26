// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different octet widths remain intact",
    "input": "{\"address\":\"172.24.108.63\"}"
  },
  {
    "label": "All zero octets",
    "input": "{\"address\":\"0.0.0.0\"}"
  },
  {
    "label": "Maximum octets",
    "input": "{\"address\":\"255.255.255.255\"}"
  },
  {
    "label": "Short octets",
    "input": "{\"address\":\"8.7.6.5\"}"
  }
];
