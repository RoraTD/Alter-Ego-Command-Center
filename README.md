# Alter Ego Command Center — view only

Plix and other visitors view the calendar without accounts or keys. Rora updates assignments, attendance, cover and notes in her private Google Sheet. Google controls who can edit it. Do not share edit access with viewers.

## Finish setup

1. Replace Apps Script Code.gs with backend/Code.gs. Keep the existing SeedData.gs.
2. Save, select setupAlterEgo and Run. No script properties or editor keys are required. Approve Google Sheets access if prompted.
3. The execution log prints your new Google Sheet link. Keep it for updates.
4. Deploy a new Web app, executing as your account, with Anyone access. The service only reads schedule data; POST requests cannot change it.
5. Provide the deployed /exec URL to connect the website. Never send passwords.

The public website displays schedule, attendance and notes. Viewing it does not grant Google Sheet editing permission. After Sheet edits, click Refresh on the website. Keep dates as YYYY-MM-DD text, Position labels and the hidden Shift ID column intact. Edit staff names, times and attendance in Schedule; maintain name and color lists in Staff. Renaming the Staff list does not automatically rename dated assignments. The original workbook remains a starting snapshot.

GitHub Pages uses main / root. No build step or dependencies. Live read verification still needs the deployed Apps Script URL.
