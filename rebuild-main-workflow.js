const fs = require('fs');

function readText(path) {
  return fs.readFileSync(path, 'utf8');
}

function mustFindNode(workflow, predicate, label) {
  const node = workflow.nodes.find(predicate);
  if (!node) throw new Error(`Missing node: ${label}`);
  return node;
}

function main() {
  // NOTE: main-workflow-fixed.json may contain illegal control chars inside strings
  // (from earlier edits). We sanitize it to a parseable JSON first.
  const basePath = 'd:/My-Apps/BlackDragon-Agent/files/main-workflow-fixed-sanitized.json';
  const outPath = 'd:/My-Apps/BlackDragon-Agent/files/main-workflow.json';

  const classifyCodePath = 'd:/My-Apps/BlackDragon-Agent/files/FIX-ClassifyIntent-Code.js';
  const handleFaqCodePath = 'd:/My-Apps/BlackDragon-Agent/files/Handle-FAQ-Cancel-Visit-FIXED.js';

  const workflow = JSON.parse(readText(basePath));

  // --- Update Function node codes from source files ---
  const classifyNode = mustFindNode(workflow, (n) => n.id === '4facb160-03cf-4ef6-a7ee-4e96ead60dcc', 'Classify Intent');
  classifyNode.parameters = classifyNode.parameters || {};
  classifyNode.parameters.functionCode = readText(classifyCodePath);

  const faqNode = mustFindNode(workflow, (n) => n.id === '89f0d945-ca33-4452-a7f8-ac58ffcdefd5', 'Handle FAQ');
  faqNode.parameters = faqNode.parameters || {};
  faqNode.parameters.functionCode = readText(handleFaqCodePath);

  // Clean Airtable Data: prevent lifetime decrement on cancel_visit
  const cleanNode = mustFindNode(workflow, (n) => n.id === 'clean-airtable-data-001', 'Clean Airtable Data');
  cleanNode.parameters = cleanNode.parameters || {};
  cleanNode.parameters.functionCode = [
    '// Clean data for Airtable - only pass updatable fields',
    'const data = $json || {};',
    '',
    '// For cancellation, do NOT update TotalLifetimeGuests',
    "const isCancellation = data.action === 'cancel_visit';",
    '',
    'return {',
    '  memberId: data.memberId,',
    '  newMonthlyGuestCount: data.newMonthlyGuestCount,',
    '  newTotalLifetimeGuests: isCancellation ? undefined : (data.newTotalLifetimeGuests || data.totalLifetimeGuests || 0),',
    '  savePendingGuests: data.savePendingGuests,',
    '  savePendingTime: data.savePendingTime,',
    '  savePendingAlcohol: data.savePendingAlcohol,',
    '  responseMessage: data.responseMessage,',
    '  message: data.message,',
    '  action: data.action',
    '};',
    ''
  ].join('\n');

  // --- Ensure Needs Database Update? checks confirm_visit OR cancel_visit ---
  const needsDb = mustFindNode(workflow, (n) => n.name === 'Needs Database Update?', 'Needs Database Update?');
  needsDb.parameters = needsDb.parameters || {};
  needsDb.parameters.conditions = needsDb.parameters.conditions || {};
  needsDb.parameters.conditions.string = [
    { value1: '={{$json.action}}', value2: 'confirm_visit' },
    { value1: '={{$json.action}}', value2: 'cancel_visit' },
  ];

  // --- Add "Is Cancel Visit?" IF node (if missing) ---
  let isCancel = workflow.nodes.find((n) => n.id === 'is-cancel-visit-001');
  if (!isCancel) {
    const basePos = Array.isArray(faqNode.position) ? faqNode.position : [9104, 2352];
    isCancel = {
      parameters: {
        conditions: {
          string: [{ value1: '={{$json.action}}', value2: 'cancel_visit' }],
        },
      },
      id: 'is-cancel-visit-001',
      name: 'Is Cancel Visit?',
      type: 'n8n-nodes-base.if',
      typeVersion: 1,
      position: [basePos[0] + 224, basePos[1]],
    };
    workflow.nodes.push(isCancel);
  }

  // --- Rewire connections around Handle FAQ / Is Cancel Visit ---
  workflow.connections = workflow.connections || {};
  workflow.connections['Handle FAQ'] = { main: [[{ node: 'Is Cancel Visit?', type: 'main', index: 0 }]] };

  workflow.connections['Is Cancel Visit?'] = {
    main: [
      // TRUE
      [{ node: 'Needs Database Update?', type: 'main', index: 0 }],
      // FALSE
      [
        { node: 'Needs AI Response?', type: 'main', index: 0 },
        { node: 'Save Pending Visit Data', type: 'main', index: 0 },
      ],
    ],
  };

  // Ensure Save Pending Visit Data has a connections entry (n8n expects it)
  if (!workflow.connections['Save Pending Visit Data']) {
    workflow.connections['Save Pending Visit Data'] = { main: [[]] };
  }

  // --- Write the rebuilt workflow ---
  fs.writeFileSync(outPath, JSON.stringify(workflow, null, 2));
  console.log('✅ Rebuilt main-workflow.json from main-workflow-fixed.json');
}

main();

