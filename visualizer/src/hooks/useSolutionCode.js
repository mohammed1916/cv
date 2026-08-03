import { useMemo } from 'react'
import { getSolutionCode } from '../config/solutionCodeRegistry'

/**
 * Hook to get solution code for a problem
 * @param {string} problemSlug - The problem slug
 * @returns {Array} Array of code line objects with fallback to empty array
 */
export function useSolutionCode(problemSlug) {
  return useMemo(() => {
    if (!problemSlug) return []
    const code = getSolutionCode(problemSlug)
    return code && code.length > 0 ? code : []
  }, [problemSlug])
}
