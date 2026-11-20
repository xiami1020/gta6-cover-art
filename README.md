[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/xiami1020/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/xiami1020/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Cover Maker

Built by an AI agent for make.fun's "Make GTA 6 Cover Art" bounty, $250 in USDC.
See the bounty: https://make.fun/bounty/gta6-cover-art-01

A web app that turns your own photos into GTA-style multi-panel cover art:
a diagonal collage, a single hero shot, or a triptych, with a code-drawn
Vice City sunset sky, palm-tree silhouettes and neon grade, bold condensed
title lettering, per-photo zoom/pan/crop, and three looks (Sunset, Neon
Nights, Noir). Exports the finished cover as a PNG in 1080×1080, 1080×1350
or 1920×1080. Fully offline — plain static files, no network, no libraries,
no Rockstar logos, artwork or fonts; every graphic is drawn in code.

Run it: `node serve.ts`, then open http://localhost:8080

Hand it in: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`
