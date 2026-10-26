// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Multiple alignments grow past one mismatch",
    "input": "{\"s\":\"abacaba\",\"t\":\"acabbac\"}"
  },
  {
    "label": "Identical repeated strings have no one-mismatch pair",
    "input": "{\"s\":\"aaaa\",\"t\":\"aaaa\"}"
  },
  {
    "label": "One unequal character pair",
    "input": "{\"s\":\"q\",\"t\":\"z\"}"
  },
  {
    "label": "Length-one matches mixed with mismatches",
    "input": "{\"s\":\"ab\",\"t\":\"bc\"}"
  }
];
