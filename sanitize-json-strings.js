const fs = require('fs');

/**
 * Repairs JSON files that contain illegal control characters *inside string literals*
 * (e.g. raw newlines inside `"functionCode": "..."`).
 *
 * Strategy: single-pass state machine over the raw JSON text.
 * - Outside strings: copy verbatim
 * - Inside strings: escape any control characters < 0x20
 *   - \n => \\n, \r => \\r, \t => \\t
 *   - others => \\u00XX
 *
 * This does NOT change the JSON structure, only makes it syntactically valid.
 */

function sanitizeJsonText(input) {
  let out = '';
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const code = ch.charCodeAt(0);

    if (!inString) {
      if (ch === '"') {
        inString = true;
        out += ch;
        continue;
      }
      out += ch;
      continue;
    }

    // inString === true
    if (escapeNext) {
      escapeNext = false;
      out += ch;
      continue;
    }

    if (ch === '\\') {
      escapeNext = true;
      out += ch;
      continue;
    }

    if (ch === '"') {
      inString = false;
      out += ch;
      continue;
    }

    // Control characters are not allowed in JSON strings
    if (code < 0x20) {
      if (ch === '\n') out += '\\n';
      else if (ch === '\r') out += '\\r';
      else if (ch === '\t') out += '\\t';
      else out += `\\u${code.toString(16).padStart(4, '0')}`;
      continue;
    }

    out += ch;
  }

  return out;
}

function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  if (!inputPath || !outputPath) {
    console.error('Usage: node sanitize-json-strings.js <input.json> <output.json>');
    process.exit(2);
  }
  const raw = fs.readFileSync(inputPath, 'utf8');
  const sanitized = sanitizeJsonText(raw);
  fs.writeFileSync(outputPath, sanitized, 'utf8');
  // Validate parse
  JSON.parse(sanitized);
  console.log(`✅ Sanitized and validated: ${outputPath}`);
}

main();

