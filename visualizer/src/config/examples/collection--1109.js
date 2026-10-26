// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping reservations cancel at different boundaries",
    "input": "{\"bookings\":[[1,4,13],[3,7,8],[6,9,17],[2,2,6],[8,10,11]],\"n\":10}"
  },
  {
    "label": "One booking covers all flights",
    "input": "{\"bookings\":[[1,5,9]],\"n\":5}"
  },
  {
    "label": "Single-flight booking",
    "input": "{\"bookings\":[[3,3,12]],\"n\":6}"
  },
  {
    "label": "Repeated intervals accumulate",
    "input": "{\"bookings\":[[2,4,5],[2,4,7]],\"n\":5}"
  }
];
