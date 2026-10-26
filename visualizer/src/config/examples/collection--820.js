// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Suffix chains share reversed trie branches",
    "input": "{\"words\":[\"cedar\",\"dar\",\"ar\",\"star\",\"tar\",\"river\",\"iver\",\"ver\",\"r\",\"moss\",\"oss\"]}"
  },
  {
    "label": "Duplicate words add no length",
    "input": "{\"words\":[\"grove\",\"grove\",\"grove\"]}"
  },
  {
    "label": "All words suffixes of one longest word",
    "input": "{\"words\":[\"g\",\"ng\",\"ing\",\"ring\",\"spring\"]}"
  },
  {
    "label": "No suffix sharing",
    "input": "{\"words\":[\"oak\",\"elm\",\"fir\"]}"
  }
];
