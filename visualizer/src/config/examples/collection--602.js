// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Incoming and outgoing requests both grow the central person degree",
    "input": "{\"accepted\":[{\"requester_id\":10,\"accepter_id\":20,\"accept_date\":\"2025-06-01\"},{\"requester_id\":30,\"accepter_id\":10,\"accept_date\":\"2025-06-02\"},{\"requester_id\":10,\"accepter_id\":40,\"accept_date\":\"2025-06-03\"},{\"requester_id\":50,\"accepter_id\":10,\"accept_date\":\"2025-06-04\"},{\"requester_id\":20,\"accepter_id\":30,\"accept_date\":\"2025-06-05\"},{\"requester_id\":40,\"accepter_id\":50,\"accept_date\":\"2025-06-06\"},{\"requester_id\":60,\"accepter_id\":10,\"accept_date\":\"2025-06-07\"}]}"
  },
  {
    "label": "A short path has one uniquely most connected middle person",
    "input": "{\"accepted\":[{\"requester_id\":7,\"accepter_id\":8,\"accept_date\":\"2025-06-01\"},{\"requester_id\":8,\"accepter_id\":9,\"accept_date\":\"2025-06-02\"}]}"
  },
  {
    "label": "A hub may appear only as the accepter",
    "input": "{\"accepted\":[{\"requester_id\":1,\"accepter_id\":99,\"accept_date\":\"2025-06-01\"},{\"requester_id\":2,\"accepter_id\":99,\"accept_date\":\"2025-06-02\"},{\"requester_id\":3,\"accepter_id\":99,\"accept_date\":\"2025-06-03\"},{\"requester_id\":4,\"accepter_id\":99,\"accept_date\":\"2025-06-04\"}]}"
  },
  {
    "label": "Disconnected components still share one global winner",
    "input": "{\"accepted\":[{\"requester_id\":2,\"accepter_id\":3,\"accept_date\":\"2025-06-01\"},{\"requester_id\":8,\"accepter_id\":9,\"accept_date\":\"2025-06-02\"},{\"requester_id\":8,\"accepter_id\":10,\"accept_date\":\"2025-06-03\"},{\"requester_id\":8,\"accepter_id\":11,\"accept_date\":\"2025-06-04\"}]}"
  }
];
