# StartupSync — Connection Request Demo Test

This update adds request acceptance/decline, real-time notifications, and accepted-connection-only messaging.

## Demo profiles

The demo seeder creates **20 registered accounts**: five Founders, five Investors, five Mentors, and five Students. I treated the repeated “5 mentor” in the request as **5 investors**, because Investor is the fourth user role already present in this project.

**Password for all 20 accounts:** `Test@12345`

| Role | Demo login emails |
|---|---|
| Founder | `founder1@demo.startupsync.local` through `founder5@demo.startupsync.local` |
| Investor | `investor1@demo.startupsync.local` through `investor5@demo.startupsync.local` |
| Mentor | `mentor1@demo.startupsync.local` through `mentor5@demo.startupsync.local` |
| Student | `student1@demo.startupsync.local` through `student5@demo.startupsync.local` |

The seeder is safe to run again: it reuses existing demo accounts and does not overwrite existing profile details.

## 1. Keep your existing environment file

Keep your existing `backend/.env` file. It is not included in this update archive. At minimum, the backend needs:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/startupsync
JWT_SECRET=your_local_secret
SEED_TEST_USERS=false
```

Use the same database URI and JWT secret that your current project already uses. Do not replace a working `.env` with the example file unless you have copied your actual values.

## 2. Install dependencies (only if node_modules is missing)

Open a terminal in the project folder.

Backend:
```bat
cd backend
npm install
```

Frontend — open a second terminal:
```bat
cd StartupSync
npm install
```

## 3. Start MongoDB and seed the demo accounts

Make sure your local MongoDB service is running.

Open a terminal:
```bat
cd backend
set SEED_TEST_USERS=true
npm run seed:demo
set SEED_TEST_USERS=false
```

The script prints all 20 login emails and confirms how many demo accounts and profiles were created or reused. If the accounts already exist, it will keep them and skip their existing profiles.

## 4. Start the application

**Terminal 1 — backend:**
```bat
cd backend
npm run dev
```
Expected API address: `http://localhost:5000`

**Terminal 2 — frontend:**
```bat
cd StartupSync
npm run dev
```
Open: `http://localhost:5173`

Use `localhost` consistently (not `127.0.0.1`) so the configured frontend and Socket.IO CORS origins match.

## 5. Sign in as four different roles at the same time

A browser's tabs share the same localStorage. Therefore, signing in as another user in a second tab of the **same browser profile** replaces the first user's login. Use separate browser profiles:

| Browser window | Login |
|---|---|
| Chrome (normal) | `founder1@demo.startupsync.local` |
| Edge (normal) | `investor1@demo.startupsync.local` |
| Brave (normal) | `mentor1@demo.startupsync.local` |
| Chrome (Incognito) | `student1@demo.startupsync.local` |

Password in each window: `Test@12345`

This uses your three browsers plus one isolated Chrome Incognito session for the fourth role.

## 6. Test send → notification → accept → message

### Test A — Founder requests Mentor

1. In Chrome, open **Founder → Mentors**.
2. Find **Ananya Rao** (Mentor 1) under registered profiles.
3. Click **Send Request**.
4. In Brave, open **Mentor → Notifications**.
5. Under **Connection requests**, confirm the Founder request appears with the sender's role and name.
6. Click the green **✓** button to accept.
7. In Chrome, confirm the notification bell receives: **“Ananya Rao accepted your connection request.”**

### Test B — Verify messaging is unlocked only after acceptance

1. In Chrome, open **Founder → Messages**.
2. Search for **Ananya Rao** and open the result.
3. Send a test message.
4. In Brave, open **Mentor → Messages** and confirm the message arrives.
5. Before accepting a request, a user is not shown in the Messages user search and the API blocks direct message attempts.

### Test C — Decline a request

1. In Edge, open **Investor → Mentors**.
2. Send a request to **Ananya Rao** (Mentor 1).
3. In Brave, open **Mentor → Notifications**.
4. Click the red **X** on the investor request.
5. Confirm that request disappears from the pending list and no chat is unlocked for that pair.

### Test D — Verify Student ↔ Investor

1. In Chrome Incognito, open **Student → Investors**.
2. Send a request to **Meera Capital** (Investor 1).
3. In Edge, open **Investor → Notifications** and accept it.
4. Verify both accounts can now find each other in Messages and exchange messages.

## 7. Expected behavior

- Request notifications are stored in MongoDB and pushed live to the recipient's notification bell.
- The Notifications page lists incoming pending requests with **✓ Accept** and **X Decline**.
- Accepting a request stores the connection as `accepted` and notifies the original sender.
- Declining a request stores it as `rejected`.
- Only accepted connections can appear in the Messages user search or send/read messages.
- A sender can send a new request again after the previous request was declined.
- The UI uses the existing StartupSync fonts, colors, buttons, and page styles.

## Important testing note

I verified edited JavaScript syntax and parsed the changed JSX files. A full Vite production build and live four-browser/MongoDB test could not be run inside this environment because the frontend dependency installation was interrupted and your local browser/database are on your computer. Follow the browser test above on your machine to verify the live Socket.IO flow.
