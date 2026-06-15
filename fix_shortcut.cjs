const fs = require('fs');
const { execSync } = require('child_process');

const originalXmlPath = 'antiattack.shortcut';
let xmlContent = fs.readFileSync(originalXmlPath, 'utf8');

const objReplChar = '\uFFFC';
const askUuid = 'A1A2A3A4-0000-4000-8000-000000000001';
const downloadUuid = 'E1E2E3E4-0001-4001-8001-000000000001';

const prodUrlString = `https://pocket-constable.vercel.app/api/v?k=${objReplChar}`;
const prodIndex = prodUrlString.indexOf(objReplChar);

const localUrlString = `https://a314b097175ee6.lhr.life/api/v?k=${objReplChar}`;
const localIndex = localUrlString.indexOf(objReplChar);

console.log(`Calculated Prod Index: ${prodIndex}`);
console.log(`Calculated Local Index: ${localIndex}`);

function buildUrlBlock(index, urlString) {
  return `\t\t<dict>
\t\t\t<key>WFWorkflowActionIdentifier</key>
\t\t\t<string>is.workflow.actions.downloadurl</string>
\t\t\t<key>WFWorkflowActionParameters</key>
\t\t\t<dict>
\t\t\t\t<key>UUID</key>
\t\t\t\t<string>${downloadUuid}</string>
\t\t\t\t<key>WFHTTPMethod</key>
\t\t\t\t<string>GET</string>
\t\t\t\t<key>WFURL</key>
\t\t\t\t<dict>
\t\t\t\t\t<key>Value</key>
\t\t\t\t\t<dict>
\t\t\t\t\t\t<key>attachmentsByRange</key>
\t\t\t\t\t\t<dict>
\t\t\t\t\t\t\t<key>{${index}, 1}</key>
\t\t\t\t\t\t\t<dict>
\t\t\t\t\t\t\t\t<key>Type</key>
\t\t\t\t\t\t\t\t<string>ActionOutput</string>
\t\t\t\t\t\t\t\t<key>OutputUUID</key>
\t\t\t\t\t\t\t\t<string>${askUuid}</string>
\t\t\t\t\t\t\t\t<key>OutputName</key>
\t\t\t\t\t\t\t\t<string>Provided Input</string>
\t\t\t\t\t\t\t</dict>
\t\t\t\t\t\t</dict>
\t\t\t\t\t\t<key>string</key>
\t\t\t\t\t\t<string>${urlString}</string>
\t\t\t\t\t</dict>
\t\t\t\t\t<key>WFSerializationType</key>
\t\t\t\t\t<string>WFTextTokenString</string>
\t\t\t\t</dict>
\t\t\t</dict>
\t\t</dict>`;
}

const prodUrlBlock = buildUrlBlock(prodIndex, prodUrlString);
const localUrlBlock = buildUrlBlock(localIndex, localUrlString);

const prodXml = xmlContent.replace(prodUrlBlock, prodUrlBlock);
fs.writeFileSync('antiattack_prod_fixed.xml', prodXml, 'utf8');

const localXml = xmlContent.replace(prodUrlBlock, localUrlBlock);
fs.writeFileSync('antiattack_local_fixed.xml', localXml, 'utf8');

console.log('Fixed XML files generated successfully.');

try {
  execSync('plutil -convert binary1 -o antiattack_prod_binary.shortcut antiattack_prod_fixed.xml');
  execSync('shortcuts sign --mode anyone --input antiattack_prod_binary.shortcut --output antiattack_prod_fixed.shortcut');

  execSync('plutil -convert binary1 -o antiattack_local_binary.shortcut antiattack_local_fixed.xml');
  execSync('shortcuts sign --mode anyone --input antiattack_local_binary.shortcut --output antiattack_local_fixed.shortcut');

  execSync('plutil -convert binary1 -o antiattack_debug_binary.shortcut antiattack_debug.shortcut');
  execSync('shortcuts sign --mode anyone --input antiattack_debug_binary.shortcut --output antiattack_debug_signed.shortcut');

  execSync('plutil -convert binary1 -o antiattack_prod_debug_binary.shortcut antiattack_prod_debug.shortcut');
  execSync('shortcuts sign --mode anyone --input antiattack_prod_debug_binary.shortcut --output antiattack_prod_debug_signed.shortcut');

  console.log('Conversion and signing complete!');

  fs.unlinkSync('antiattack_prod_fixed.xml');
  fs.unlinkSync('antiattack_prod_binary.shortcut');
  fs.unlinkSync('antiattack_local_fixed.xml');
  fs.unlinkSync('antiattack_local_binary.shortcut');
  fs.unlinkSync('antiattack_debug_binary.shortcut');
  fs.unlinkSync('antiattack_prod_debug_binary.shortcut');
} catch (err) {
  console.error('Error during conversion/signing:', err.message);
}
