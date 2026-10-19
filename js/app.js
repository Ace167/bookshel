document.addEventListener('DOMContentLoaded', () => {
  const timelineContainer = document.getElementById('timeline-list');
  const periodFilterContainer = document.getElementById('period-filter-group');
  const bookFilterSelect = document.getElementById('book-filter-select');
  const expandAllBtn = document.getElementById('expand-all-btn');
  const collapseAllBtn = document.getElementById('collapse-all-btn');
  const searchInput = document.getElementById('timeline-search');
  const statsLabel = document.getElementById('timeline-stats');

  let currentPeriod = 'all';
  let currentBook = 'all';
  let searchTerm = '';

  // Render filterknoppen voor tijdperken dynamisch
  function initPeriodFilters() {
    if (!periodFilterContainer) return;
    periodFilterContainer.innerHTML = '';
    timelinePeriods.forEach(p => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${p.id === currentPeriod ? 'active' : ''}`;
      btn.setAttribute('data-period', p.id);
      btn.textContent = p.name;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPeriod = p.id;
        renderTimeline();
      });
      periodFilterContainer.appendChild(btn);
    });
  }

  // Render boekfilter opties
  function initBookFilter() {
    if (!bookFilterSelect) return;
    bookFilterSelect.innerHTML = '';
    registeredBooks.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = b.title;
      bookFilterSelect.appendChild(opt);
    });
    bookFilterSelect.addEventListener('change', (e) => {
      currentBook = e.target.value;
      renderTimeline();
    });
  }

  // Render de universele tijdlijn
  function renderTimeline() {
    timelineContainer.innerHTML = '';

    const filtered = timelineData.filter(milestone => {
      // Filter op tijdperk
      const matchesPeriod = currentPeriod === 'all' || milestone.periodId === currentPeriod;

      // Filter op boek/bron
      const matchesBook = currentBook === 'all' || milestone.sources.some(s => s.bookId === currentBook);

      // Zoekfilter
      let matchesSearch = true;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const milestoneText = `${milestone.era} ${milestone.periodName} ${milestone.title} ${milestone.tagline}`.toLowerCase();
        const sourcesText = milestone.sources.map(s => 
          `${s.bookTitle} ${s.author} ${s.chapterTitle} ${s.kernboodschap} ${s.voorbeeld} ${s.takeaways.join(' ')}`
        ).join(' ').toLowerCase();

        matchesSearch = milestoneText.includes(term) || sourcesText.includes(term);
      }

      return matchesPeriod && matchesBook && matchesSearch;
    });

    if (statsLabel) {
      statsLabel.textContent = `${filtered.length} ${filtered.length === 1 ? 'mijlpaal' : 'mijlpalen'} op de tijdlijn`;
    }

    if (filtered.length === 0) {
      timelineContainer.innerHTML = `
        <div class="no-results">
          <p>Geen tijdlijnpunten gevonden voor deze selectie of zoekopdracht.</p>
        </div>
      `;
      return;
    }

    let lastPeriodId = null;

    filtered.forEach(milestone => {
      // Period Divider tonen als we in overzichtsmodus ('all') zijn
      if (currentPeriod === 'all' && milestone.periodId !== lastPeriodId) {
        lastPeriodId = milestone.periodId;
        const periodDivider = document.createElement('div');
        periodDivider.className = 'timeline-period-header';
        periodDivider.innerHTML = `
          <span class="period-pill">${milestone.periodName}</span>
        `;
        timelineContainer.appendChild(periodDivider);
      }

      const item = document.createElement('article');
      item.className = 'timeline-item';
      item.id = milestone.id;

      // Filter eventueel bronnen als een specifiek boek geselecteerd is
      const activeSources = currentBook === 'all' 
        ? milestone.sources 
        : milestone.sources.filter(s => s.bookId === currentBook);

      item.innerHTML = `
        <div class="timeline-marker">
          <span class="marker-dot"></span>
        </div>
        <div class="timeline-card">
          <div class="timeline-header-block">
            <div class="header-top-row">
              <span class="era-badge">⏳ ${milestone.era}</span>
              <span class="period-badge">${milestone.periodName}</span>
            </div>
            <h3 class="milestone-title">${milestone.title}</h3>
            <p class="milestone-tagline">${milestone.tagline}</p>
          </div>

          <!-- Bronnen sectie (uitbreidbaar voor meerdere boeken) -->
          <div class="sources-container">
            <div class="sources-header">
              <span class="sources-label">📚 Bronnen & Inzichten (${activeSources.length}):</span>
            </div>

            <div class="sources-list">
              ${activeSources.map((source, index) => `
                <div class="source-card" data-source-id="${source.bookId}">
                  <button class="source-toggle-btn" aria-expanded="false" aria-controls="source-content-${milestone.id}-${index}">
                    <div class="source-meta">
                      <span class="book-badge">📖 ${source.bookTitle}</span>
                      <span class="source-author">door ${source.author}</span>
                      <strong class="source-chapter">${source.chapterTitle}</strong>
                    </div>
                    <div class="source-action">
                      <span class="action-text">Bekijk analyse</span>
                      <span class="toggle-icon">↓</span>
                    </div>
                  </button>

                  <div id="source-content-${milestone.id}-${index}" class="source-content" hidden>
                    <div class="summary-inner">
                      <section class="summary-section kernboodschap-box">
                        <h4>💡 De kernboodschap</h4>
                        <p>${source.kernboodschap}</p>
                      </section>

                      <section class="summary-section inhoud-box">
                        <h4>📖 Uitgebreide analyse</h4>
                        ${source.inhoud.map(p => `<p>${p}</p>`).join('')}
                      </section>

                      <section class="summary-section voorbeeld-box">
                        <h4>🔍 Hét voorbeeld uit dit hoofdstuk</h4>
                        <p>${source.voorbeeld}</p>
                      </section>

                      <section class="summary-section takeaways-box">
                        <h4>🎯 Belangrijkste takeaways</h4>
                        <ul>
                          ${source.takeaways.map(t => `<li>${t}</li>`).join('')}
                        </ul>
                      </section>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      // Event listeners voor elke bron-uitvouwer
      const sourceCards = item.querySelectorAll('.source-card');
      sourceCards.forEach(sc => {
        const toggleBtn = sc.querySelector('.source-toggle-btn');
        const contentDiv = sc.querySelector('.source-content');
        const toggleIcon = sc.querySelector('.toggle-icon');
        const actionText = sc.querySelector('.action-text');

        toggleBtn.addEventListener('click', () => {
          const isOpen = sc.classList.toggle('expanded');
          item.classList.toggle('has-expanded-source', item.querySelector('.source-card.expanded') !== null);
          toggleBtn.setAttribute('aria-expanded', isOpen);
          if (isOpen) {
            contentDiv.removeAttribute('hidden');
            toggleIcon.textContent = '↑';
            actionText.textContent = 'Inklappen';
          } else {
            contentDiv.setAttribute('hidden', '');
            toggleIcon.textContent = '↓';
            actionText.textContent = 'Bekijk analyse';
          }
        });
      });

      timelineContainer.appendChild(item);
    });
  }

  // Zoeken met live filtering
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim();
      renderTimeline();
    });
  }

  // Alles uitvouwen (Wereld Tijdlijn)
  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      if (!timelineContainer) return;
      const sourceCards = timelineContainer.querySelectorAll('.source-card');
      const timelineItems = timelineContainer.querySelectorAll('.timeline-item');
      timelineItems.forEach(item => item.classList.add('has-expanded-source'));
      sourceCards.forEach(sc => {
        sc.classList.add('expanded');
        const btn = sc.querySelector('.source-toggle-btn');
        const content = sc.querySelector('.source-content');
        const toggleIcon = sc.querySelector('.toggle-icon');
        const actionText = sc.querySelector('.action-text');
        if (btn) btn.setAttribute('aria-expanded', 'true');
        if (content) content.removeAttribute('hidden');
        if (toggleIcon) toggleIcon.textContent = '↑';
        if (actionText) actionText.textContent = 'Inklappen';
      });
    });
  }

  // Alles inklappen (Wereld Tijdlijn)
  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', () => {
      if (!timelineContainer) return;
      const sourceCards = timelineContainer.querySelectorAll('.source-card');
      const timelineItems = timelineContainer.querySelectorAll('.timeline-item');
      timelineItems.forEach(item => item.classList.remove('has-expanded-source'));
      sourceCards.forEach(sc => {
        sc.classList.remove('expanded');
        const btn = sc.querySelector('.source-toggle-btn');
        const content = sc.querySelector('.source-content');
        const toggleIcon = sc.querySelector('.toggle-icon');
        const actionText = sc.querySelector('.action-text');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        if (content) content.setAttribute('hidden', '');
        if (toggleIcon) toggleIcon.textContent = '↓';
        if (actionText) actionText.textContent = 'Bekijk analyse';
      });
    });
  }

  // =========================================
  // TO GET TO KNOW MYSELF (ZELFKENNIS) CONTROLS & RENDER
  // =========================================
  const myselfContainer = document.getElementById('myself-list');
  const myselfLayerFilterContainer = document.getElementById('myself-layer-filter-group');
  const myselfBookFilterSelect = document.getElementById('myself-book-filter-select');
  const myselfExpandAllBtn = document.getElementById('myself-expand-all-btn');
  const myselfCollapseAllBtn = document.getElementById('myself-collapse-all-btn');
  const myselfSearchInput = document.getElementById('myself-search');
  const myselfStatsLabel = document.getElementById('myself-stats');

  let currentMyselfLayer = 'all';
  let currentMyselfBook = 'all';
  let myselfSearchTerm = '';

  // Render filterknoppen voor lagen dynamisch
  function initMyselfLayerFilters() {
    if (!myselfLayerFilterContainer || typeof myselfLayers === 'undefined') return;
    myselfLayerFilterContainer.innerHTML = '';
    myselfLayers.forEach(l => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${l.id === currentMyselfLayer ? 'active' : ''}`;
      btn.setAttribute('data-layer', l.id);
      btn.textContent = l.name;
      btn.addEventListener('click', () => {
        myselfLayerFilterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMyselfLayer = l.id;
        renderMyselfTimeline();
      });
      myselfLayerFilterContainer.appendChild(btn);
    });
  }

  // Render boekfilter opties voor Zelfkennis
  function initMyselfBookFilter() {
    if (!myselfBookFilterSelect || typeof registeredMyselfBooks === 'undefined') return;
    myselfBookFilterSelect.innerHTML = '';
    registeredMyselfBooks.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = b.title;
      myselfBookFilterSelect.appendChild(opt);
    });
    myselfBookFilterSelect.addEventListener('change', (e) => {
      currentMyselfBook = e.target.value;
      renderMyselfTimeline();
    });
  }

  // Render de lagen van het Zelf
  function renderMyselfTimeline() {
    if (!myselfContainer || typeof myselfData === 'undefined') return;
    myselfContainer.innerHTML = '';

    const filtered = myselfData.filter(milestone => {
      // Filter op laag
      const matchesLayer = currentMyselfLayer === 'all' || milestone.layerId === currentMyselfLayer;

      // Filter op boek/bron
      const matchesBook = currentMyselfBook === 'all' || milestone.sources.some(s => s.bookId === currentMyselfBook);

      // Zoekfilter
      let matchesSearch = true;
      if (myselfSearchTerm) {
        const term = myselfSearchTerm.toLowerCase();
        const milestoneText = `${milestone.layerName} ${milestone.title} ${milestone.tagline} ${milestone.coreQuestion}`.toLowerCase();
        const sourcesText = milestone.sources.map(s => 
          `${s.bookTitle} ${s.author} ${s.chapterTitle} ${s.kernboodschap} ${s.voorbeeld} ${s.takeaways.join(' ')}`
        ).join(' ').toLowerCase();

        matchesSearch = milestoneText.includes(term) || sourcesText.includes(term);
      }

      return matchesLayer && matchesBook && matchesSearch;
    });

    const totalActiveSources = filtered.reduce((acc, m) => {
      const count = currentMyselfBook === 'all' 
        ? m.sources.length 
        : m.sources.filter(s => s.bookId === currentMyselfBook).length;
      return acc + count;
    }, 0);

    if (myselfStatsLabel) {
      myselfStatsLabel.textContent = `${filtered.length} thema's (${totalActiveSources} analyses) op de kaart`;
    }

    if (filtered.length === 0) {
      if (currentMyselfLayer !== 'all' && !myselfSearchTerm && currentMyselfBook === 'all') {
        const layerObj = myselfLayers.find(l => l.id === currentMyselfLayer);
        const layerName = layerObj ? layerObj.name : 'deze laag';
        myselfContainer.innerHTML = `
          <div class="placeholder-shelf-card">
            <div class="shelf-icon">📖</div>
            <h3>Nog geen boeken toegevoegd voor ${layerName}</h3>
            <p>Je hebt voor deze laag nog geen samenvattingen aangeleverd. Zodra je een boek leest over dit onderwerp (bijv. cognitieve psychologie of levensfilosofie), voegen we de analyses direct hier toe.</p>
          </div>
        `;
      } else {
        myselfContainer.innerHTML = `
          <div class="no-results">
            <p>Geen thema's of inzichten gevonden voor deze selectie of zoekopdracht.</p>
          </div>
        `;
      }
      return;
    }

    let lastLayerId = null;

    filtered.forEach(milestone => {
      // Layer Divider tonen als we in overzichtsmodus ('all') zijn
      if (currentMyselfLayer === 'all' && milestone.layerId !== lastLayerId) {
        lastLayerId = milestone.layerId;
        const layerDivider = document.createElement('div');
        layerDivider.className = 'timeline-period-header';
        layerDivider.innerHTML = `
          <span class="period-pill">${milestone.layerName}</span>
        `;
        myselfContainer.appendChild(layerDivider);
      }

      const item = document.createElement('article');
      item.className = 'timeline-item';
      item.id = milestone.id;

      // Filter eventueel bronnen als een specifiek boek geselecteerd is
      const activeSources = currentMyselfBook === 'all'
        ? milestone.sources
        : milestone.sources.filter(s => s.bookId === currentMyselfBook);

      item.innerHTML = `
        <div class="timeline-marker">
          <span class="marker-dot"></span>
        </div>
        <div class="timeline-card">
          <div class="timeline-header-block">
            <div class="header-top-row">
              <span class="era-badge">${milestone.icon} ${milestone.layerName}</span>
            </div>
            <h3 class="milestone-title">${milestone.title}</h3>
            <p class="milestone-tagline">${milestone.tagline}</p>
            <div class="core-question-box">
              <strong>Kernvraag:</strong> ${milestone.coreQuestion}
            </div>
          </div>

          <!-- Bronnen sectie -->
          <div class="sources-container">
            <div class="sources-header">
              <span class="sources-label">📚 Psychologische bronnen & modellen (${activeSources.length}):</span>
            </div>

            <div class="sources-list">
              ${activeSources.map((source, index) => `
                <div class="source-card" data-source-id="${source.bookId}">
                  <button class="source-toggle-btn" aria-expanded="false" aria-controls="source-content-myself-${milestone.id}-${index}">
                    <div class="source-meta">
                      <span class="book-badge">📖 ${source.bookTitle}</span>
                      <span class="source-author">door ${source.author}</span>
                      <strong class="source-chapter">${source.chapterTitle}</strong>
                    </div>
                    <div class="source-action">
                      <span class="action-text">Bekijk analyse</span>
                      <span class="toggle-icon">↓</span>
                    </div>
                  </button>

                  <div id="source-content-myself-${milestone.id}-${index}" class="source-content" hidden>
                    <div class="summary-inner">
                      <section class="summary-section kernboodschap-box">
                        <h4>💡 De kernboodschap</h4>
                        <p>${source.kernboodschap}</p>
                      </section>

                      <section class="summary-section inhoud-box">
                        <h4>📖 Uitgebreide analyse</h4>
                        ${source.inhoud.map(p => `<p>${p}</p>`).join('')}
                      </section>

                      <section class="summary-section voorbeeld-box">
                        <h4>🔍 Hét voorbeeld / concept</h4>
                        <p>${source.voorbeeld}</p>
                      </section>

                      <section class="summary-section takeaways-box">
                        <h4>🎯 Belangrijkste takeaways</h4>
                        <ul>
                          ${source.takeaways.map(t => `<li>${t}</li>`).join('')}
                        </ul>
                      </section>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      // Event listeners voor elke bron-uitvouwer in myself
      const sourceCards = item.querySelectorAll('.source-card');
      sourceCards.forEach(sc => {
        const toggleBtn = sc.querySelector('.source-toggle-btn');
        const contentDiv = sc.querySelector('.source-content');
        const toggleIcon = sc.querySelector('.toggle-icon');
        const actionText = sc.querySelector('.action-text');

        toggleBtn.addEventListener('click', () => {
          const isOpen = sc.classList.toggle('expanded');
          item.classList.toggle('has-expanded-source', item.querySelector('.source-card.expanded') !== null);
          toggleBtn.setAttribute('aria-expanded', isOpen);
          if (isOpen) {
            contentDiv.removeAttribute('hidden');
            toggleIcon.textContent = '↑';
            actionText.textContent = 'Inklappen';
          } else {
            contentDiv.setAttribute('hidden', '');
            toggleIcon.textContent = '↓';
            actionText.textContent = 'Bekijk analyse';
          }
        });
      });

      myselfContainer.appendChild(item);
    });
  }

  // Zoeken in Zelfkennis
  if (myselfSearchInput) {
    myselfSearchInput.addEventListener('input', (e) => {
      myselfSearchTerm = e.target.value.trim();
      renderMyselfTimeline();
    });
  }

  // Alles uitvouwen in Zelfkennis
  if (myselfExpandAllBtn) {
    myselfExpandAllBtn.addEventListener('click', () => {
      if (!myselfContainer) return;
      const sourceCards = myselfContainer.querySelectorAll('.source-card');
      const timelineItems = myselfContainer.querySelectorAll('.timeline-item');
      timelineItems.forEach(item => item.classList.add('has-expanded-source'));
      sourceCards.forEach(sc => {
        sc.classList.add('expanded');
        const btn = sc.querySelector('.source-toggle-btn');
        const content = sc.querySelector('.source-content');
        const toggleIcon = sc.querySelector('.toggle-icon');
        const actionText = sc.querySelector('.action-text');
        if (btn) btn.setAttribute('aria-expanded', 'true');
        if (content) content.removeAttribute('hidden');
        if (toggleIcon) toggleIcon.textContent = '↑';
        if (actionText) actionText.textContent = 'Inklappen';
      });
    });
  }

  // Alles inklappen in Zelfkennis
  if (myselfCollapseAllBtn) {
    myselfCollapseAllBtn.addEventListener('click', () => {
      if (!myselfContainer) return;
      const sourceCards = myselfContainer.querySelectorAll('.source-card');
      const timelineItems = myselfContainer.querySelectorAll('.timeline-item');
      timelineItems.forEach(item => item.classList.remove('has-expanded-source'));
      sourceCards.forEach(sc => {
        sc.classList.remove('expanded');
        const btn = sc.querySelector('.source-toggle-btn');
        const content = sc.querySelector('.source-content');
        const toggleIcon = sc.querySelector('.toggle-icon');
        const actionText = sc.querySelector('.action-text');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        if (content) content.setAttribute('hidden', '');
        if (toggleIcon) toggleIcon.textContent = '↓';
        if (actionText) actionText.textContent = 'Bekijk analyse';
      });
    });
  }

  // =========================================
  // VIEW ROUTER (Home, Wereld, Zelfkennis)
  // =========================================
  const navHome = document.getElementById('nav-home');
  const navMyself = document.getElementById('nav-myself');
  const navWorld = document.getElementById('nav-world');
  const homeView = document.getElementById('home-view');
  const worldView = document.getElementById('world-timeline');
  const myselfView = document.getElementById('myself-view');

  const landingGotoWorld = document.getElementById('landing-goto-world');
  const landingHeroCta = document.getElementById('landing-hero-cta');
  const landingGotoMyself = document.getElementById('landing-goto-myself');
  const switchToWorldBtn = document.getElementById('switch-to-world-btn');

  function setView(viewName) {
    // Verberg alle views
    if (homeView) homeView.setAttribute('hidden', '');
    if (worldView) worldView.setAttribute('hidden', '');
    if (myselfView) myselfView.setAttribute('hidden', '');

    // Reset navigatiestijlen
    if (navHome) navHome.classList.remove('active-nav');
    if (navMyself) navMyself.classList.remove('active-nav');
    if (navWorld) navWorld.classList.remove('active-nav');

    if (viewName === 'world') {
      if (worldView) worldView.removeAttribute('hidden');
      if (navWorld) navWorld.classList.add('active-nav');
      window.location.hash = 'world-timeline';
    } else if (viewName === 'myself') {
      if (myselfView) myselfView.removeAttribute('hidden');
      if (navMyself) navMyself.classList.add('active-nav');
      window.location.hash = 'myself-view';
    } else {
      // Home landingspagina
      if (homeView) homeView.removeAttribute('hidden');
      if (navHome) navHome.classList.add('active-nav');
      window.location.hash = 'home';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Navigatie-klik events
  if (navHome) {
    navHome.addEventListener('click', (e) => {
      e.preventDefault();
      setView('home');
    });
  }

  if (navWorld) {
    navWorld.addEventListener('click', (e) => {
      e.preventDefault();
      setView('world');
    });
  }

  if (navMyself) {
    navMyself.addEventListener('click', (e) => {
      e.preventDefault();
      setView('myself');
    });
  }

  // Knoppen op de landingspagina
  if (landingGotoWorld) {
    landingGotoWorld.addEventListener('click', () => setView('world'));
  }
  if (landingHeroCta) {
    landingHeroCta.addEventListener('click', () => setView('world'));
  }
  if (landingGotoMyself) {
    landingGotoMyself.addEventListener('click', () => setView('myself'));
  }
  if (switchToWorldBtn) {
    switchToWorldBtn.addEventListener('click', () => setView('world'));
  }

  // Initialisatie
  initPeriodFilters();
  initBookFilter();
  renderTimeline();
  initMyselfLayerFilters();
  initMyselfBookFilter();
  renderMyselfTimeline();

  // Controleer hash bij laden
  const initialHash = window.location.hash;
  if (initialHash === '#world-timeline') {
    setView('world');
  } else if (initialHash === '#myself-view') {
    setView('myself');
  } else {
    setView('home');
  }
});

