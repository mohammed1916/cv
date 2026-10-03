import { auditCatalogStories } from './catalog-story-audit-lib.mjs';
const report = await auditCatalogStories();
console.log(JSON.stringify(report, null, 2));
if (report.failures.length) process.exitCode = 1;
