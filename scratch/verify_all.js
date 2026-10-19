const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadJsInContext(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  // Replace top-level const/let with var so they attach to context
  code = code.replace(/^(const|let) /gm, 'var ');
  const context = { window: {}, document: {}, console };
  vm.createContext(context);
  vm.runInContext(code, context);
  return context;
}

try {
  // Test timeline data
  const timelineCtx = loadJsInContext(path.join(__dirname, '../js/timeline-data.js'));
  console.log(`[PASS] timeline-data.js loaded. Milestones: ${timelineCtx.timelineData.length}, Books: ${timelineCtx.registeredBooks.length}`);

  // Test myself data
  const myselfCtx = loadJsInContext(path.join(__dirname, '../js/myself-data.js'));
  const milestones = myselfCtx.myselfData;
  const registered = myselfCtx.registeredMyselfBooks;
  const layers = myselfCtx.myselfLayers;

  console.log(`[PASS] myself-data.js loaded. Milestones: ${milestones.length}, Books: ${registered.length}, Layers: ${layers.length}`);

  const countsByBook = {};
  let totalSources = 0;
  const layerMilestoneCounts = {};

  milestones.forEach((m) => {
    layerMilestoneCounts[m.layerNumber] = (layerMilestoneCounts[m.layerNumber] || 0) + 1;
    m.sources.forEach((s) => {
      totalSources++;
      countsByBook[s.bookId] = (countsByBook[s.bookId] || 0) + 1;
      // Assert critical fields
      if (!s.kernboodschap || !s.inhoud || !s.voorbeeld || !s.takeaways) {
        throw new Error(`Incomplete source in milestone ${m.id} (${s.chapterTitle})`);
      }
      if (!Array.isArray(s.inhoud) || s.inhoud.length === 0) {
        throw new Error(`Invalid inhoud array in milestone ${m.id}`);
      }
      if (!Array.isArray(s.takeaways) || s.takeaways.length === 0) {
        throw new Error(`Invalid takeaways array in milestone ${m.id}`);
      }
    });
  });

  console.log(`Total sources across all milestones: ${totalSources}`);
  console.log(`Sources per book:`, countsByBook);
  console.log(`Milestones per layer:`, layerMilestoneCounts);

  if (countsByBook['de-zeven-eigenschappen'] !== 11) {
    throw new Error(`Expected 11 Covey chapters, got ${countsByBook['de-zeven-eigenschappen']}`);
  }
  if (countsByBook['hoe-je-vrienden-maakt'] !== 30) {
    throw new Error(`Expected 30 Carnegie chapters, got ${countsByBook['hoe-je-vrienden-maakt']}`);
  }
  if (countsByBook['sapiens'] !== 1) {
    throw new Error(`Expected 1 Sapiens chapter, got ${countsByBook['sapiens']}`);
  }

  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
} catch (err) {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
}
