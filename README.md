# Alter Ego Command Center

A separate 2027 calendar for Rora and Plix. Includes 1,095 shifts, DJ colors, Sunday Open Mic Night, attendance, cover staff, backups, reports and change history.

## How shared editing works

GitHub Pages hosts the website. A small Google Apps Script service saves the shared schedule in a private Google Drive file owned by Rora. Rora and Plix each sign into the website with a separate editor access key. **Plix needs neither GitHub nor Google to maintain the schedule.** The calendar can be viewed without signing in; only authenticated editors can save.

The workbook is the starting snapshot. Website changes do not write back into Excel. Failed saves keep the editor form open. Conflicting edits to the same field are rejected; independent changes are retained. The backend uses a lock and records which editor key made each change.

## One-time shared service setup

1. Under Rora’s Google account, create a standalone Apps Script project named Alter Ego Command Center.
2. Copy `backend/Code.gs` into Code.gs. Add a second script file named SeedData and paste `backend/SeedData.gs` into it.
3. In Project Settings → Script Properties, add `RORA_KEY` and `PLIX_KEY`. Use a different random key of at least 20 characters for each editor. Keep these keys out of GitHub and chat. Give Plix only his key privately.
4. Run `setupAlterEgo` once and authorize the requested Google Drive access. It creates a new private data file, preserving the source workbook.
5. Deploy → New deployment → Web app. Execute as Rora, with access set to Anyone. Access to the service URL permits viewing; server-side key validation is required for writes.
6. Copy the deployed `/exec` URL. On the Command Center, open Connection, enter this URL, choose Rora or Plix and enter that editor’s key. The key is cleared after sign-in; the six-hour session stays only in memory for this open tab.
7. To make the connection URL the default for everyone, add `window.AE_SERVICE_URL = "YOUR_DEPLOYED_EXEC_URL";` at the top of `bootstrap.js`. This URL is public configuration, never an editor key.

## Publish on GitHub

Create a separate repository named Alter-Ego-Command-Center under RoraTD. Upload `index.html`, `styles.css`, `app.js`, `core.mjs`, `bootstrap.js`, `.nojekyll` and the `data` folder to main. The backend files contain no editor keys and can be retained as source, but they run only in Apps Script. Enable Pages from main / root under Settings → Pages. A public repository makes its calendar snapshot and source publicly readable.

Plix only opens the finished website and selects Connect editor account. He does not need access to the repository.

## Daily use

Click a calendar shift or an Edit button to change the staff, shift time, attendance, cover or notes. Save publishes to the shared service. Refresh retrieves the latest shared data. Export backup downloads the currently loaded schedule as JSON. Use Staff & backups to add, rename or deactivate staff; renaming updates existing assigned and cover entries.

Present and Late count as attended. Unrecorded includes future shifts and is never a no-show. Cover attendance is separate. Sundays have open DJ fields for Open Mic Night. Friday one-hour spammers remain unassigned where the original rotation varied. All original name corrections and Tim replacing HottieBoss’s regular slots are preserved.

Changes to the weekly roster do not automatically repopulate dated shifts. Edit dated calendar shifts directly. Update both site files and the Apps Script deployment when changing application code.

## Validation

No dependencies or build step. Run `npm test` for data, concurrency and backend authorization checks. Run `npm start` for a local preview. Live shared-save testing requires the deployed Apps Script endpoint and editor setup; until then the site explicitly labels its workbook snapshot.
