# Where to? — Restaurant picker

A dependency-free website for choosing from 18 restaurants near Sully Elementary
in Sterling, Virginia. Spin the animated wheel or switch to **All restaurants**
for the full table. Search and cuisine, distance, price, dining, open-now, and
time filters apply to both views. Each matching restaurant has an equal chance
on the wheel.

## Run locally

From the repository directory, serve the static files:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. No install or build step is required. Any static web
host can serve these files; keep `index.html`, `styles.css`, `app.js`, and
`restaurants.js` together. This also works under a subdirectory.

## Tests

With Node.js 18 or later:

```sh
npm test
```

## Data and design

Restaurant details come from the supplied list, not a live service. Prices and
hours should be confirmed before visiting. Distance filters use the **upper end**
of each approximate driving range (so ~3–5 mi matches “Within ~5 mi”). Price
filters include both tiers of ranges such as $$–$$$. All listed spots support
eat-in; takeout excludes Heirloom and Urban Hot Pot Mosaic.

The full restaurant rows take precedence over the summary's conflicting Cozmo
One distance. Address `#` references are displayed as suite numbers.

Design follows [Hallmark](https://github.com/Nutlope/hallmark)'s principles:
distinctive editorial structure, restrained named color/type tokens, honest
copy, responsive layouts, visible keyboard focus, and reduced-motion support.