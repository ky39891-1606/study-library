# Study Library — GitHub Pages files

This is a static website package generated from the user's supplied batch metadata.

## Files
- `index.html` — main page
- `styles.css` — responsive layout and design
- `app.js` — loads and searches the batch metadata
- `data/batches.json` — 4,741 unique batch metadata entries extracted from the supplied text

## Publish on GitHub Pages
1. Create a GitHub repository.
2. Upload **all files and folders**, keeping the `data` folder in the repository root.
3. Ensure the main HTML file is named `index.html`.
4. Open **Settings → Pages**.
5. Select **Deploy from a branch**, branch `main`, folder `/(root)`, then Save.
6. Wait for deployment and open the published site.

## Important limitations
- GitHub Pages serves static files only. It does not run `/api/batches`, `/api/data`, or any other private backend route.
- This package displays batch metadata only. It does not contain actual lecture lists or video URLs.
- To add lecture details or playback, configure an API you own or are authorized to use. Do not put secret API keys in frontend JavaScript or a public repository.
- This package does not bypass another service's login, subscription, or access restrictions.
