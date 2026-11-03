# Scrapture: turn scrap into sculpture

Upload a photo of a leftover object (bottle, box, wool) or an empty corner of your room.
Scrapture gives you **one directed idea** (steps, materials, cost in PKR) and a **picture of the finished result**.
You do the making.

Built for Pakistan: Urdu / Roman Urdu / English, prices in Rs, local materials, truck-art / ajrak / Eid styles, WhatsApp sharing.

**Stack:** React (Vite) + Tailwind v4 · Node + Express · **Firebase Firestore** (database) · Cloudinary (images) · Google Gemini (idea + image).
Firestore replaces MongoDB here (it is "FERN", not MERN, but the pieces are the same idea: React, Express, Node, a NoSQL database).

```
scrapture/
  client/   React app (Vite + Tailwind)
  server/   Express API (Gemini, Firestore, Cloudinary)
  firestore.rules   locks the DB so only the server can touch it
  render.yaml       one-click backend deploy on Render
```

## 0. What you need (all free)
- Node.js 20 or newer (https://nodejs.org)
- A Google account (Gemini key + Firebase)
- A Cloudinary account (https://cloudinary.com, free plan, no card)

## 1. Gemini API key
1. Open https://aistudio.google.com/apikey and click **Create API key**.
2. Copy it. This goes in `GEMINI_API_KEY`.
3. Models are set in `.env` (`GEMINI_TEXT_MODEL`, `GEMINI_IMAGE_MODEL`). Model names change over time, so check https://ai.google.dev/gemini-api/docs/models and update them if you get "model not found".
4. Your Google AI Pro subscription and the API quota are separate things. In AI Studio, check what your key can use. If image generation says quota exceeded, the idea still works and the app shows a "try drawing again" button.

## 2. Firebase (Firestore database)
1. Go to https://console.firebase.google.com and click **Add project** (name it `scrapture`, Analytics off is fine).
2. Left menu **Build > Firestore Database > Create database**. Choose **Production mode** and the nearest region (for Pakistan, Mumbai `asia-south1` is a good pick). Spark (free) plan is enough.
3. Open the **Rules** tab and paste the contents of `firestore.rules`, then **Publish**. This blocks direct browser access; our server uses the Admin SDK which is not affected.
4. **Project settings (gear icon) > Service accounts > Generate new private key**. Download the JSON.
5. Rename it to `serviceAccountKey.json` and put it inside the `server/` folder. It is git-ignored. Never commit or share it.
6. No indexes are needed; the app sorts in code. The `creations` collection is created automatically on the first save.

## 3. Cloudinary
1. Sign up, open **Dashboard**. Copy **Cloud name**, **API Key**, **API Secret**.
2. They go in `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

## 4. Run it on your computer
```bash
# from the scrapture folder
npm run install:all

cp server/.env.example server/.env     # Windows: copy server\.env.example server\.env
# open server/.env and fill GEMINI_API_KEY and the 3 Cloudinary values

# terminal 1
npm run dev:server        # API on http://localhost:5000

# terminal 2
npm run dev:client        # app on http://localhost:5173
```
Open http://localhost:5173. Check http://localhost:5000/api/health: it should say `"gallery": true` once Firebase is set up.

### Quick test
1. Make tab > pick "A thing" > upload a bottle photo > Get my idea.
2. The idea appears in a few seconds, then the "after" picture is drawn. Drag the slider to compare.
3. Click **Save to my ideas**. Open **My ideas** and see it. Tick "Also show in Community" to see it in Community.
4. Switch language to اردو and make another idea.

## 5. Deploy

### 5a. Backend on Render (free)
1. Push the project to GitHub (the `.gitignore` already protects your secrets).
2. https://render.com > **New > Blueprint** > pick your repo. It reads `render.yaml`.
   (Or **New > Web Service**: root directory `server`, build `npm install`, start `npm start`.)
3. Add environment variables in Render:
   - `GEMINI_API_KEY`, `GEMINI_TEXT_MODEL`, `GEMINI_IMAGE_MODEL`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `FIREBASE_SERVICE_ACCOUNT_BASE64`: the service account JSON as one base64 line:
     - Mac/Linux: `base64 -w0 server/serviceAccountKey.json` (Mac: `base64 -i server/serviceAccountKey.json | tr -d '\n'`)
     - Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("server\serviceAccountKey.json"))`
   - `CLIENT_URL`: your frontend URL (fill after step 5b, no trailing slash)
4. Deploy. Your API URL looks like `https://scrapture-api.onrender.com`. Test `/api/health`.
5. The free plan sleeps after about 15 minutes idle and the first request can take up to a minute. **Open /api/health a few minutes before your demo.**

### 5b. Frontend on Vercel (free)
1. https://vercel.com > **Add New > Project** > import the same repo.
2. Set **Root Directory** to `client`. Framework: Vite (auto).
3. Add env var `VITE_API_URL` = your Render URL (no trailing slash).
4. Deploy, copy the Vercel URL, and put it in Render's `CLIENT_URL`. Redeploy the backend once.

*Alternative frontend host: Firebase Hosting.* `npm i -g firebase-tools`, `firebase login`, `firebase init hosting` in `client/` (public dir `dist`, single-page app: yes), `npm run build`, `firebase deploy`. Add the `*.web.app` URL to `CLIENT_URL`.

## 6. API
| Method | Path | What it does |
|---|---|---|
| POST | `/api/idea` | photo + mode/style/budget/lang to JSON idea |
| POST | `/api/visualize` | photo + visualPrompt to the "after" picture |
| POST | `/api/gallery` | save idea + pictures (Cloudinary + Firestore) |
| GET | `/api/gallery?clientId=` | my saved ideas |
| GET | `/api/community` | ideas shared publicly |
| POST | `/api/gallery/:id/made` | "I made this too" counter |
| DELETE | `/api/gallery/:id?clientId=` | delete my idea |

No login: each browser gets a random anonymous id (stored in localStorage). Clearing browser data loses "My ideas" access.

## 7. Troubleshooting
- **CORS error**: `CLIENT_URL` on the server must exactly match your frontend URL.
- **"AI quota" message**: free limits hit; wait a minute or check your key in AI Studio.
- **Model not found**: update `GEMINI_TEXT_MODEL` / `GEMINI_IMAGE_MODEL`.
- **Gallery not set up**: `serviceAccountKey.json` missing or `FIREBASE_SERVICE_ACCOUNT_BASE64` wrong.
- **Image storage not set up**: Cloudinary values missing.
- **iPhone HEIC photos**: switch the camera to "Most Compatible" or screenshot the photo.

## 8. Demo script (2 minutes)
1. Show a real empty corner photo from the room you are presenting in. Pick "Truck art", budget Rs 500.
2. While the picture draws, read the idea aloud. Drag the before/after slider.
3. Switch to اردو, generate again for a bottle.
4. Share to WhatsApp, then open Community.
Pitch line: *"Turning scrap into sculpture shouldn't take an hour of Pinterest scrolling. It should take a photo."*

## 9. Ideas for next steps
Voice input in Urdu, a "what can I make with these 3 items" multi-photo mode, Ramadan and Eid seasonal packs, local shop finder for extras, printable step cards, user accounts.
