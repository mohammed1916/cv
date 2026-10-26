// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Valid formats and near misses",
    "input": [
      "415-738-2096\n(628) 471-8302\n628 471 8302\n(415)738-2096\n415-73-2096"
    ]
  },
  {
    "label": "One valid number",
    "input": [
      "(312) 640-9758"
    ]
  },
  {
    "label": "No valid line",
    "input": [
      "12345\nphone unavailable"
    ]
  }
];
