// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Mixed prefix and postfix operations cross zero repeatedly",
    "input": "{\"operations\":[\"X++\",\"++X\",\"--X\",\"X--\",\"--X\",\"X++\",\"++X\",\"X++\",\"X--\"]}"
  },
  {
    "label": "All decrements produce a negative result",
    "input": "{\"operations\":[\"--X\",\"X--\",\"--X\",\"X--\"]}"
  },
  {
    "label": "Operations cancel completely",
    "input": "{\"operations\":[\"++X\",\"X--\",\"X++\",\"--X\"]}"
  },
  {
    "label": "One increment",
    "input": "{\"operations\":[\"X++\"]}"
  },
  {
    "label": "Single increment",
    "input": "[\"X++\"]"
  },
  {
    "label": "Increments cancel out",
    "input": "[\"X++\",\"X--\",\"--X\",\"++X\"]"
  },
  {
    "label": "Only decrements",
    "input": "[\"--X\",\"X--\",\"--X\"]"
  },
  {
    "label": "Long run: 100 operations",
    "input": "[\"X++\",\"X--\",\"X--\",\"++X\",\"X--\",\"++X\",\"X++\",\"--X\",\"--X\",\"++X\",\"X++\",\"X--\",\"X--\",\"++X\",\"--X\",\"--X\",\"--X\",\"--X\",\"--X\",\"++X\",\"X--\",\"X++\",\"X++\",\"X++\",\"X++\",\"--X\",\"++X\",\"--X\",\"X--\",\"X++\",\"X--\",\"X--\",\"++X\",\"--X\",\"X--\",\"X--\",\"--X\",\"X--\",\"--X\",\"X++\",\"X--\",\"--X\",\"--X\",\"--X\",\"X++\",\"++X\",\"X++\",\"X--\",\"--X\",\"X--\",\"++X\",\"X++\",\"--X\",\"X--\",\"X++\",\"++X\",\"X--\",\"X--\",\"++X\",\"X++\",\"++X\",\"X++\",\"--X\",\"--X\",\"X++\",\"X--\",\"X--\",\"++X\",\"++X\",\"X++\",\"++X\",\"X--\",\"++X\",\"--X\",\"X++\",\"++X\",\"--X\",\"X++\",\"X++\",\"X++\",\"--X\",\"X++\",\"X--\",\"--X\",\"X++\",\"++X\",\"X--\",\"X--\",\"X++\",\"X++\",\"X--\",\"X--\",\"X++\",\"--X\",\"X--\",\"++X\",\"--X\",\"++X\",\"X--\",\"++X\"]"
  }
];
