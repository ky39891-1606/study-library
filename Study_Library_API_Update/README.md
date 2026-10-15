# Study Library — public batch list integration

## Included files
- `index.html` — responsive batch list and detail dialog
- `styles.css` — page styling
- `app.js` — attempts to read the public batch-list endpoint, then falls back to `data/batches.json` if browser CORS/API access is unavailable
- `data/batches.json` — bundled batch metadata
- `.github/workflows/pages.yml` — GitHub Pages deployment workflow

## What the provided ID means
`6779345c20fa0756e4a7fd08` is a batch ID in the bundled data (Lakshya JEE 2027). It is not an API key or video URL.

## Important limits
This site uses only the public batch-list endpoint `https://pw.studyparcham.in/api/batches?page=1&limit=10` without an access token. Browser access may fail if that service does not enable CORS; in that case, the site automatically uses the bundled data. A batch-list response does not contain authorized lesson/video links. Actual playback requires a documented official API or player URL that you are permitted to use. Do not put tokens, cookies, passwords, or secret API keys in a public GitHub repository.

## Publish
Upload/replace the contents at the repository root, keeping `.github/workflows/pages.yml` and `data/batches.json` at the paths shown here. In Settings → Pages, choose GitHub Actions as the source. Wait for the `Deploy Study Library` workflow to succeed.

Site: https://ky39891-1606.github.io/study-library/
