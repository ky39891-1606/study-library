STUDY LIBRARY — FIX PACKAGE

Files:
- index.html: Static Study Library batch explorer.

What works in this package:
- Batch search, pagination, thumbnails, and clickable batch cards.
- Batch details modal with batch ID and copy button.
- Optional playback of an authorized direct MP4/WebM URL or YouTube embed URL supplied by the user.
- Uses included batch metadata as fallback if the live batch JSON source fails.

Important limitation:
- The batch JSON endpoint supplies batch metadata, not the complete lesson list or protected video URLs.
- GitHub Pages is static hosting and does not run a /api/data backend. Therefore this package cannot truthfully promise that every paid/protected lecture will play until an authorized lecture API/backend is configured.
- Canceled classes with blank URLs cannot be played from their schedule record.
- Do not put passwords, cookies, session tokens, or API secrets into this HTML or a public GitHub repository.

Deploy:
1. Extract this ZIP.
2. In the GitHub repository, replace the existing index.html with this index.html.
3. Commit/push the change and wait for GitHub Pages to redeploy.
4. Open the Pages site and test batch search/details.
5. To play a video, use a direct video link you are authorized to access; protected platform links should be opened on the official platform.
