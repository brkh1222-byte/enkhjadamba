# Enkh Jadamba's website

A math-themed personal site: olympiad math notes, English grammar notes, and a cake bakery gallery.
Plain HTML/CSS/JS, so there's no build step. Open `index.html` in a browser, or run:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Pages
| File | What's on it |
|---|---|
| `index.html` | Home, topic cards, fun-fact generator |
| `math.html` | 11 olympiad topics, each with a key idea + practice problem (answers hidden) |
| `english.html` | Grammar notes + clickable mini quiz |
| `bakery.html` | Photo gallery with filters, recipe scaler, math-in-the-kitchen |

## Adding a cake photo
1. Put the photo in `images/cakes/` (e.g. `images/cakes/my-cake.jpg`).
2. Open `js/cakes.js` and add a block:
   ```js
   {
     title: "My Cake",
     image: "images/cakes/my-cake.jpg",
     category: "birthday",   // birthday, chocolate, fruit, cupcakes (or a new one)
     date: "2026-10",
     text: "A sentence about it."
   },
   ```
The `.svg` files there now are drawn placeholders. Replace or delete them once real photos are in.

## Adding more
- **Math topic:** copy an `<article class="card lesson">` block in `math.html` and add a link to it in the `.toc`.
- **Quiz question / fun fact:** edit the `QUIZ` or `FACTS` lists in `js/main.js`.
