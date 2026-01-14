---
description: Set Sisyphus as your default operating mode
---

$ARGUMENTS

## Task: Configure Sisyphus as Default Operating Mode

You MUST perform the following steps to fully configure Sisyphus:

### Step 1: Update CLAUDE.md

Fetch the latest CLAUDE.md content from GitHub and write it to `~/.claude/CLAUDE.md`.

**Method A (Recommended):** Use WebFetch to get the raw content:
```
WebFetch(url: "https://raw.githubusercontent.com/Yeachan-Heo/oh-my-claude-sisyphus/main/docs/CLAUDE.md", prompt: "Extract the complete markdown content")
```

Then use the Write tool to write the fetched content to `~/.claude/CLAUDE.md`.

**Method B (Fallback):** If WebFetch fails, tell the user to:
1. Open: https://github.com/Yeachan-Heo/oh-my-claude-sisyphus/blob/main/docs/CLAUDE.md
2. Click "Raw" button to see raw content
3. Copy the entire content
4. Save it to `~/.claude/CLAUDE.md`

**IMPORTANT**: First read `~/.claude/CLAUDE.md` to check if it exists. If it exists and contains other user content, APPEND the Sisyphus section. If it only contains old Sisyphus content or doesn't exist, replace it entirely.

### Step 2: Install Hook Scripts

After updating CLAUDE.md, you MUST also install the bash hook scripts to `~/.claude/hooks/`. This ensures compatibility with both plugin and curl installations.

1. Create the hooks directory:
```bash
mkdir -p ~/.claude/hooks
```

2. Copy the following bash scripts from the plugin to `~/.claude/hooks/`:

Use the Read tool to read each script from the plugin's `hooks/` directory, and use Write tool to write them to `~/.claude/hooks/`:
- Read plugin's `hooks/keyword-detector.sh` → Write to `~/.claude/hooks/keyword-detector.sh`
- Read plugin's `hooks/stop-continuation.sh` → Write to `~/.claude/hooks/stop-continuation.sh`
- Read plugin's `hooks/persistent-mode.sh` → Write to `~/.claude/hooks/persistent-mode.sh`
- Read plugin's `hooks/session-start.sh` → Write to `~/.claude/hooks/session-start.sh`

3. After writing, make them executable:
```bash
chmod +x ~/.claude/hooks/*.sh
```

### Step 3: Confirm Installation

After successfully completing all steps, confirm to the user:
- CLAUDE.md has been updated with the latest Sisyphus configuration
- Hook scripts have been installed to ~/.claude/hooks/
- 19 agents are now available (11 base + 8 tiered variants)
- Smart model routing is configured for token savings
- Both plugin and curl installations are now compatible
