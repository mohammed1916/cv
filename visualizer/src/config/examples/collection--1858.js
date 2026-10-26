// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Two growing prefix chains compete",
    "input": "{\"words\":[\"s\",\"st\",\"sto\",\"ston\",\"stone\",\"storm\",\"p\",\"pl\",\"pla\",\"plan\",\"plant\",\"planet\"]}"
  },
  {
    "label": "No complete first prefix",
    "input": "{\"words\":[\"oak\",\"elm\",\"pine\"]}"
  },
  {
    "label": "Equal lengths prefer smaller spelling",
    "input": "{\"words\":[\"a\",\"at\",\"ate\",\"b\",\"be\",\"bee\"]}"
  },
  {
    "label": "Single one-letter word",
    "input": "{\"words\":[\"q\"]}"
  }
];
