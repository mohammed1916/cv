// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "One long inserted middle phrase",
    "input": "{\"sentence1\":\"We followed the path home\",\"sentence2\":\"We followed the quiet winding cedar path home\"}"
  },
  {
    "label": "Insertion at the beginning",
    "input": "{\"sentence1\":\"birds sing\",\"sentence2\":\"Before sunrise birds sing\"}"
  },
  {
    "label": "Insertion at the end",
    "input": "{\"sentence1\":\"The river bends\",\"sentence2\":\"The river bends past the old mill\"}"
  },
  {
    "label": "Two separate gaps cannot be one insertion",
    "input": "{\"sentence1\":\"red bird flies\",\"sentence2\":\"bright red small bird flies\"}"
  }
];
