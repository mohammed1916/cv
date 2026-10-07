// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Changing M alters both immediate and future choices",
    "input": "{\"piles\":[5,9,3,12,4,8,6,11,2]}"
  },
  {
    "label": "A single pile is taken immediately",
    "input": "{\"piles\":[17]}"
  },
  {
    "label": "The first player can take both initial piles",
    "input": "{\"piles\":[4,13]}"
  },
  {
    "label": "Equal piles still require planning around the move limit",
    "input": "{\"piles\":[6,6,6,6,6,6,6,6]}"
  }
];
