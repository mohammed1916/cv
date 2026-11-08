// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated and increasing chunks offer many partitions",
    "input": "{\"num\":\"121314151617\"}"
  },
  {
    "label": "A leading zero prevents every valid partition",
    "input": "{\"num\":\"012345\"}"
  },
  {
    "label": "Zeroes may occur inside a positive number",
    "input": "{\"num\":\"10102030\"}"
  },
  {
    "label": "Repeated digits allow equal consecutive numbers",
    "input": "{\"num\":\"777777\"}"
  },
  {
    "label": "Single digit",
    "input": "7"
  },
  {
    "label": "Repeated zeros",
    "input": "0000"
  },
  {
    "label": "Twelve nines",
    "input": "999999999999"
  },
  {
    "label": "Long run: 12 digits",
    "input": "737904259607"
  }
];
