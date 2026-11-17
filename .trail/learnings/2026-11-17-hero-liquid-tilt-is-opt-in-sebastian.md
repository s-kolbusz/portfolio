---
title: "Hero liquid tilt is opt-in with a button; straight means however the device was held when it was turned on, and flow speed follows the angle"
author: Sebastian
date: 2026-11-17
branch: redesign/decyzje
cost: { minutes: 29, tokens: 330473 }
id: l-2565e381
scope: repo
status: active
src: agent
touches:
  - cook/ciecz-czastki/index.html
  - cook/ciecz-czastki/package.json
  - cook/ciecz-czastki/sim.js
  - cook/ciecz-czastki/test-sim.mjs
  - cook/ciecz-czastki/worker.js
  - cook/fonts/mattone/LICENSE.txt
  - cook/fonts/mattone/Mattone-Black.woff2
  - cook/fonts/mattone/Mattone-Bold.woff2
  - cook/fonts/mattone/Mattone-Regular.woff2
  - cook/fonts/mattone/mattone-black.css
---

## Decided
- On 2026-11-17 the owner accepted tilt on the hero test page, saying it was "much better". Its rules:
  - Tilt starts only from a visible TILT button, never automatically. iOS needs permission for the motion sensor, and a hidden effect read as random.
  - The resting position is however the device is held at the moment TILT is enabled. Nobody holds a tablet or phone flat. The same rule applies on the phone and on the tablet.
  - The liquid flows the way the device is tipped from that position, faster the further it is tipped. Roughly: 10° moves it about 12% of the screen width per second, and 35° takes it to the edge in about a second.
- The three lines start with "Nothing off the shelf.", and the page returns to that line when it settles. It is literally the first line, not just highlighted. Phones show only the current line.

## Tried and ruled out
- Reading the tilt angles from the device's motion sensor as two independent sliders. Turning the device 45° left sent the liquid up, and turning it right sent it down. The fix was to compute the direction of gravity in the device's frame and take its difference from the resting position.
- Measuring tilt from a flat resting position. Rejected, because nobody holds the device flat.
- Keeping the strong damping on the whole body while tilt is on. It capped the liquid at a constant, very slow speed whatever the angle.
- Starting the three lines on "I take things apart." with a 7-second return. On touch devices it looked stuck on that line.

## Watch out
- iOS only gives the motion sensor to HTTPS pages, so the button appears only in a secure context. Test over Tailscale https on port 8443, not over plain-http LAN.
- The cook/ folder is excluded in .git/info/exclude. The accepted page was force-added (`git add -f`) in commit 1b4babab. New files there stay untracked unless they are force-added too.

In the code:
- cook/ciecz-czastki/index.html, functions down(), onOrient() and setTilt().
  - Gravity direction: down = (sinγ·cosβ, −sinβ, −cosγ·cosβ).
  - The resting position is captured from the first reading after TILT is enabled.
  - The difference is rotated by window.orientation.
  - Dead zone 0.05, smoothing 0.25, gain 0.006.
- While TILT is on: anchor 0.00002, anchorDamp 0.003. While off: anchor 0.00008, anchorDamp 0.02. anchorDamp is read in sim.js.
