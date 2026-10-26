// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Mixed speeds produce several tight deadlines",
    "input": "{\"dist\":[15,4,27,10,36,7,48,22],\"speed\":[3,2,3,2,4,1,4,2]}"
  },
  {
    "label": "Two arrivals compete for the same shot",
    "input": "{\"dist\":[2,3,9],\"speed\":[2,3,1]}"
  },
  {
    "label": "Arrival exactly at firing time loses",
    "input": "{\"dist\":[2,4,6],\"speed\":[2,2,3]}"
  },
  {
    "label": "One monster can always be shot immediately",
    "input": "{\"dist\":[1],\"speed\":[100]}"
  }
];
