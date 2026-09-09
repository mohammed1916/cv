/**
 * Fetches problem descriptions from LeetCode's GraphQL API for ALL
 * free (non-paid) problems in the catalog and saves them to
 * public/data/descriptions/<slug>.json
 *
 * Usage: node scripts/fetch-problem-descriptions.mjs
 * Supports resuming — already-cached slugs are skipped.
 */

import fs from 'node:fs/promises'
import path from 'node:path'

const GRAPHQL_URL = 'https://leetcode.com/graphql/'
const QUERY = `
  query questionContent($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      content
      exampleTestcases
      metaData
    }
  }
`

async function fetchDescription(slug) {
    const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com',
            'User-Agent': 'Mozilla/5.0',
        },
        body: JSON.stringify({ query: QUERY, variables: { titleSlug: slug } }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${slug}`)
    const json = await res.json()
    return json?.data?.question ?? null
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
    const catalogPath = path.resolve(process.cwd(), 'public/data/leetcodeCatalog.json')
    const outputPath = path.resolve(process.cwd(), 'public/data/descriptions')
    await fs.mkdir(outputPath, { recursive: true })

    const catalogRaw = await fs.readFile(catalogPath, 'utf-8')
    const catalog = JSON.parse(catalogRaw)

    // Each successful fetch is its own checkpoint, so interrupted runs resume.
    const existing = new Set((await fs.readdir(outputPath))
        .filter((name) => name.endsWith('.json'))
        .map((name) => name.slice(0, -5)))

    // All free (non-paid) problems from catalog, sorted by number
    const toFetch = catalog.problems
        .filter((p) => !p.paidOnly && !existing.has(p.slug))
        .sort((a, b) => Number(a.number) - Number(b.number))

    const totalFree = catalog.problems.filter((p) => !p.paidOnly).length
    console.log(`Fetching ${toFetch.length} problems (${existing.size}/${totalFree} free problems already cached)…`)

    let fetched = 0
    for (const problem of toFetch) {
        const { number: num, slug } = problem
        try {
            const data = await fetchDescription(slug)
            if (data) {
                const description = {
                    content: data.content ?? '',
                    exampleTestcases: data.exampleTestcases ?? '',
                }
                if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('Invalid problem slug')
                await fs.writeFile(path.join(outputPath, `${slug}.json`), JSON.stringify(description) + '\n')
                fetched++
                console.log(`  [OK] #${num} ${slug}`)
            } else {
                console.warn(`  [EMPTY] #${num} ${slug}`)
            }
        } catch (err) {
            console.error(`  [ERROR] #${num} ${slug}: ${err.message}`)
        }

        // Polite delay to avoid rate limiting
        await sleep(400)

    }

    console.log(`\nDone. ${fetched} new descriptions saved to ${outputPath}`)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
