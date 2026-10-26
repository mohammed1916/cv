// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated mappings in a longer pattern",
    "input": [
      "abacabad",
      "oak pine oak moss oak pine oak reed"
    ]
  },
  {
    "label": "Two symbols cannot share a word",
    "input": [
      "ab",
      "oak oak"
    ]
  },
  {
    "label": "Length mismatch",
    "input": [
      "aba",
      "oak pine"
    ]
  },
  {
    "label": "Consistent bijection",
    "input": [
      "abba",
      "moss reed reed moss"
    ]
  }
];
