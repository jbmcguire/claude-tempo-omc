/**
 * Sisyphus HUD - Agents Element
 *
 * Renders active agent count display.
 */

import type { ActiveAgent } from '../types.js';
import { cyan, dim, RESET } from '../colors.js';

const CYAN = '\x1b[36m';

/**
 * Render active agent count.
 * Returns null if no agents are running.
 *
 * Format: agents:2
 */
export function renderAgents(agents: ActiveAgent[]): string | null {
  const running = agents.filter((a) => a.status === 'running').length;

  if (running === 0) {
    return null;
  }

  return `agents:${CYAN}${running}${RESET}`;
}

/**
 * Render detailed agent list (for full mode).
 *
 * Format: agents:[explore,oracle]
 */
export function renderAgentsDetailed(agents: ActiveAgent[]): string | null {
  const running = agents.filter((a) => a.status === 'running');

  if (running.length === 0) {
    return null;
  }

  // Extract short agent type names
  const names = running.map((a) => {
    // Extract last part of agent type (e.g., "oh-my-claude-sisyphus:explore" -> "explore")
    const parts = a.type.split(':');
    return parts[parts.length - 1] || a.type;
  });

  return `agents:[${CYAN}${names.join(',')}${RESET}]`;
}
