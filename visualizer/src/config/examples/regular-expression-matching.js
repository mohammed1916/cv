// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Skip and consume starred groups",
    "s": "mmmnnopqq",
    "p": "m*n*o.p*.*"
  },
  {
    "label": "Zero repetitions",
    "s": "river",
    "p": "r.*z*"
  },
  {
    "label": "Whole string must match",
    "s": "cedar",
    "p": "ced"
  },
  {
    "label": "Dot consumes one",
    "s": "oak",
    "p": "o.k"
  },
  {
    "label": "Empty through stars",
    "s": "",
    "p": "a*b*"
  }
];
