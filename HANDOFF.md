# Handoff brief: AI Agent Orchestra participant flipbook (Coders Club)

## What exists
- `AI-Agent-Orchestra-Participants-Flipbook.html`: single offline file (fonts, your hero video and poster are embedded). 10 pages: cover (your video), welcome, three movements, Movement 1, Movement 2, what makes an agent, Movement 3, resources, next steps, back cover.
- `AI-Agent-Orchestra-Participants-Guide.pdf`: static 10-page version (cover uses a still from your video).
- `flipbook-source.zip`: template.html (pages + CSS), app.js (book engine + particles), build.js, assets/ (hero.webm, poster.jpg), fonts/.

## How the book works (app.js)
- Own 3D page turn (no library). Each leaf is a div with a front and back face, rotated with rotateY, angle animated per frame.
- Zoom and pan live on #zoom, separate from the page turn, so turning pages never changes zoom (checked: scale stays 2.25 through a turn).
- Desktop: two-page spreads. Narrow/portrait screens: one page at a time.
- Controls: drag a page, tap the outer thirds, arrow keys, side arrows, toolbar, contents list. Double-tap or pinch to zoom, +/- keys, 0 resets, F = fullscreen.
- Canvas layer: vector music notes, code tokens, cherry-blossom petals, fireflies, silk threads (one red), a burst on page turn, pointer trail.
- Page entrance animations run when a page becomes visible (class `vis`).

## Rebuild
`node build.js` (inlines fonts, poster, video, app.js into dist/*.html).
PDF: open `dist/...Flipbook.html#print` in Chromium, wait for `body[data-ready]`, print to 600x840 px pages with backgrounds (see pdf.js in the working folder).
Edit page text in template.html, section by section (each `<section class="pg">`).

## Known gaps
- Registration link is not a real URL yet (cover and back cover say "link on the posters").
- Dates and venue are "to be announced" (as in the proposal).
- Tested in headless Chromium only (desktop 1440x900 and phone 390x844). Not tested on a real touch device. Old Safari without WebM VP9 shows the still poster instead of the video.
- Movement 3 "Hackathon brief" file does not exist yet.

## Other open work: the event website (not finished)
- Folder: scratchpad/build3 (template.html, build.js, out/entry.js with GhostFibers, FlyingButton, Glass folder cards bundled via esbuild).
- Built to dist/index.html and hero looks right at 1440 and 390 widths. Full-page screenshot and the rest of the sections (score tabs, register button, folders) are not yet visually checked. Resources folder links point to resources/*.html (files from files.zip).
- Still to do: screenshots at 360, 768, 1024, 1920, 2560x1080 and 844x390; check open-folder state; replace REG_URL placeholder; zip index.html with resources/.
