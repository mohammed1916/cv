// One shared download of the LeetCode catalogue per page load. Components that
// need the catalogue call this instead of fetching the 1 MB file themselves.
let catalogRequest = null;

export function loadLeetCodeCatalog() {
  if (!catalogRequest) {
    catalogRequest = fetch("/data/leetcodeCatalog.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Catalog load failed: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        catalogRequest = null;
        throw error;
      });
  }
  return catalogRequest;
}
