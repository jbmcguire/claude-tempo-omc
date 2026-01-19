---
description: Configure HUD display options (layout, presets, display elements)
---

# Sisyphus HUD Configuration

$ARGUMENTS

Configure the Sisyphus HUD (Heads-Up Display) for the statusline.

## Quick Commands

| Command | Description |
|---------|-------------|
| `/hud` | Show current HUD status |
| `/hud minimal` | Switch to minimal display |
| `/hud focused` | Switch to focused display (default) |
| `/hud full` | Switch to full display |
| `/hud status` | Show detailed HUD status |

## Display Presets

### Minimal
Shows only the essentials:
```
[SISYPHUS] ralph | ultrawork | todos:2/5
```

### Focused (Default)
Shows all relevant elements:
```
[SISYPHUS] ralph:3/10 | US-002 | ultrawork | ctx:67% | agents:2 | bg:3/5 | todos:2/5
```

### Full
Shows everything including model info and detailed progress:
```
[SISYPHUS] ralph:3/10 | US-002 (2/5) | ultrawork | ctx:[████░░]67% | agents:[explore,oracle] | bg:3/5 | todos:2/5 "Implementing..."
```

## Display Elements

| Element | Description |
|---------|-------------|
| `[SISYPHUS]` | Mode identifier |
| `ralph:3/10` | Ralph loop iteration/max |
| `US-002` | Current PRD story ID |
| `ultrawork` | Active skill badge |
| `ctx:67%` | Context window usage |
| `agents:2` | Running subagent count |
| `bg:3/5` | Background task slots |
| `todos:2/5` | Todo completion |

## Color Coding

- **Green**: Normal/healthy
- **Yellow**: Warning (context >70%, ralph >7)
- **Red**: Critical (context >85%, ralph at max)

## Configuration Location

HUD config is stored at: `~/.claude/.sisyphus/hud-config.json`

## Manual Configuration

You can manually edit the config file:

```json
{
  "preset": "focused",
  "elements": {
    "sisyphusLabel": true,
    "ralph": true,
    "prdStory": true,
    "activeSkills": true,
    "contextBar": true,
    "agents": true,
    "backgroundTasks": true,
    "todos": true
  },
  "thresholds": {
    "contextWarning": 70,
    "contextCritical": 85,
    "ralphWarning": 7
  }
}
```

## Troubleshooting

If the HUD is not showing:
1. Check settings.json has statusLine configured
2. Run `/doctor` to check installation
3. Verify HUD script exists at `~/.claude/hud/sisyphus-hud.js`

---

*The HUD updates automatically every ~300ms during active sessions.*
