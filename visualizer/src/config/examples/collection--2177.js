// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A larger multiple fixes the middle integer directly",
    "input": "{\"num\":123456}"
  },
  {
    "label": "A nonmultiple has no integer middle",
    "input": "{\"num\":100}"
  },
  {
    "label": "Zero permits a negative predecessor",
    "input": "{\"num\":0}"
  },
  {
    "label": "The smallest positive multiple has a zero predecessor",
    "input": "{\"num\":3}"
  }
];
