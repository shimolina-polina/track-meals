import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appJsonPath = resolve(__dirname, "../app.json");

const app = JSON.parse(readFileSync(appJsonPath, "utf8"));
const expo = app.expo ?? (app.expo = {});

if (!expo.android) expo.android = {};
const current = Number.isInteger(expo.android.versionCode) ? expo.android.versionCode : 1;
expo.android.versionCode = current + 1;

writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + "\n");
console.log(`android.versionCode: ${current} -> ${expo.android.versionCode}`);
