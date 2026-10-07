// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several interior cuts compete across multi-digit operands",
    "input": "{\"expression\":\"3847+629\"}"
  },
  {
    "label": "Single-digit operands force the only parentheses placement",
    "input": "{\"expression\":\"6+8\"}"
  },
  {
    "label": "One side has several cuts while the other has one digit",
    "input": "{\"expression\":\"735+4\"}"
  },
  {
    "label": "Symmetric operands still allow different outside factors",
    "input": "{\"expression\":\"222+222\"}"
  }
];
