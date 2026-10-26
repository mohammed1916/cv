// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overwrite values while several keys share prefixes",
    "input": "{\"operations\":[[\"insert\",\"forest\",8],[\"insert\",\"fork\",5],[\"insert\",\"form\",11],[\"sum\",\"for\"],[\"insert\",\"forest\",3],[\"sum\",\"for\"],[\"insert\",\"fern\",7],[\"sum\",\"f\"],[\"sum\",\"fo\"],[\"sum\",\"z\"]]}"
  },
  {
    "label": "Missing prefix returns zero",
    "input": "{\"operations\":[[\"sum\",\"oak\"],[\"insert\",\"pine\",4],[\"sum\",\"oak\"]]}"
  },
  {
    "label": "A complete key can also be a prefix",
    "input": "{\"operations\":[[\"insert\",\"a\",3],[\"insert\",\"ab\",7],[\"sum\",\"a\"],[\"sum\",\"ab\"]]}"
  },
  {
    "label": "Same-value overwrite adds nothing",
    "input": "{\"operations\":[[\"insert\",\"elm\",9],[\"insert\",\"elm\",9],[\"sum\",\"e\"]]}"
  }
];
