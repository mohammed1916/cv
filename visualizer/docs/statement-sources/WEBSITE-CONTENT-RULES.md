# Reference material and website content

User instruction, 2026-11-02: do not use the source statements' examples on our website. This applies to both existing and future visualizers, and takes precedence over earlier blanket instructions to preserve examples.

## Required implementation behavior

- Keep the recovered `local-reference/leetcode/` archive outside `public/`, application imports, generated site data, client bundles, downloadable assets and deployment inputs. Do not restore the old runtime description loader.
- Do not publish copied statement prose, example explanations, diagrams, screenshots, editorials or hints. Write original concise descriptions of the computation and original algorithm explanations.
- Author example inputs to demonstrate the algorithm's invariant, nontrivial decisions and boundary conditions. Compute expected results independently and write new walkthroughs from those traces. Do not merely rename variables in a copied walkthrough.
- Keep official examples used for local reference validation separate from public presets. Do not automatically copy `docs/requirements/*` examples or raw `exampleTestcases` into UI definitions, story generators or example registries. These documentation fields are not a public-content feed.
- Review existing `definition.examples`, centralized example registries, family definitions, story scenes, narration and screenshots for source-derived material. Replace copied public material with independently authored equivalents while retaining correctness and useful teaching coverage.
- The November nine-problem review includes source-example reproduction inputs for debugging. Those are verification cases, not instructions to publish those exact examples. Use independently authored cases covering the same failure/insight for the website.
- Record example provenance (authored versus reference-only) and validate original outputs. Tiny unavoidable coincidences in trivial inputs are not by themselves a reliable copying detector; review wording, selection, sequence and walkthrough provenance as well.
- Before calling this gate complete, inspect production output and the actual page. Confirm no raw reference archive is copied or imported and that public presets/explanations meet this instruction. This document adds a requirement; it does not claim a site-wide audit has already run.

## Chrome access and scraping

On 2026-11-02, the user's existing Chrome session displayed a readable LeetCode problem description through native accessibility. The browser automation host was unavailable, but native Chrome access worked. This confirms that an ordinary page can be read; it does not establish bulk access, Premium entitlement or permission to reproduce text.

LeetCode's [published Terms of Service](https://leetcode.com/terms/), checked on this date, explicitly prohibit crawling, scraping and spidering. A signed-in session does not itself provide a license or an exception. No bulk scrape was initiated in this check. For a new full-text bulk archive, seek an authorized export/licensed source or permission from LeetCode. Do not export browser cookies or credentials into scripts, circumvent access controls, or label blocked full-text entries as acquired.

Original examples are a project content requirement, not a legal guarantee. Avoid assuring the user that replacing examples alone resolves all intellectual-property or contractual questions. Continue authorized original implementation and verification from available requirements while recording source gaps honestly.
