// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Unordered itinerary edges still reveal one terminal city",
    "input": "{\"paths\":[[\"Cedar Bay\",\"Pine Ridge\"],[\"Elm Vale\",\"Oak Harbor\"],[\"Pine Ridge\",\"Maple Glen\"],[\"Oak Harbor\",\"Cedar Bay\"]]}"
  },
  {
    "label": "One direct route",
    "input": "{\"paths\":[[\"North Port\",\"South Cove\"]]}"
  },
  {
    "label": "Endpoint appears early in the input list",
    "input": "{\"paths\":[[\"Briar Hill\",\"Fern Lake\"],[\"Ash Point\",\"Briar Hill\"]]}"
  },
  {
    "label": "Longer chain with shuffled entries",
    "input": "{\"paths\":[[\"C\",\"D\"],[\"A\",\"B\"],[\"D\",\"E\"],[\"B\",\"C\"]]}"
  }
];
