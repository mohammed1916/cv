// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Departures release low chairs before later arrivals",
    "input": "{\"times\":[[2,12],[5,9],[7,15],[9,14],[11,18],[14,20]],\"targetFriend\":5}"
  },
  {
    "label": "Departure equals another arrival",
    "input": "{\"times\":[[3,8],[8,13]],\"targetFriend\":1}"
  },
  {
    "label": "Target is the first arrival despite its index",
    "input": "{\"times\":[[9,14],[2,17],[6,11]],\"targetFriend\":1}"
  },
  {
    "label": "All earlier friends still occupy chairs",
    "input": "{\"times\":[[1,20],[3,21],[5,22],[7,23]],\"targetFriend\":3}"
  }
];
