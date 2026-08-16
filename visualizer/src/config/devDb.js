/**
 * Dev Database - Lightweight local storage for development
 *
 * Not for production. Used during development to:
 * - Cache problem comparisons
 * - Track which problems have visualizers
 * - Store sync metadata
 *
 * Backed by JSON files in .dev/ directory
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const devDbDir = path.join(__dirname, '../../.dev')

// Ensure .dev directory exists
if (!fs.existsSync(devDbDir)) {
  fs.mkdirSync(devDbDir, { recursive: true })
}

/**
 * Dev Database API
 */
const devDb = {
  /**
   * Get all problems with their visualization status
   */
  async getAllProblems() {
    const cacheFile = path.join(devDbDir, 'problems.json')
    if (fs.existsSync(cacheFile)) {
      const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
      return data
    }
    return null
  },

  /**
   * Save problems cache
   */
  async saveProblems(problems) {
    const cacheFile = path.join(devDbDir, 'problems.json')
    fs.writeFileSync(cacheFile, JSON.stringify(problems, null, 2))
    return cacheFile
  },

  /**
   * Get unsolved problems list
   */
  async getUnsolved() {
    const cacheFile = path.join(devDbDir, 'unsolved.json')
    if (fs.existsSync(cacheFile)) {
      const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
      return data
    }
    return null
  },

  /**
   * Save unsolved problems list
   */
  async saveUnsolved(unsolved) {
    const cacheFile = path.join(devDbDir, 'unsolved.json')
    fs.writeFileSync(cacheFile, JSON.stringify(unsolved, null, 2))
    return cacheFile
  },

  /**
   * Get sync metadata
   */
  async getSyncMeta() {
    const metaFile = path.join(devDbDir, 'sync-meta.json')
    if (fs.existsSync(metaFile)) {
      const data = JSON.parse(fs.readFileSync(metaFile, 'utf8'))
      return data
    }
    return null
  },

  /**
   * Save sync metadata
   */
  async saveSyncMeta(meta) {
    const metaFile = path.join(devDbDir, 'sync-meta.json')
    fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2))
    return metaFile
  },

  /**
   * Check if problem is solved (from cache)
   */
  async isProblemSolved(slug) {
    const problems = await this.getAllProblems()
    if (!problems) return null
    const problem = problems.find(p => p.slug === slug)
    return problem ? problem.solved : null
  },

  /**
   * Get quick stats
   */
  async getStats() {
    const meta = await this.getSyncMeta()
    if (!meta) return null
    return {
      total: meta.total || 0,
      solved: meta.solved || 0,
      unsolved: meta.unsolved || 0,
      percentComplete: meta.percentComplete || 0,
      lastSync: meta.lastSync,
    }
  },

  /**
   * Clear all cache
   */
  async clearCache() {
    if (fs.existsSync(devDbDir)) {
      fs.rmSync(devDbDir, { recursive: true })
    }
  },
}

export default devDb
