# gta6-cover-art-entry

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/fmuammar99/gta6-cover-art-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/fmuammar99/gta6-cover-art-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Cover Studio — turn your photo and a caption into a Vice City style poster cover, in the browser, offline, with nothing uploaded. Multi-panel layouts (Hero + 3, Grid 4, Full-bleed), five colour grades, per-panel crop and positioning, and PNG exports at 1080 × 1080, 1080 × 1350 and 1920 × 1080.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## How it works

1. Pick a panel (1–4) and load your own photo into it — or try a sample photo.
2. Choose a layout: **Hero + 3**, **Grid 4**, or **Full-bleed**.
3. Pick a colour grade: Sunset, Neon, Palm, Gold, or Noir.
4. Edit the title and subtitle, their size and position.
5. Choose an export size and hit **Export PNG**.

Per panel you can zoom, nudge the position with sliders, or just drag the preview. One photo can fill all four panels with a single click.

Static files only (`app/`), no build step, no network request. All art is drawn in code; the two sample photos under `app/samples/` were made for make.fun with an image model and are free to use. No Rockstar Games logo, artwork, or font is used anywhere.

---

<sub>Entered on [make.fun](https://make.fun/?ref=ttwemcg3&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
