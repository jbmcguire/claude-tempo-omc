/**
 * Sisyphus HUD - Skills Element
 *
 * Renders active skills badge (ultrawork, ralph mode indicators).
 */

import type { UltraworkStateForHud, RalphStateForHud } from '../types.js';
import { RESET } from '../colors.js';

const MAGENTA = '\x1b[35m';
const BRIGHT_MAGENTA = '\x1b[95m';

/**
 * Render active skill badges.
 * Returns null if no skills are active.
 *
 * Format: ultrawork or ultrawork-ralph
 */
export function renderSkills(
  ultrawork: UltraworkStateForHud | null,
  ralph: RalphStateForHud | null
): string | null {
  const skills: string[] = [];

  // Check ultrawork
  if (ultrawork?.active) {
    skills.push('ultrawork');
  }

  // Check ralph (but don't duplicate if both active as "ultrawork-ralph")
  if (ralph?.active && ultrawork?.active) {
    // Combined mode
    return `${BRIGHT_MAGENTA}ultrawork-ralph${RESET}`;
  }

  if (ultrawork?.active) {
    return `${MAGENTA}ultrawork${RESET}`;
  }

  if (ralph?.active) {
    return `${MAGENTA}ralph${RESET}`;
  }

  return null;
}

/**
 * Render skill with reinforcement count (for debugging).
 *
 * Format: ultrawork(r3)
 */
export function renderSkillsWithReinforcement(
  ultrawork: UltraworkStateForHud | null,
  ralph: RalphStateForHud | null
): string | null {
  if (!ultrawork?.active && !ralph?.active) {
    return null;
  }

  const parts: string[] = [];

  if (ultrawork?.active) {
    const reinforcement =
      ultrawork.reinforcementCount > 0 ? `(r${ultrawork.reinforcementCount})` : '';
    parts.push(`ultrawork${reinforcement}`);
  }

  if (ralph?.active) {
    parts.push('ralph');
  }

  return `${MAGENTA}${parts.join('-')}${RESET}`;
}
