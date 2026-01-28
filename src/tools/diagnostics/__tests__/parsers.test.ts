/**
 * Unit tests for diagnostic output parsers
 */

import { describe, it, expect } from 'vitest';
import { parseGoOutput } from '../go-runner.js';
import { parseTscOutput } from '../tsc-runner.js';
import { parseRustOutput } from '../rust-runner.js';
import { parseMypyOutput, parsePylintOutput } from '../python-runner.js';

describe('parseGoOutput', () => {
  it('parses go vet output correctly', () => {
    const output = `main.go:10:5: unreachable code
pkg/util.go:25:12: result of fmt.Sprintf call not used`;

    const result = parseGoOutput(output);

    expect(result.diagnostics).toHaveLength(2);
    expect(result.diagnostics[0]).toMatchObject({
      file: 'main.go',
      line: 10,
      column: 5,
      message: 'unreachable code',
      severity: 'warning'
    });
    expect(result.warningCount).toBe(2);
  });

  it('returns empty for clean output', () => {
    const result = parseGoOutput('');
    expect(result.diagnostics).toHaveLength(0);
    expect(result.success).toBe(true);
  });
});

describe('parseTscOutput', () => {
  it('parses tsc errors correctly', () => {
    const output = `src/index.ts(10,5): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
src/utils.ts(25,12): error TS2304: Cannot find name 'foo'.`;

    const result = parseTscOutput(output);

    expect(result.diagnostics).toHaveLength(2);
    expect(result.errorCount).toBe(2);
    expect(result.warningCount).toBe(0);
    expect(result.success).toBe(false);
    expect(result.diagnostics[0]).toMatchObject({
      file: 'src/index.ts',
      line: 10,
      column: 5,
      code: 'TS2345',
      severity: 'error',
      message: "Argument of type 'string' is not assignable to parameter of type 'number'."
    });
  });

  it('parses tsc warnings correctly', () => {
    const output = `src/index.ts(5,1): warning TS6133: 'x' is declared but its value is never read.`;

    const result = parseTscOutput(output);

    expect(result.diagnostics).toHaveLength(1);
    expect(result.errorCount).toBe(0);
    expect(result.warningCount).toBe(1);
    expect(result.success).toBe(true);
  });

  it('returns empty for clean output', () => {
    const result = parseTscOutput('');
    expect(result.diagnostics).toHaveLength(0);
    expect(result.success).toBe(true);
  });
});

describe('parseRustOutput', () => {
  it('parses cargo check errors', () => {
    const output = `error[E0382]: borrow of moved value: \`x\`
 --> src/main.rs:5:20
warning: unused variable: \`y\`
 --> src/lib.rs:10:9`;

    const result = parseRustOutput(output);

    expect(result.diagnostics).toHaveLength(2);
    expect(result.errorCount).toBe(1);
    expect(result.warningCount).toBe(1);
    expect(result.diagnostics[0]).toMatchObject({
      file: 'src/main.rs',
      line: 5,
      column: 20,
      code: 'E0382',
      severity: 'error'
    });
  });

  it('returns empty for clean output', () => {
    const result = parseRustOutput('');
    expect(result.diagnostics).toHaveLength(0);
    expect(result.success).toBe(true);
  });
});

describe('parseMypyOutput', () => {
  it('parses mypy errors', () => {
    const output = `main.py:10:5: error: Incompatible types [arg-type]
utils.py:25:1: warning: Unused variable [unused-variable]
main.py:15:1: note: See docs for details`;

    const result = parseMypyOutput(output);

    expect(result.diagnostics).toHaveLength(2); // note should be skipped
    expect(result.errorCount).toBe(1);
    expect(result.warningCount).toBe(1);
    expect(result.tool).toBe('mypy');
  });

  it('returns empty for clean output', () => {
    const result = parseMypyOutput('');
    expect(result.diagnostics).toHaveLength(0);
    expect(result.success).toBe(true);
  });
});

describe('parsePylintOutput', () => {
  it('parses pylint errors', () => {
    const output = `main.py:10:5: E0001: syntax error
main.py:20:0: W0611: Unused import`;

    const result = parsePylintOutput(output);

    expect(result.diagnostics).toHaveLength(2);
    expect(result.errorCount).toBe(1);
    expect(result.warningCount).toBe(1);
    expect(result.tool).toBe('pylint');
  });

  it('returns empty for clean output', () => {
    const result = parsePylintOutput('');
    expect(result.diagnostics).toHaveLength(0);
    expect(result.success).toBe(true);
  });
});
