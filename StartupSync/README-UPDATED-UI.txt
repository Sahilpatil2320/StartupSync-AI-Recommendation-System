# StartupSync Frontend — Updated UI Bundle

This ZIP contains the complete frontend source folder (`StartupSync`) with the discovery/profile UI updates.

## Run locally
1. Extract this ZIP.
2. Open a terminal inside `StartupSync`.
3. Run `npm install`.
4. Run `npm run dev`.

## Updates in this bundle
- Dataset warning text removed from shared role-discovery cards.
- Discovery profile cards navigate to a dedicated profile page instead of a modal.
- Added a role-aware profile route for Founder, Investor, Mentor and Student dashboards.
- Request buttons use “Send Request”; successful requests display “Request Sent” with a green success state.
- Dataset-only records remain viewable. Because they do not represent a registered account, the UI explains that a connection request cannot actually be delivered until the profile is linked to an account. It does not falsely mark these as sent.
- Compatibility percentages are capped at 80% for display to avoid implying a perfect/probabilistic match.
- Existing brand styling and colors are retained.

## Important
- The recommendation-engine folder and its code were not included or modified.
- This is the frontend only. API-backed request delivery still depends on the backend routes and the profile being registered.
- The modified JSX files passed syntax parsing. A Vite production build could not be verified in this environment because the uploaded `node_modules` archive lacks the platform-specific Rolldown native binding. Run `npm install` locally before testing.
