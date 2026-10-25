# AI Agent Orchestra — Audio Assets & Sound Architecture

This directory houses the cinematic audio assets for the AI Agent Orchestra phone-first experience.

## Master Soundtrack & Stinger Mapping

| File | Purpose | Specification Mapping |
| :--- | :--- | :--- |
| `enter-pharloom.mp3` | **Background Ambient Soundtrack** | Hollow Knight / Silksong orchestral theme ("Enter Pharloom"). Loops seamlessly during the experience, swelling in volume from Movement I (piano) to Movement III (forte), and ducking by 40% during dramatic stingers. |
| `dream-charge.wav` | **Tap & Hold Charge** | Dream nail resonance that charges up while holding the ignition ring or tapping & holding scenes. |
| `dream-slash.wav` | **Ignition Hit / Downbeat Slash** | Impactful downbeat hit that triggers at 100% ignition completion with a 120ms freeze. |
| `dream-enter.wav` | **Radial Light Flood Transition** | Deep ethereal bloom playing as radial light expands across the screen to reveal the prologue. |
| `dream-enter-pt2.wav` | **Prologue & Movement Reveal** | Melodic orchestral chime for prologue entry and movement transitions. |
| `ui-confirm.wav` | **UI Button Confirm** | Crisp feedback sound on clicking buttons (sound toggle, skip intro, nav links, movement beads, folders). |

## Build Command
```bash
npm run build
```

## Running Dev Server
```bash
npm run dev
```
