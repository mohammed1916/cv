// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several free runs coexist with isolated and occupied seats",
    "input": "{\"cinema\":[{\"seat_id\":1,\"free\":0},{\"seat_id\":2,\"free\":1},{\"seat_id\":3,\"free\":1},{\"seat_id\":4,\"free\":1},{\"seat_id\":5,\"free\":0},{\"seat_id\":6,\"free\":1},{\"seat_id\":7,\"free\":0},{\"seat_id\":8,\"free\":1},{\"seat_id\":9,\"free\":1},{\"seat_id\":10,\"free\":0}]}"
  },
  {
    "label": "No free seats means no output",
    "input": "{\"cinema\":[{\"seat_id\":1,\"free\":0},{\"seat_id\":2,\"free\":0},{\"seat_id\":3,\"free\":0}]}"
  },
  {
    "label": "A two-seat run includes both endpoints",
    "input": "{\"cinema\":[{\"seat_id\":1,\"free\":1},{\"seat_id\":2,\"free\":1}]}"
  },
  {
    "label": "Alternating availability leaves every free seat isolated",
    "input": "{\"cinema\":[{\"seat_id\":1,\"free\":1},{\"seat_id\":2,\"free\":0},{\"seat_id\":3,\"free\":1},{\"seat_id\":4,\"free\":0},{\"seat_id\":5,\"free\":1}]}"
  }
];
