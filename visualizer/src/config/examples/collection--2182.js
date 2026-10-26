// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "High-frequency large letters need several smaller separators",
    "input": "{\"s\":\"zzzzzyyyyxxwwvvaaa\",\"repeatLimit\":2}"
  },
  {
    "label": "One distinct letter leaves excess copies unused",
    "input": "{\"s\":\"mmmmmmm\",\"repeatLimit\":3}"
  },
  {
    "label": "A limit of one forbids all equal neighbors",
    "input": "{\"s\":\"dddddcccbbba\",\"repeatLimit\":1}"
  },
  {
    "label": "A generous limit permits ordinary descending order",
    "input": "{\"s\":\"orchard\",\"repeatLimit\":10}"
  }
];
