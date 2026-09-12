const fs = require('fs');
const path = 'C:/Users/prakr_rewvga6/.gemini/antigravity/brain/c16e6f48-ad07-4e08-bbfa-fa39396b8278/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.source === 'USER_EXPLICIT' && obj.content && obj.content.includes('// ═══════════════════════════════════════════\n// THEME')) {
      const match = obj.content.match(/import \{ useState, useRef, useEffect \} from "react";[\s\S]*?(?=<\/USER_REQUEST>|$)/);
      if (match) {
        fs.writeFileSync('C:/Users/prakr_rewvga6/OneDrive/Desktop/Argicultural and industry/src/App_recovered.jsx', match[0]);
        console.log('Recovered successfully to App_recovered.jsx');
        break;
      }
    }
  } catch (e) {
    console.error("Error parsing a line", e);
  }
}
