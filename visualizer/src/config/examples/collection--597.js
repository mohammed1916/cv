// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated requests and acceptances count only distinct directed pairs",
    "input": "{\"requests\":[{\"sender_id\":4,\"send_to_id\":8,\"request_date\":\"2025-05-01\"},{\"sender_id\":4,\"send_to_id\":8,\"request_date\":\"2025-05-02\"},{\"sender_id\":8,\"send_to_id\":12,\"request_date\":\"2025-05-03\"},{\"sender_id\":4,\"send_to_id\":15,\"request_date\":\"2025-05-04\"},{\"sender_id\":15,\"send_to_id\":21,\"request_date\":\"2025-05-05\"},{\"sender_id\":21,\"send_to_id\":4,\"request_date\":\"2025-05-06\"},{\"sender_id\":8,\"send_to_id\":12,\"request_date\":\"2025-05-07\"}],\"accepted\":[{\"requester_id\":4,\"accepter_id\":8,\"accept_date\":\"2025-06-01\"},{\"requester_id\":8,\"accepter_id\":12,\"accept_date\":\"2025-06-02\"},{\"requester_id\":4,\"accepter_id\":8,\"accept_date\":\"2025-06-03\"},{\"requester_id\":21,\"accepter_id\":4,\"accept_date\":\"2025-06-04\"}]}"
  },
  {
    "label": "No requests yields zero instead of division by zero",
    "input": "{\"requests\":[],\"accepted\":[]}"
  },
  {
    "label": "Unaccepted requests contribute only to the denominator",
    "input": "{\"requests\":[{\"sender_id\":7,\"send_to_id\":9,\"request_date\":\"2025-05-01\"},{\"sender_id\":7,\"send_to_id\":11,\"request_date\":\"2025-05-02\"},{\"sender_id\":9,\"send_to_id\":11,\"request_date\":\"2025-05-03\"}],\"accepted\":[]}"
  },
  {
    "label": "One accepted pair out of three requires decimal rounding",
    "input": "{\"requests\":[{\"sender_id\":2,\"send_to_id\":5,\"request_date\":\"2025-05-01\"},{\"sender_id\":2,\"send_to_id\":9,\"request_date\":\"2025-05-02\"},{\"sender_id\":5,\"send_to_id\":9,\"request_date\":\"2025-05-03\"}],\"accepted\":[{\"requester_id\":2,\"accepter_id\":9,\"accept_date\":\"2025-06-01\"}]}"
  }
];
