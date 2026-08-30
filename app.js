
        /** --- GAME STATE & CONFIG --- */
        const gameConfig = { startingBudget: 250000, dailyOperatingCost: 2000, revenuePerTest: 15, baseDailyVolume: 300 };
        let currentDay = 1; let currentBudget = gameConfig.startingBudget;

        const instrumentCatalog = [
            { 
                id: 'hem_analyzer', name: 'Hematology Analyzer', price: 85000, color: '#1e293b', w: 80, h: 80, abv: 'HA',
                ifu: `<h3 style="color:var(--accent-color); margin-top:0;">Background Check Acceptable Limits</h3>
                    <ul><li><strong>WBC:</strong> &le; 0.1 (10&sup3;/&mu;L)</li><li><strong>RBC:</strong> &le; 0.02 (10&#8306;/&mu;L)</li><li><strong>HGB:</strong> &le; 0.1 (g/dL)</li><li><strong>PLT:</strong> &le; 10 (10&sup3;/&mu;L)</li></ul>
                    <h3 style="color:var(--accent-color);">Carryover Limits</h3>
                    <ul><li>Blank samples run immediately after High samples must not exceed Background limits, or calculated carryover must be &le; 1%.</li></ul>
                    <h3 style="color:var(--accent-color);">Precision Criteria</h3>
                    <ul><li>Coefficient of Variation (%CV) must be &le; 5% for all parameters.</li></ul>
                    <h3 style="color:var(--accent-color);">Accuracy Criteria</h3>
                    <ul><li>Correlation coefficient (R) must be &ge; 0.95 compared to reference method.</li></ul>
                    <h3 style="color:var(--accent-color);">AMR Criteria</h3>
                    <ul><li>Results must demonstrate linearity across the specified analytical range.</li></ul>
                    <h3 style="color:var(--accent-color);">Reference Intervals</h3>
                    <ul><li>At least 95% of healthy donor samples must fall within established normal ranges (Mean &plusmn; 2SD).</li></ul>`,
                icon: `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="48" height="48" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/><rect x="14" y="14" width="20" height="16" rx="2" fill="#38bdf8" /><path d="M16 24 l4 -4 l4 4 l6 -6" stroke="#0f172a" stroke-width="2" fill="none" /><line x1="38" y1="14" x2="50" y2="14" stroke="#94a3b8" stroke-width="2" /><line x1="38" y1="20" x2="50" y2="20" stroke="#94a3b8" stroke-width="2" /><line x1="38" y1="26" x2="50" y2="26" stroke="#94a3b8" stroke-width="2" /><rect x="14" y="40" width="36" height="10" rx="1" fill="#334155" /><rect x="18" y="34" width="4" height="14" rx="2" fill="#ef4444" /><rect x="26" y="34" width="4" height="14" rx="2" fill="#a855f7" /><rect x="34" y="34" width="4" height="14" rx="2" fill="#a855f7" /></svg>`
            },
            { id: 'slide_maker', name: 'Automatic Slide Maker', price: 45000, color: '#8b5cf6', w: 60, h: 60, abv: 'SM', icon: `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="48" height="48" rx="4" fill="#8b5cf6" stroke="#38bdf8" stroke-width="2"/><rect x="12" y="16" width="40" height="10" rx="2" fill="#ffffff" opacity="0.06"/><rect x="14" y="20" width="12" height="6" rx="1" fill="#ffffff"/><rect x="32" y="20" width="12" height="6" rx="1" fill="#a78bfa"/><rect x="14" y="32" width="36" height="10" rx="2" fill="#334155"/></svg>` },
            { id: 'vis_analyzer', name: 'Visual Slide Analyzer', price: 90000, color: '#10b981', w: 70, h: 70, abv: 'VA', icon: `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="48" height="48" rx="4" fill="#10b981" stroke="#38bdf8" stroke-width="2"/><circle cx="26" cy="26" r="10" fill="#34d399" stroke="#0f172a" stroke-width="1"/><rect x="38" y="16" width="10" height="20" rx="2" fill="#065f46"/><line x1="18" y1="38" x2="46" y2="38" stroke="#94a3b8" stroke-width="2"/><rect x="14" y="44" width="36" height="8" rx="1" fill="#334155"/></svg>` },
            { id: 'spun_hct', name: 'Spun Hematocrit', price: 1500, color: '#f59e0b', w: 40, h: 40, abv: 'SH', icon: `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="48" height="48" rx="4" fill="#f59e0b" stroke="#38bdf8" stroke-width="2"/><circle cx="32" cy="28" r="10" fill="#fb923c" stroke="#0f172a" stroke-width="1"/><rect x="30" y="18" width="4" height="8" rx="1" fill="#0f172a" transform="rotate(25 32 22)"/><rect x="26" y="40" width="12" height="8" rx="2" fill="#334155"/><rect x="30" y="34" width="4" height="6" rx="1" fill="#ffffff" opacity="0.9"/></svg>` }
        ];

        let ownedInstruments = []; let instrumentIdCounter = 0; let activeInstrument = null; let ghostElement = null; let isArrangeMode = false; let movingInstrumentId = null; 
        let verifyingInstrumentId = null; let activeStudyKey = null; let precisionRunCounter = 0;

        const studyDefs = {
            Background: { title: 'Background Check', samples: 3, desc: 'Run 3 blanks (diluent) consecutively. Verifies the system is clean with no particulate interference.' },
            Carryover: { title: 'Carryover', samples: 6, desc: 'Alternates a high concentration sample with a blank sample (High, Blank, High, Blank, High, Blank). Verifies high samples do not artificially inflate subsequent low/blank samples.' },
            Precision: { title: 'Precision Studies', samples: 20, desc: 'Run the exact same patient sample 20 consecutive times. This measures random error. We evaluate the Standard Deviation (SD) and Coefficient of Variation (%CV).' },
            Accuracy: { title: 'Accuracy Studies', samples: 40, desc: 'Run patient samples and compare them against an established reference method. Verifies correlation across a wide clinical range.' },
            AMR: { title: 'Analytical Measurement Range', samples: 5, desc: 'Run calibration materials of known concentrations from very low to very high. Proves the instrument measures linearly across the entire reportable range.' },
            Reference: { title: 'Reference Intervals', samples: 20, desc: 'Run samples from healthy, normal donors. Verifies that the manufacturer\'s suggested normal reference ranges are appropriate for your local patient population.' }
        };

        const dayDisplay = document.getElementById('day-display'); const budgetDisplay = document.getElementById('budget-display'); const netDisplay = document.getElementById('net-display');
        const shopModal = document.getElementById('shop-modal'); const catalogContainer = document.getElementById('catalog-container');
        const rosterModal = document.getElementById('roster-modal'); const rosterBody = document.getElementById('roster-body');
        const labFloor = document.getElementById('lab-floor'); const arrangeBtn = document.getElementById('arrange-btn');
        const verificationView = document.getElementById('verification-view'); const verifSprite = document.getElementById('verif-sprite'); const verifName = document.getElementById('verif-name'); const studyButtonsContainer = document.getElementById('study-buttons-container');
        const studyRunnerView = document.getElementById('study-runner-view'); const runnerTableBody = document.getElementById('runner-table-body'); const runnerProgress = document.getElementById('runner-progress'); const runnerLight = document.getElementById('runner-light'); const runnerDecisions = document.getElementById('runner-decisions'); const runnerStats = document.getElementById('runner-stats'); const runnerGraphContainer = document.getElementById('runner-graph-container');

        /** --- CORE LOOP & UI --- */
        function initGame() { updateUI(); }
        function advanceShift() { currentDay++; let dailyRevenue = gameConfig.baseDailyVolume * gameConfig.revenuePerTest; currentBudget += dailyRevenue; currentBudget -= gameConfig.dailyOperatingCost; updateUI(); }
        function updateUI() {
            dayDisplay.textContent = currentDay; budgetDisplay.textContent = "$" + currentBudget.toLocaleString();
            let dailyNet = (gameConfig.baseDailyVolume * gameConfig.revenuePerTest) - gameConfig.dailyOperatingCost;
            if (dailyNet >= 0) { netDisplay.textContent = "+$" + dailyNet.toLocaleString() + " / day"; netDisplay.className = "net-indicator net-positive"; budgetDisplay.style.color = "var(--positive-color)"; } 
            else { netDisplay.textContent = "-$" + Math.abs(dailyNet).toLocaleString() + " / day"; netDisplay.className = "net-indicator net-negative"; budgetDisplay.style.color = "var(--negative-color)"; }
            if (shopModal.style.display === "flex") { populateShop(); }
        }

        /** --- SHOP / PLACEMENT --- */
        function openShop() { if (activeInstrument) return; if (isArrangeMode) toggleArrangeMode(); populateShop(); shopModal.style.display = 'flex'; }
        function closeShop() { shopModal.style.display = 'none'; }
        function populateShop() {
            catalogContainer.innerHTML = ''; 
            instrumentCatalog.forEach((inst, index) => {
                const canAfford = currentBudget >= inst.price; const card = document.createElement('div'); card.className = 'catalog-item';
                card.innerHTML = `
                    <div style="display:flex; gap:12px; align-items:center;">
                        <div style="width:48px; height:48px; display:flex; align-items:center; justify-content:center; border-radius:6px; overflow:hidden;">
                            ${inst.icon ? inst.icon : `<div style=\"width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;background:${inst.color};\">${inst.abv}</div>`}
                        </div>
                        <div style="flex:1;">
                            <div class="item-name">${inst.name}</div>
                            <div class="item-price">$${inst.price.toLocaleString()}</div>
                        </div>
                    </div>
                    <button class="buy-btn" ${!canAfford ? 'disabled' : ''} onclick="buyInstrument(${index})">${canAfford ? 'Purchase' : 'Insufficient Funds'}</button>`;
                catalogContainer.appendChild(card);
            });
        }
        function buyInstrument(index) {
            const inst = instrumentCatalog[index];
            if (currentBudget >= inst.price) { currentBudget -= inst.price; updateUI(); closeShop(); startPlacementMode(inst, null); }
        }
        function startPlacementMode(catalogData, existingId) {
            activeInstrument = catalogData; movingInstrumentId = existingId; labFloor.style.cursor = 'crosshair';
            ghostElement = document.createElement('div'); ghostElement.className = 'instrument-sprite ghost'; ghostElement.style.backgroundColor = catalogData.color; ghostElement.style.width = catalogData.w + 'px'; ghostElement.style.height = catalogData.h + 'px';
            ghostElement.innerHTML = catalogData.icon ? catalogData.icon : catalogData.abv;
            document.body.appendChild(ghostElement); document.addEventListener('mousemove', moveGhost); setTimeout(() => { labFloor.addEventListener('click', finalizePlacement, { once: true }); }, 10);
        }
        function moveGhost(e) { if (ghostElement) { ghostElement.style.left = e.clientX + 'px'; ghostElement.style.top = e.clientY + 'px'; } }
        function finalizePlacement(e) {
            if (!activeInstrument) return;
            const rect = labFloor.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            if (movingInstrumentId) { const perm = document.getElementById(movingInstrumentId); perm.style.left = x + 'px'; perm.style.top = y + 'px'; perm.style.display = 'flex'; } 
            else {
                const uniqueId = 'inst_' + instrumentIdCounter++; const perm = document.createElement('div'); perm.id = uniqueId; perm.className = 'instrument-sprite'; perm.style.backgroundColor = activeInstrument.color; perm.style.width = activeInstrument.w + 'px'; perm.style.height = activeInstrument.h + 'px'; perm.style.left = x + 'px'; perm.style.top = y + 'px'; perm.innerHTML = activeInstrument.icon ? activeInstrument.icon : activeInstrument.abv; perm.title = activeInstrument.name;
                perm.onclick = (event) => handleInstrumentClick(event, uniqueId); labFloor.appendChild(perm);
                ownedInstruments.push({ id: uniqueId, catalogId: activeInstrument.id, name: activeInstrument.name, status: 'Offline', qc: 'Offline', pt: 'Offline', verification: 'Not Verified', studies: { Background: 'Not Started', Carryover: 'Not Started', Precision: 'Not Started', Accuracy: 'Not Started', AMR: 'Not Started', Reference: 'Not Started' } });
            }
            document.removeEventListener('mousemove', moveGhost); if (ghostElement) { ghostElement.remove(); ghostElement = null; } activeInstrument = null; movingInstrumentId = null; labFloor.style.cursor = 'default'; if (isArrangeMode) toggleArrangeMode();
        }
        function toggleArrangeMode() {
            if (activeInstrument) return; isArrangeMode = !isArrangeMode;
            if (isArrangeMode) { arrangeBtn.classList.add('active'); arrangeBtn.textContent = "Cancel Arrange"; labFloor.classList.add('arrange-active'); } 
            else { arrangeBtn.classList.remove('active'); arrangeBtn.textContent = "Arrange Instruments"; labFloor.classList.remove('arrange-active'); }
        }
        function handleInstrumentClick(e, domId) {
            if (!isArrangeMode || activeInstrument) return; e.stopPropagation(); 
            const instData = ownedInstruments.find(i => i.id === domId); const catalogData = instrumentCatalog.find(c => c.id === instData.catalogId);
            document.getElementById(domId).style.display = 'none'; startPlacementMode(catalogData, domId);
            if (ghostElement) { ghostElement.style.left = e.clientX + 'px'; ghostElement.style.top = e.clientY + 'px'; }
        }

        /** --- ROSTER & VERIFICATION SCREEN --- */
        function openRoster() { if (activeInstrument) return; populateRoster(); rosterModal.style.display = 'flex'; } function closeRoster() { rosterModal.style.display = 'none'; }
        function getBadgeClass(statusStr) { if (['pass', 'online', 'verified', 'complete'].includes(statusStr.toLowerCase())) return 'badge-pass'; if (['fail', 'not verified'].includes(statusStr.toLowerCase())) return 'badge-fail'; return 'badge-offline'; }
        function populateRoster() {
            rosterBody.innerHTML = '';
            if (ownedInstruments.length === 0) { rosterBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No instruments currently in lab.</td></tr>`; return; }
            ownedInstruments.forEach(inst => {
                const tr = document.createElement('tr'); let verifHTML = `<span class="status-badge ${getBadgeClass(inst.verification)}">${inst.verification}</span>`;
                if (inst.verification === 'Not Verified') { verifHTML = `<button class="status-badge clickable ${getBadgeClass(inst.verification)}" onclick="openVerificationScreen('${inst.id}')">${inst.verification}</button>`; }
                tr.innerHTML = `<td><strong>${inst.name}</strong></td><td><span class="status-badge ${getBadgeClass(inst.status)}">${inst.status}</span></td><td><span class="status-badge ${getBadgeClass(inst.qc)}">${inst.qc}</span></td><td><span class="status-badge ${getBadgeClass(inst.pt)}">${inst.pt}</span></td><td>${verifHTML}</td>`;
                rosterBody.appendChild(tr);
            });
        }
        function openVerificationScreen(instId) {
            verifyingInstrumentId = instId; const instData = ownedInstruments.find(i => i.id === instId); const catalogData = instrumentCatalog.find(c => c.id === instData.catalogId);
            verifName.textContent = instData.name; verifSprite.style.backgroundColor = catalogData.color; verifSprite.replaceChildren();
            if (catalogData.icon) { verifSprite.innerHTML = catalogData.icon; } else { verifSprite.textContent = catalogData.abv; }
            verifSprite.style.width = (catalogData.w * 2) + 'px'; verifSprite.style.height = (catalogData.h * 2) + 'px';
            renderStudyButtons(instData); closeRoster(); verificationView.style.display = 'flex';
        }
        function openIFU() {
            if (!verifyingInstrumentId) return; const instData = ownedInstruments.find(i => i.id === verifyingInstrumentId); const catalogData = instrumentCatalog.find(c => c.id === instData.catalogId);
            document.getElementById('ifu-content').innerHTML = catalogData.ifu || '<p>No IFU available for this instrument.</p>'; document.getElementById('ifu-modal').style.display = 'flex';
        }
        function renderStudyButtons(instData) {
            studyButtonsContainer.innerHTML = ''; const studiesList = ['Background', 'Carryover', 'Precision', 'Accuracy', 'AMR', 'Reference'];
            studiesList.forEach(key => {
                const status = instData.studies[key]; const def = studyDefs[key];
                let statusClass = 'status-not-started'; if (status === 'Pass') statusClass = 'status-pass'; if (status === 'Fail') statusClass = 'status-fail';
                const btn = document.createElement('button'); btn.className = 'study-btn'; btn.onclick = () => launchStudyRunner(key);
                btn.innerHTML = `<span>${def.title}</span><span class="study-status ${statusClass}">${status}</span>`; studyButtonsContainer.appendChild(btn);
            });
        }
        function closeVerificationScreen() { verificationView.style.display = 'none'; verifyingInstrumentId = null; }

        function setResultsTableForStudy(studyKey) {
            const headerRow = document.querySelector('.results-table thead tr');
            if (!headerRow) return;
            if (studyKey === 'Accuracy') {
                headerRow.innerHTML = '<th>Sample #</th><th>WBC Ref</th><th>WBC</th><th>RBC Ref</th><th>RBC</th><th>HGB Ref</th><th>HGB</th><th>PLT Ref</th><th>PLT</th>';
            } else {
                headerRow.innerHTML = '<th>Sample #</th><th>WBC (10³/µL)</th><th>RBC (10⁶/µL)</th><th>HGB (g/dL)</th><th>PLT (10³/µL)</th>';
            }
        }

        function buildAccuracyGraphSet(extraData, data) {
            const params = [
                { key: 'wbc', label: 'WBC', ref: extraData.refWbc, xLabel: 'Reference Method WBC', yLabel: 'Observed Test WBC' },
                { key: 'rbc', label: 'RBC', ref: extraData.refRbc, xLabel: 'Reference Method RBC', yLabel: 'Observed Test RBC' },
                { key: 'hgb', label: 'HGB', ref: extraData.refHgb, xLabel: 'Reference Method HGB', yLabel: 'Observed Test HGB' },
                { key: 'plt', label: 'PLT', ref: extraData.refPlt, xLabel: 'Reference Method PLT', yLabel: 'Observed Test PLT' }
            ];

            const row = document.createElement('div'); row.className = 'graph-choice-row';
            params.forEach(({ key, label, ref, xLabel, yLabel }) => {
                const btn = document.createElement('button');
                btn.className = 'graph-choice-btn';
                btn.textContent = `${label} Graph`;
                btn.onclick = () => openAccuracyGraphPopup(key, extraData, data, xLabel, yLabel);
                row.appendChild(btn);
            });
            runnerGraphContainer.innerHTML = '';
            runnerGraphContainer.appendChild(row);
            runnerGraphContainer.style.marginTop = '0';
            runnerGraphContainer.style.paddingTop = '0';
        }

        function openAccuracyGraphPopup(key, extraData, data, xLabel, yLabel) {
            const keyMap = {
                wbc: { ref: extraData.refWbc, y: data.wbc, title: 'WBC' },
                rbc: { ref: extraData.refRbc, y: data.rbc, title: 'RBC' },
                hgb: { ref: extraData.refHgb, y: data.hgb, title: 'HGB' },
                plt: { ref: extraData.refPlt, y: data.plt, title: 'PLT' }
            };
            const metric = keyMap[key];
            document.getElementById('graph-modal-title').textContent = `${metric.title} Accuracy Graph`;
            document.getElementById('graph-modal-content').innerHTML = buildSVGPlot(metric.ref, metric.y, xLabel, yLabel);
            document.getElementById('graph-modal').style.display = 'flex';
        }

        /** --- MATH HELPERS --- */
        const calcMean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
        const calcSD = (arr, mean) => Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (arr.length - 1));
        const calcCV = (sd, mean) => (sd / mean) * 100;
        const calcRI = (arr) => { const m = calcMean(arr); const s = calcSD(arr, m); return `${Math.max(0, (m - 2*s)).toFixed(1)} - ${(m + 2*s).toFixed(1)}`; };
        const pearsonR = (x, y) => {
            const xM = calcMean(x), yM = calcMean(y);
            let num = 0, den1 = 0, den2 = 0;
            for(let i=0; i<x.length; i++) {
                num += (x[i] - xM) * (y[i] - yM);
                den1 += Math.pow(x[i] - xM, 2); den2 += Math.pow(y[i] - yM, 2);
            }
            return num / Math.sqrt(den1 * den2);
        };
        const buildSVGPlot = (xData, yData, xTitle, yTitle) => {
            const xMin = Math.min(...xData); const xMax = Math.max(...xData); const yMin = Math.min(...yData); const yMax = Math.max(...yData);
            const commonMin = Math.min(xMin, yMin); const commonMax = Math.max(xMax, yMax);
            const pad = (commonMax - commonMin || 1) * 0.15;
            const plotMin = commonMin - pad; const plotMax = commonMax + pad; const plotRange = plotMax - plotMin || 1;
            const plotSize = 180;
            const margin = 54;
            const labelSpace = 20;
            const legendStartY = 18;

            let points = '';
            let ticks = '';
            const tickCount = 5;
            for (let i = 0; i <= tickCount; i++) {
                const ratio = i / tickCount;
                const value = plotMin + (plotRange * ratio);
                const xPx = margin + (ratio * plotSize);
                const yPx = margin + plotSize - (ratio * plotSize);
                ticks += `<line x1="${xPx}" y1="${margin}" x2="${xPx}" y2="${margin + plotSize}" stroke="rgba(255,255,255,0.12)" stroke-width="1" />`;
                ticks += `<line x1="${margin}" y1="${yPx}" x2="${margin + plotSize}" y2="${yPx}" stroke="rgba(255,255,255,0.12)" stroke-width="1" />`;
                ticks += `<text x="${xPx}" y="${margin + plotSize + labelSpace}" fill="#f8fafc" font-size="9" text-anchor="middle">${value.toFixed(1)}</text>`;
                ticks += `<text x="${margin - 10}" y="${yPx + 3}" fill="#f8fafc" font-size="9" text-anchor="end">${value.toFixed(1)}</text>`;
            }

            for(let i=0; i<xData.length; i++) {
                const nx = margin + ((xData[i] - plotMin) / plotRange) * plotSize;
                const ny = margin + plotSize - ((yData[i] - plotMin) / plotRange) * plotSize;
                points += `<circle cx="${nx.toFixed(2)}" cy="${ny.toFixed(2)}" r="2.2" fill="#f8fafc" stroke="#38bdf8" stroke-width="0.9" />`;
            }
            return `
                <div style="font-size: 0.9rem; font-weight: bold; color: #f8fafc; margin-bottom: 4px;">${xTitle} vs ${yTitle}</div>
                <svg viewBox="0 0 300 290" width="100%" height="100%" style="max-width: 100%; max-height: 100%; background: #111827; border: 1px solid #334155; border-radius: 8px; display: block;">
                    ${ticks}
                    <line x1="${margin}" y1="${margin + plotSize}" x2="${margin + plotSize}" y2="${margin + plotSize}" stroke="#f8fafc" stroke-width="1.5"/>
                    <line x1="${margin}" y1="${margin}" x2="${margin}" y2="${margin + plotSize}" stroke="#f8fafc" stroke-width="1.5"/>
                    <line x1="${margin}" y1="${margin + plotSize}" x2="${margin + plotSize}" y2="${margin}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4" opacity="0.8"/>
                    ${points}
                    <text x="${margin + plotSize / 2}" y="282" fill="#f8fafc" font-size="10" text-anchor="middle">Reference</text>
                    <text x="20" y="${margin + plotSize / 2}" fill="#f8fafc" font-size="10" transform="rotate(-90 20 ${margin + plotSize / 2})" text-anchor="middle">Instrument</text>
                </svg>
            `;
        };

        /** --- STUDY RUNNER ENGINE --- */
        function renderPrecisionRows(data) {
            runnerTableBody.innerHTML = '';
            for (let i = 0; i < data.wbc.length; i++) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>Sample ${i + 1}</td><td>${data.wbc[i].toFixed(2)}</td><td>${data.rbc[i].toFixed(2)}</td><td>${data.hgb[i].toFixed(1)}</td><td>${data.plt[i].toFixed(0)}</td>`;
                runnerTableBody.appendChild(tr);
            }
        }

        function buildLowVarianceSeries(mean, length) {
            return Array.from({ length }, (_, idx) => {
                const jitter = (Math.random() - 0.5) * 0.03;
                const stableFactor = 1 + jitter + ((idx % 3) - 1) * 0.007;
                return mean * stableFactor;
            });
        }

        function buildFailSeries(mean, length) {
            let arr = [];
            while (true) {
                arr = Array.from({ length }, (_, idx) => {
                    const factors = [1.18, 0.9, 1.45, 0.72, 1.25, 0.8, 1.52, 0.7, 1.28, 0.88, 1.38, 0.75];
                    const scale = factors[idx % factors.length];
                    return mean * scale * (1 + (Math.random() - 0.5) * 0.04);
                });
                const m = calcMean(arr); const s = calcSD(arr, m); const cv = calcCV(s, m);
                if (cv > 5) return arr;
            }
        }

        function applyPrecisionRunBias(data) {
            const keyMap = ['wbc', 'rbc', 'hgb', 'plt'];
            const runIndex = precisionRunCounter;
            precisionRunCounter += 1;

            if (runIndex === 0) {
                const badKey = keyMap[Math.floor(Math.random() * keyMap.length)];
                const baselineMeans = {};
                keyMap.forEach(key => { baselineMeans[key] = calcMean(data[key]); });
                keyMap.forEach(key => {
                    if (key === badKey) {
                        data[key] = buildFailSeries(baselineMeans[key], data[key].length);
                    } else {
                        data[key] = buildLowVarianceSeries(baselineMeans[key], data[key].length);
                    }
                });
                return badKey;
            }

            if (runIndex === 1) {
                keyMap.forEach(key => {
                    const mean = calcMean(data[key]);
                    data[key] = buildLowVarianceSeries(mean, data[key].length);
                });
                return null;
            }

            const shouldFail = Math.random() < 0.5;
            if (!shouldFail) {
                keyMap.forEach(key => {
                    const mean = calcMean(data[key]);
                    data[key] = buildLowVarianceSeries(mean, data[key].length);
                });
                return null;
            }

            const badKey = keyMap[Math.floor(Math.random() * keyMap.length)];
            const baselineMeans = {};
            keyMap.forEach(key => { baselineMeans[key] = calcMean(data[key]); });
            keyMap.forEach(key => {
                if (key === badKey) {
                    data[key] = buildFailSeries(baselineMeans[key], data[key].length);
                } else {
                    data[key] = buildLowVarianceSeries(baselineMeans[key], data[key].length);
                }
            });
            return badKey;
        }

        function launchStudyRunner(studyKey) {
            activeStudyKey = studyKey; const def = studyDefs[studyKey];
            const instData = ownedInstruments.find(i => i.id === verifyingInstrumentId); const catalogData = instrumentCatalog.find(c => c.id === instData.catalogId);

            document.getElementById('runner-title').textContent = def.title; document.getElementById('runner-desc').textContent = def.desc;
            const machineIcon = document.getElementById('runner-machine-icon');
            machineIcon.innerHTML = catalogData.icon ? catalogData.icon : `<div style="background-color: ${catalogData.color}; width: 100%; height: 100%; border-radius: 8px; border: 4px solid #1e293b; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; color: white;">${catalogData.abv}</div>`;
              
            setResultsTableForStudy(studyKey);
            runnerTableBody.innerHTML = ''; runnerProgress.textContent = `Processing 0 / ${def.samples}`;
            runnerStats.innerHTML = 'Awaiting Data...'; runnerDecisions.style.display = 'none';
            runnerGraphContainer.style.display = 'none'; runnerGraphContainer.innerHTML = '';
            runnerLight.classList.add('active');

            verificationView.style.display = 'none'; studyRunnerView.style.display = 'flex';

            let currentSample = 0; let mockDataCache = { wbc: [], rbc: [], hgb: [], plt: [] };
            let extraData = { refWbc: [], refRbc: [], refHgb: [], refPlt: [], expectedAmr: [] };
            let prevHigh = null;

            const interval = setInterval(() => {
                currentSample++; runnerProgress.textContent = `Processing ${currentSample} / ${def.samples}`;
                let wbc, rbc, hgb, plt; let sampleLabel = currentSample;
                 
                if (studyKey === 'Background') {
                    // 95% pass rate (<=0.02), 5% fail rate for RBC background
                    wbc = (Math.random() < 0.95 ? Math.random() * 0.1 : 0.12 + Math.random() * 0.05).toFixed(2); 
                    rbc = (Math.random() < 0.95 ? Math.random() * 0.02 : 0.025 + Math.random() * 0.02).toFixed(2);
                    hgb = (Math.random() * 0.1).toFixed(1); 
                    plt = Math.floor(Math.random() * 5);
                    sampleLabel = `${currentSample} (Blank)`;
                } 
                else if (studyKey === 'Carryover') {
                    if (currentSample % 2 !== 0) {
                        wbc = (15.0 + Math.random() * 5.0).toFixed(2); rbc = (6.0 + Math.random() * 0.8).toFixed(2);
                        hgb = (18.0 + Math.random() * 2.0).toFixed(1); plt = Math.floor(450 + Math.random() * 150);
                        prevHigh = { wbc, rbc, hgb, plt }; sampleLabel = `${currentSample} (High)`;
                    } else {
                        wbc = (Math.random() * 0.1).toFixed(2); rbc = (Math.random() * 0.02).toFixed(2);
                        hgb = (Math.random() * 0.1).toFixed(1); plt = Math.floor(Math.random() * 5);
                        let coWbc = ((wbc / prevHigh.wbc) * 100).toFixed(2);
                        sampleLabel = `${currentSample} (Blank - CO: ${coWbc}%)`;
                    }
                } 
                else if (studyKey === 'Accuracy') {
                    let refWbc = (Math.random() * 20 + 2); let refRbc = (4.8 + (Math.random() - 0.5) * 0.4); let refHgb = (14.0 + (Math.random() - 0.5) * 1.0); let refPlt = 250 + (Math.random() - 0.5) * 50;
                    extraData.refWbc.push(refWbc); extraData.refRbc.push(refRbc); extraData.refHgb.push(refHgb); extraData.refPlt.push(refPlt);
                    wbc = (refWbc * (0.95 + Math.random() * 0.1)).toFixed(2);
                    rbc = (refRbc * (0.95 + Math.random() * 0.1)).toFixed(2); hgb = (refHgb * (0.95 + Math.random() * 0.1)).toFixed(1); plt = Math.floor(refPlt * (0.95 + Math.random() * 0.1));
                }
                else if (studyKey === 'AMR') {
                    let level = (currentSample - 1) * 20; // 0, 20, 40, 60, 80
                    extraData.expectedAmr.push(level);
                    wbc = currentSample === 1 ? (Math.random() * 0.1).toFixed(2) : (level * (0.95 + Math.random() * 0.1)).toFixed(2);
                    rbc = (4.8).toFixed(2); hgb = (14.0).toFixed(1); plt = 250; // Keep others static to show focus on WBC
                }
                else {
                    wbc = (7.5 + (Math.random() - 0.5) * 1.5).toFixed(2); rbc = (4.8 + (Math.random() - 0.5) * 0.4).toFixed(2);
                    hgb = (14.0 + (Math.random() - 0.5) * 1.0).toFixed(1); plt = Math.floor(250 + (Math.random() - 0.5) * 50);
                }

                mockDataCache.wbc.push(parseFloat(wbc)); mockDataCache.rbc.push(parseFloat(rbc)); mockDataCache.hgb.push(parseFloat(hgb)); mockDataCache.plt.push(parseInt(plt));

                const tr = document.createElement('tr');
                if (studyKey === 'Accuracy') {
                    tr.innerHTML = `<td>${sampleLabel}</td><td>${extraData.refWbc[currentSample - 1].toFixed(2)}</td><td>${wbc}</td><td>${extraData.refRbc[currentSample - 1].toFixed(2)}</td><td>${rbc}</td><td>${extraData.refHgb[currentSample - 1].toFixed(1)}</td><td>${hgb}</td><td>${extraData.refPlt[currentSample - 1].toFixed(0)}</td><td>${plt}</td>`;
                } else {
                    tr.innerHTML = `<td>${sampleLabel}</td><td>${wbc}</td><td>${rbc}</td><td>${hgb}</td><td>${plt}</td>`;
                }
                runnerTableBody.insertBefore(tr, runnerTableBody.firstChild);

                if (currentSample >= def.samples) {
                    clearInterval(interval); runnerLight.classList.remove('active'); runnerProgress.textContent = "Run Complete";
                    if (studyKey === 'Precision') {
                        const precisionFailureKey = applyPrecisionRunBias(mockDataCache);
                        renderPrecisionRows(mockDataCache);
                        showStats(mockDataCache, extraData, precisionFailureKey);
                    } else {
                        showStats(mockDataCache, extraData); 
                    }
                    runnerDecisions.style.display = 'flex'; 
                }
            }, 100); // Speeds up the rendering for 40-sample accuracy runs
        }

        function showStats(data, extraData, precisionFailureKey = null) {
            if (activeStudyKey === 'Precision') {
                const wM = calcMean(data.wbc), wS = calcSD(data.wbc, wM), wC = calcCV(wS, wM);
                const rM = calcMean(data.rbc), rS = calcSD(data.rbc, rM), rC = calcCV(rS, rM);
                const hM = calcMean(data.hgb), hS = calcSD(data.hgb, hM), hC = calcCV(hS, hM);
                const pM = calcMean(data.plt), pS = calcSD(data.plt, pM), pC = calcCV(pS, pM);

                runnerStats.innerHTML = `
                    <div style="color: var(--accent-color); font-weight: bold; margin-bottom: 5px;">Precision Statistics Summary:</div>
                    <table class="stats-grid">
                        <tr><th>Param</th><th>Mean</th><th>SD</th><th>%CV</th></tr>
                        <tr><td>WBC</td><td>${wM.toFixed(2)}</td><td>${wS.toFixed(2)}</td><td>${wC.toFixed(2)}%</td></tr>
                        <tr><td>RBC</td><td>${rM.toFixed(2)}</td><td>${rS.toFixed(2)}</td><td>${rC.toFixed(2)}%</td></tr>
                        <tr><td>HGB</td><td>${hM.toFixed(1)}</td><td>${hS.toFixed(2)}</td><td>${hC.toFixed(2)}%</td></tr>
                        <tr><td>PLT</td><td>${pM.toFixed(0)}</td><td>${pS.toFixed(1)}</td><td>${pC.toFixed(2)}%</td></tr>
                    </table>
                `;
            } 
            else if (activeStudyKey === 'Accuracy') {
                const rWbc = pearsonR(extraData.refWbc, data.wbc);
                const rRbc = pearsonR(extraData.refRbc, data.rbc);
                const rHgb = pearsonR(extraData.refHgb, data.hgb);
                const rPlt = pearsonR(extraData.refPlt, data.plt);
                runnerStats.innerHTML = `
                    Run Complete. <br>
                    <span style="color: var(--accent-color); font-weight:bold;">WBC Correlation (R) = ${rWbc.toFixed(4)}</span><br>
                    <span style="color: var(--accent-color); font-weight:bold;">RBC Correlation (R) = ${rRbc.toFixed(4)}</span><br>
                    <span style="color: var(--accent-color); font-weight:bold;">HGB Correlation (R) = ${rHgb.toFixed(4)}</span><br>
                    <span style="color: var(--accent-color); font-weight:bold;">PLT Correlation (R) = ${rPlt.toFixed(4)}</span><br>
                    <span style="color: var(--warning-color);">Review correlation against IFU limits (must be &ge; 0.95).</span>
                `;
                runnerGraphContainer.style.display = 'flex';
                buildAccuracyGraphSet(extraData, data);
            }
            else if (activeStudyKey === 'AMR') {
                const rVal = pearsonR(extraData.expectedAmr, data.wbc);
                runnerStats.innerHTML = `Run Complete. <br><span style="color: var(--accent-color); font-weight:bold;">Linearity (R) = ${rVal.toFixed(4)}</span><br><span style="color: var(--warning-color);">Ensure visually linear correlation across the Analytical Measurement Range.</span>`;
                runnerGraphContainer.style.display = 'flex';
                runnerGraphContainer.innerHTML = buildSVGPlot(extraData.expectedAmr, data.wbc, "Expected Calibration Level", "Observed Level");
            }
            else if (activeStudyKey === 'Reference') {
                // Add Reference Interval summary row to the very top of the table
                const tr = document.createElement('tr');
                tr.style.backgroundColor = 'rgba(56, 189, 248, 0.15)'; tr.style.color = 'var(--accent-color)'; tr.style.fontWeight = 'bold';
                tr.innerHTML = `<td>Calc. Ref. Int.</td><td>${calcRI(data.wbc)}</td><td>${calcRI(data.rbc)}</td><td>${calcRI(data.hgb)}</td><td>${calcRI(data.plt)}</td>`;
                runnerTableBody.insertBefore(tr, runnerTableBody.firstChild);
                runnerStats.innerHTML = `Run Complete. <br><span style="color: var(--warning-color);">The calculated 95% Confidence Intervals have been generated in the blue row above. Verify they align with expected demographics before accepting.</span>`;
            }
            else {
                runnerStats.innerHTML = `Run Complete. <br><span style="color: var(--warning-color);">Please review the data in the table above and compare it to the IFU limits before accepting.</span>`;
            }
        }

        function finalizeStudy(didAccept) {
            const instData = ownedInstruments.find(i => i.id === verifyingInstrumentId);
            instData.studies[activeStudyKey] = didAccept ? 'Pass' : 'Fail';
            let allPassed = true; for (const key in instData.studies) { if (instData.studies[key] !== 'Pass') { allPassed = false; break; } }
            if (allPassed) { instData.verification = 'Complete'; instData.status = 'Online'; alert(`${instData.name} has passed all verification studies and is now ONLINE.`); }
            studyRunnerView.style.display = 'none';
            if (allPassed) { verifyingInstrumentId = null; } else { renderStudyButtons(instData); verificationView.style.display = 'flex'; }
        }
        initGame();
    
