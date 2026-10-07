// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated strings are removed from ranking without reordering",
    "input": "{\"arr\":[\"moss\",\"reed\",\"fern\",\"moss\",\"oak\",\"reed\",\"pine\",\"elm\",\"oak\",\"ash\"],\"k\":3}"
  },
  {
    "label": "Too few distinct strings yield an empty result",
    "input": "{\"arr\":[\"bay\",\"bay\",\"cedar\"],\"k\":2}"
  },
  {
    "label": "All values distinct preserve original order",
    "input": "{\"arr\":[\"violet\",\"amber\",\"indigo\"],\"k\":2}"
  },
  {
    "label": "Every value repeats",
    "input": "{\"arr\":[\"a\",\"b\",\"a\",\"b\"],\"k\":1}"
  }
];
