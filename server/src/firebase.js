import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import fs from "fs";

let db = null;
try {
  let cred;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    cred = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString(
        "utf8"
      )
    );
  } else if (fs.existsSync("./serviceAccountKey.json")) {
    cred = JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf8"));
  }
  if (cred) {
    if (!getApps().length) initializeApp({ credential: cert(cred) });
    db = getFirestore();
    console.log("Firebase: connected to Firestore");
  } else {
    console.warn("Firebase: no credentials found, gallery is disabled");
  }
} catch (e) {
  console.warn(
    "Firebase: could not start (" + e.message + "), gallery is disabled"
  );
}
console.log("Hellow we are here");
export { db, FieldValue };
