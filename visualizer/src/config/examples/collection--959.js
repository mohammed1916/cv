// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several slashes connect across a larger grid",
    "input": "{\"grid\":[\" /\\\\\",\"/ /\",\"\\\\/ \"]}"
  },
  {
    "label": "A blank grid has one connected region",
    "input": "{\"grid\":[\"   \",\"   \",\"   \"]}"
  },
  {
    "label": "A single slash splits one cell into two regions",
    "input": "{\"grid\":[\"/\"]}"
  },
  {
    "label": "Opposite slash corners enclose a central region",
    "input": "{\"grid\":[\"/\\\\\",\"\\\\/\"]}"
  }
];
