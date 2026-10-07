// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Insert longer shared prefix",
    "word": "apricot",
    "operation": "insert"
  },
  {
    "label": "Exact stored word",
    "word": "apple",
    "operation": "search"
  },
  {
    "label": "Prefix without word ending",
    "word": "appl",
    "operation": "search"
  },
  {
    "label": "Missing branch",
    "word": "cedar",
    "operation": "search"
  }
];
