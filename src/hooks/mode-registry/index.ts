/**
 * Mode Registry
 *
 * Centralized configuration and utilities for OMC execution mode state files.
 * All modes store state in `.omc/state/` subdirectory for consistency.
 */

import { existsSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Supported execution modes
 */
export type ExecutionMode =
  | 'autopilot'
  | 'ralph'
  | 'ultrawork'
  | 'ultraqa'
  | 'ultrapilot'
  | 'swarm'
  | 'pipeline'
  | 'ecomode';

/**
 * Mode configuration
 */
export interface ModeConfig {
  /** State file name (relative to .omc/state/) */
  stateFile: string;
  /** Optional marker file for additional state */
  markerFile?: string;
  /** Whether this mode has a global state file in ~/.claude/ */
  hasGlobalState?: boolean;
}

/**
 * Configuration for all execution modes
 * All state files are stored in `.omc/state/` subdirectory
 */
export const MODE_CONFIGS: Record<ExecutionMode, ModeConfig> = {
  autopilot: {
    stateFile: 'autopilot-state.json'
  },
  ralph: {
    stateFile: 'ralph-state.json',
    markerFile: 'ralph-verification.json',
    hasGlobalState: true
  },
  ultrawork: {
    stateFile: 'ultrawork-state.json',
    hasGlobalState: true
  },
  ultraqa: {
    stateFile: 'ultraqa-state.json'
  },
  ultrapilot: {
    stateFile: 'ultrapilot-state.json',
    markerFile: 'ultrapilot-ownership.json'
  },
  swarm: {
    stateFile: 'swarm-state.json',
    markerFile: 'swarm-tasks.json'
  },
  pipeline: {
    stateFile: 'pipeline-state.json'
  },
  ecomode: {
    stateFile: 'ecomode-state.json',
    hasGlobalState: true
  }
};

/**
 * Get the state directory path
 */
export function getStateDir(cwd: string): string {
  return join(cwd, '.omc', 'state');
}

/**
 * Ensure the state directory exists
 */
export function ensureStateDir(cwd: string): void {
  const stateDir = getStateDir(cwd);
  if (!existsSync(stateDir)) {
    mkdirSync(stateDir, { recursive: true });
  }
}

/**
 * Get the state file path for a mode
 */
export function getStateFilePath(cwd: string, mode: ExecutionMode): string {
  const config = MODE_CONFIGS[mode];
  return join(getStateDir(cwd), config.stateFile);
}

/**
 * Get the marker file path for a mode (if applicable)
 */
export function getMarkerFilePath(cwd: string, mode: ExecutionMode): string | null {
  const config = MODE_CONFIGS[mode];
  if (!config.markerFile) {
    return null;
  }
  return join(getStateDir(cwd), config.markerFile);
}

/**
 * Get the global state file path (in ~/.claude/) for modes that support it
 */
export function getGlobalStateFilePath(mode: ExecutionMode): string | null {
  const config = MODE_CONFIGS[mode];
  if (!config.hasGlobalState) {
    return null;
  }
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  return join(homeDir, '.claude', config.stateFile);
}

/**
 * Clear all state files for a mode
 *
 * Deletes:
 * - Local state file (.omc/state/{mode}-state.json)
 * - Local marker file if applicable
 * - Global state file if applicable (~/.claude/{mode}-state.json)
 *
 * @returns true if all files were deleted successfully (or didn't exist)
 */
export function clearModeState(mode: ExecutionMode, cwd: string): boolean {
  const config = MODE_CONFIGS[mode];
  let success = true;

  // Delete local state file
  const stateFile = getStateFilePath(cwd, mode);
  if (existsSync(stateFile)) {
    try {
      unlinkSync(stateFile);
    } catch {
      success = false;
    }
  }

  // Delete marker file if applicable
  const markerFile = getMarkerFilePath(cwd, mode);
  if (markerFile && existsSync(markerFile)) {
    try {
      unlinkSync(markerFile);
    } catch {
      success = false;
    }
  }

  // Delete global state file if applicable
  const globalFile = getGlobalStateFilePath(mode);
  if (globalFile && existsSync(globalFile)) {
    try {
      unlinkSync(globalFile);
    } catch {
      success = false;
    }
  }

  return success;
}

/**
 * Check if a mode has active state (file exists)
 */
export function hasModeState(cwd: string, mode: ExecutionMode): boolean {
  const stateFile = getStateFilePath(cwd, mode);
  return existsSync(stateFile);
}

/**
 * Get all modes that currently have state files
 */
export function getActiveModes(cwd: string): ExecutionMode[] {
  const modes: ExecutionMode[] = [];

  for (const mode of Object.keys(MODE_CONFIGS) as ExecutionMode[]) {
    if (hasModeState(cwd, mode)) {
      modes.push(mode);
    }
  }

  return modes;
}

/**
 * Clear all mode states (force clear)
 */
export function clearAllModeStates(cwd: string): boolean {
  let success = true;

  for (const mode of Object.keys(MODE_CONFIGS) as ExecutionMode[]) {
    if (!clearModeState(mode, cwd)) {
      success = false;
    }
  }

  return success;
}
