import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appJsonPath = resolve(process.argv[2] ?? resolve(__dirname, '../app.json'));

const runNumber = Number(process.env.RUN_NUMBER);
if (!Number.isSafeInteger(runNumber) || runNumber < 1) {
  console.error(`Invalid RUN_NUMBER: ${JSON.stringify(process.env.RUN_NUMBER)}`);
  process.exit(1);
}

const app = JSON.parse(readFileSync(appJsonPath, 'utf8'));
app.expo ??= {};
app.expo.android ??= {};
app.expo.android.versionCode = runNumber;

writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + '\n');
console.log(`android.versionCode = ${runNumber}`);
