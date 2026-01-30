import { contextCollector } from '../../features/context-injector/index.js';
import { getSisyphusConfig } from '../../features/auto-update.js';
import { BEADS_INSTRUCTIONS, BEADS_RUST_INSTRUCTIONS } from './constants.js';
import type { TaskTool, BeadsContextConfig } from './types.js';

export type { TaskTool, BeadsContextConfig } from './types.js';
export { BEADS_INSTRUCTIONS, BEADS_RUST_INSTRUCTIONS } from './constants.js';

/**
 * Get beads instructions for the given tool variant.
 */
export function getBeadsInstructions(tool: 'beads' | 'beads-rust'): string {
  return tool === 'beads' ? BEADS_INSTRUCTIONS : BEADS_RUST_INSTRUCTIONS;
}

/**
 * Read beads context config from omc-config.json.
 */
export function getBeadsContextConfig(): BeadsContextConfig {
  const config = getSisyphusConfig();
  return {
    taskTool: config.taskTool ?? 'builtin',
    injectInstructions: config.taskToolConfig?.injectInstructions ?? true,
    useMcp: config.taskToolConfig?.useMcp ?? false,
  };
}

/**
 * Register beads context for a session.
 * Called from setup hook on session init.
 */
export function registerBeadsContext(sessionId: string): boolean {
  const config = getBeadsContextConfig();

  if (config.taskTool === 'builtin' || !config.injectInstructions) {
    return false;
  }

  const instructions = getBeadsInstructions(config.taskTool);

  contextCollector.register(sessionId, {
    id: 'beads-instructions',
    source: 'beads',
    content: instructions,
    priority: 'normal',
  });

  return true;
}

/**
 * Clear beads context for a session.
 */
export function clearBeadsContext(sessionId: string): void {
  contextCollector.removeEntry(sessionId, 'beads', 'beads-instructions');
}
