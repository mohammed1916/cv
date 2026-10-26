// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "One friendship shares four common neighbors",
    "input": "{\"friendship\":[{\"user1_id\":10,\"user2_id\":20},{\"user1_id\":10,\"user2_id\":30},{\"user1_id\":10,\"user2_id\":40},{\"user1_id\":10,\"user2_id\":50},{\"user1_id\":10,\"user2_id\":60},{\"user1_id\":20,\"user2_id\":30},{\"user1_id\":20,\"user2_id\":40},{\"user1_id\":20,\"user2_id\":50},{\"user1_id\":20,\"user2_id\":60},{\"user1_id\":60,\"user2_id\":70}]}"
  },
  {
    "label": "Exactly three common friends meet the boundary",
    "input": "{\"friendship\":[{\"user1_id\":71,\"user2_id\":83},{\"user1_id\":71,\"user2_id\":91},{\"user1_id\":71,\"user2_id\":97},{\"user1_id\":71,\"user2_id\":101},{\"user1_id\":83,\"user2_id\":91},{\"user1_id\":83,\"user2_id\":97},{\"user1_id\":83,\"user2_id\":101}]}"
  },
  {
    "label": "Common neighbors without a direct friendship are excluded",
    "input": "{\"friendship\":[{\"user1_id\":71,\"user2_id\":91},{\"user1_id\":71,\"user2_id\":97},{\"user1_id\":71,\"user2_id\":101},{\"user1_id\":83,\"user2_id\":91},{\"user1_id\":83,\"user2_id\":97},{\"user1_id\":83,\"user2_id\":101}]}"
  },
  {
    "label": "No friendships produce no result",
    "input": "{\"friendship\":[]}"
  }
];
