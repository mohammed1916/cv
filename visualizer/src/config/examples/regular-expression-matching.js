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
  },
  {
    "label": "Empty text",
    "s": "",
    "p": "a*"
  },
  {
    "label": "Repeated starred letter",
    "s": "aaaa",
    "p": "a*"
  },
  {
    "label": "Maximum pattern length",
    "s": "aaaaaaaaaa",
    "p": "a*a*a*a*a*"
  },
  {
    "label": "Long run: ten characters",
    "s": "aaaaaaaaaa",
    "p": ".*a*b*.*"
  }
];
