// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different bus durations contribute at different rates",
    "input": "{\"time\":[4,7,11,5,9],\"totalTrips\":37}"
  },
  {
    "label": "One bus must finish every requested trip",
    "input": "{\"time\":[13],\"totalTrips\":8}"
  },
  {
    "label": "The first completed trip comes from the fastest bus",
    "input": "{\"time\":[9,3,14,8],\"totalTrips\":1}"
  },
  {
    "label": "Equal-duration buses complete trips simultaneously",
    "input": "{\"time\":[6,6,6,6],\"totalTrips\":17}"
  }
];
