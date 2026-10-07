// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Reverse pairs and several possible centers compete",
    "input": "{\"words\":[\"ab\",\"cd\",\"ba\",\"ee\",\"dc\",\"ab\",\"ba\",\"ff\",\"ee\",\"gg\",\"ff\",\"hh\"]}"
  },
  {
    "label": "Unmatched nonsymmetric words contribute nothing",
    "input": "{\"words\":[\"ab\",\"cd\",\"ef\",\"gh\"]}"
  },
  {
    "label": "Only one leftover symmetric word fits the center",
    "input": "{\"words\":[\"aa\",\"bb\",\"cc\",\"dd\"]}"
  },
  {
    "label": "Repeated symmetric words form outer pairs plus a center",
    "input": "{\"words\":[\"zz\",\"zz\",\"zz\",\"zz\",\"zz\"]}"
  }
];
