# BigBrain Hackathon 2026

Website for the BigBrain Hackathon — 18–19 October 2026, de Grandpré Communications Centre,
Montreal Neurological Institute, Montréal.

Static HTML, CSS, and vanilla JS. No build step, no dependencies, no framework. Edit
`index.html` and push; GitHub Pages serves it. Project pitches arrive as GitHub issues and
appear on the site automatically.

---

## 1. Put it on GitHub

```bash
cd bigbrain-hackathon-2026
git init -b main
git add .
git commit -m "BigBrain Hackathon 2026 website"
git remote add origin https://github.com/OWNER/bigbrain-hackathon-2026.git
git push -u origin main
```

## 2. Turn on Pages

**Settings → Pages → Build and deployment → Source: GitHub Actions.**

That's it — `.github/workflows/deploy.yml` does the rest. The site lands at
`https://OWNER.github.io/bigbrain-hackathon-2026/`.

## 3. Fill in the three blanks

All of the site's configuration lives in one block near the top of `index.html`:

```js
window.SITE = {
  repo: "OWNER/bigbrain-hackathon-2026",   // your GitHub owner/repo
  projectLabel: "Project",                 // leave as is unless you rename the label
  registrationUrl: "#"                     // your registration form URL
};
```

Until `registrationUrl` is a real URL, the Register buttons are disabled and the page says
registration opens soon. Paste the link and they light up.

Two more things to replace by hand:

| What | Where |
| --- | --- |
| Contact email (`CONTACT@EXAMPLE.ORG`) | footer of `index.html` |
| Registration link for the issue sidebar | `.github/ISSUE_TEMPLATE/config.yml` |

## 4. Create the label

Create an issue label called **`Project`** (Issues → Labels → New label). The issue form
applies it automatically, but the label has to exist first.

## 5. Sponsor logos

`assets/img/sponsor-dell.svg` and `assets/img/sponsor-nvidia.svg` are dashed placeholders.
Replace them with the official artwork Dell and NVIDIA supply — keep the filenames and the
site picks them up. Ask your sponsor contacts for their brand kits; both companies have
usage rules about clear space, colour, and minimum size.

---

## How project pitches work

1. Someone opens an issue using the **Project pitch** form. It gets the `Project` label.
2. The `issues` trigger in `deploy.yml` fires.
3. `scripts/sync-projects.mjs` reads every open issue with that label, parses the form
   fields out of the issue body, and writes `projects.json`.
4. The site is redeployed, and the project appears in the grid.

Editing an issue updates the card. Closing an issue removes it. Nobody has to touch the repo.

If the Action hasn't run yet, the page falls back to calling the public GitHub API from the
browser, so a fresh pitch shows up even before the next deploy.

To test the sync locally:

```bash
GITHUB_REPOSITORY=OWNER/bigbrain-hackathon-2026 node scripts/sync-projects.mjs
```

## Running the site locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

A plain `file://` open works too, but `projects.json` won't load — browsers block `fetch`
on local files.

---

## Editing the content

Everything is in `index.html`, in the order it appears on the page:

- **Hero** — dates, venue, seat count
- **Compute** — Dell and NVIDIA, the twenty GB10 workstations, the prize
- **About** — what the hackathon is, the theme list, the link to the BigBrain Workshop
- **Projects** — copy around the pitch grid; the grid itself is generated
- **Schedule** — the two-day agenda, currently marked provisional
- **Venue** — address, transit, accessibility, what to bring
- **Register** — the seat cap and the call to action

Colours and type live at the top of `assets/css/style.css` as CSS custom properties. The
palette is drawn from the material: the mulberry of a Merker-stained section, silver-nitrate
greys, an aged label gold for the prize.

## A note on the seat count

McGill lists the de Grandpré Communications Centre at 76 seats. The site says 80 because
that's the number you gave us. Worth a check with the room booking before registration opens
— it's a one-word edit in `index.html` either way.

## Licence

Code is MIT. Content and copy are CC BY 4.0. See `LICENSE`.
