// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Renewal and expiration interact across several tokens",
    "input": "{\"timeToLive\":7,\"operations\":[[\"generate\",\"oak\",1],[\"generate\",\"pine\",3],[\"renew\",\"oak\",6],[\"count\",8],[\"renew\",\"pine\",10],[\"generate\",\"elm\",11],[\"count\",13],[\"renew\",\"elm\",15],[\"count\",20],[\"count\",22]]}"
  },
  {
    "label": "Renew exactly at expiry fails",
    "input": "{\"timeToLive\":4,\"operations\":[[\"generate\",\"a\",1],[\"renew\",\"a\",5],[\"count\",6]]}"
  },
  {
    "label": "Renewing missing token changes nothing",
    "input": "{\"timeToLive\":6,\"operations\":[[\"renew\",\"ghost\",2],[\"count\",3]]}"
  },
  {
    "label": "Successful renewal extends lifetime",
    "input": "{\"timeToLive\":5,\"operations\":[[\"generate\",\"fern\",1],[\"renew\",\"fern\",4],[\"count\",7],[\"count\",9]]}"
  }
];
