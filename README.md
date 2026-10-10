# Enkh Jadamba's website

A bright geometry-notebook site: olympiad math notes, English grammar notes, and a bakery corner.
Plain HTML/CSS/JS, so there's no build step. Live at https://brkh1222-byte.github.io/enkhjadamba/

Run locally:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Pages
| File | What's on it |
|---|---|
| `index.html` | Hero with a draggable triangle (angles always sum to 180°), about, section cards, problem of the day |
| `math.html` | 11 olympiad topics, each with a key idea + practice problem (answers hidden) |
| `english.html` | Grammar notes + clickable mini quiz |
| `bakery.html` | Favourite recipe with a scaler, math-in-the-kitchen, cake photos (coming soon) |

## Mongolian version
`mn/` has a full Mongolian (Cyrillic) copy of every page: `mn/index.html`, `mn/math.html`, `mn/english.html`, `mn/bakery.html`.
The МН / EN pill in the navbar switches between twins and keeps you on the same topic.

- Mongolian pages use **Onest** + **IBM Plex Mono**, because the English fonts have no Cyrillic (Mongolian needs Ө ө Ү ү).
- Text that comes from JavaScript (problem of the day, quiz score, recipe numbers) switches on `<html lang="mn">` in `js/main.js`. Numbers use a decimal comma (1,5).
- When you change a lesson in English, change its twin in `mn/` too. Section `id`s must stay the same in both.

Light theme only. Each page has its own accent colour: math = cobalt, english = mint, bakery = tangerine.

## Adding more
- **Math topic:** copy a `<section class="lesson">` block in `math.html` and add a link for it in the `.side` list.
- **Quiz question / daily problem:** edit the `QUIZ` or `POTD` (problem of the day) lists in `js/main.js`.
- **Cake photos:** replace the "Photos coming soon" line in `bakery.html`.
