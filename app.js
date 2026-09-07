
        /** --- GAME STATE & CONFIG --- */
        const gameConfig = { startingBudget: 250000, dailyOperatingCost: 2000, revenuePerTest: 15, baseDailyVolume: 300 };
        let currentDay = 1; let currentBudget = gameConfig.startingBudget;
        const complianceState = {
            certificate: null,
            certificationPath: null,
            complexity: null,
            agency: null,
            inspectionTimer: 90,
            pocTimer: null,
            deficiencies: [],
            ptEnrollment: false,
            directorLogsSigned: false,
            staffQualified: true,
            testingDisabled: false,
            permanentActions: []
        };

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

        let ownedInstruments = []; let instrumentIdCounter = 0; let activeInstrument = null; let ghostElement = null; let isArrangeMode = false; let movingInstrumentId = null; let activeShopSegment = 'instruments';
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
        const advanceDaysModal = document.getElementById('advance-days-modal'); const advanceDaysInput = document.getElementById('advance-days-input');
        const rosterModal = document.getElementById('roster-modal'); const rosterBody = document.getElementById('roster-body');
        const devToolsModal = document.getElementById('devtools-modal'); const devToolsContainer = document.getElementById('devtools-container');
        const complianceModal = document.getElementById('compliance-modal'); const complianceContent = document.getElementById('compliance-content');
        const certificateFrame = document.getElementById('certificate-frame'); const certificateTitle = document.getElementById('certificate-title'); const certificateCountdown = document.getElementById('certificate-countdown');
        const qcModal = document.getElementById('qc-modal'); const qcModalContent = document.getElementById('qc-modal-content'); const qcModalTitle = document.getElementById('qc-modal-title');
        const labFloor = document.getElementById('lab-floor'); const arrangeBtn = document.getElementById('arrange-btn');
        const verificationView = document.getElementById('verification-view'); const verifSprite = document.getElementById('verif-sprite'); const verifName = document.getElementById('verif-name'); const studyButtonsContainer = document.getElementById('study-buttons-container');
        const studyRunnerView = document.getElementById('study-runner-view'); const runnerTableBody = document.getElementById('runner-table-body'); const runnerProgress = document.getElementById('runner-progress'); const runnerLight = document.getElementById('runner-light'); const runnerDecisions = document.getElementById('runner-decisions'); const runnerStats = document.getElementById('runner-stats'); const runnerGraphContainer = document.getElementById('runner-graph-container');

        /** --- CORE LOOP & UI --- */
        function initGame() { updateUI(); }
        function advanceShift() {
            currentDay++;
            const revenueBonus = complianceState.agency === 'CAP' ? 1.1 : 1;
            const dailyRevenue = complianceState.testingDisabled ? 0 : gameConfig.baseDailyVolume * gameConfig.revenuePerTest * revenueBonus;
            const payroll = complianceState.complexity === 'high' ? 3500 : gameConfig.dailyOperatingCost;
            currentBudget += dailyRevenue - payroll;
            if (complianceState.certificate && complianceState.pocTimer !== null) {
                complianceState.pocTimer--;
                if (complianceState.pocTimer <= 0 && complianceState.deficiencies.length) {
                    complianceState.testingDisabled = true;
                    complianceState.pocTimer = 0;
                }
            } else if (complianceState.certificate && complianceState.certificate.grade !== 'gold') {
                complianceState.inspectionTimer--;
                if (complianceState.inspectionTimer <= 0) runInspection();
            }
            updateQCDataOnDayAdvance(); updateUI();
        }
        function advanceMultipleDays() {
            advanceDaysInput.value = '7';
            advanceDaysModal.style.display = 'flex';
            setTimeout(() => { advanceDaysInput.focus(); advanceDaysInput.select(); }, 0);
        }
        function closeAdvanceDaysModal() {
            advanceDaysModal.style.display = 'none';
        }
        function confirmAdvanceMultipleDays() {
            const requestedDays = Number.parseInt(advanceDaysInput.value, 10);
            if (!Number.isInteger(requestedDays) || requestedDays < 1) return;
            const daysToAdvance = Math.min(requestedDays, 3650);
            closeAdvanceDaysModal();
            for (let day = 0; day < daysToAdvance; day++) advanceShift();
        }
        function updateUI() {
            dayDisplay.textContent = currentDay; budgetDisplay.textContent = "$" + currentBudget.toLocaleString();
            const revenueBonus = complianceState.agency === 'CAP' ? 1.1 : 1;
            let dailyNet = (complianceState.testingDisabled ? 0 : gameConfig.baseDailyVolume * gameConfig.revenuePerTest * revenueBonus) - (complianceState.complexity === 'high' ? 3500 : gameConfig.dailyOperatingCost);
            if (dailyNet >= 0) { netDisplay.textContent = "+$" + dailyNet.toLocaleString() + " / day"; netDisplay.className = "net-indicator net-positive"; budgetDisplay.style.color = "var(--positive-color)"; } 
            else { netDisplay.textContent = "-$" + Math.abs(dailyNet).toLocaleString() + " / day"; netDisplay.className = "net-indicator net-negative"; budgetDisplay.style.color = "var(--negative-color)"; }
            if (shopModal.style.display === "flex") { renderShopSegment(); }
            updateCertificateFrame();
        }

        /** --- SHOP / PLACEMENT --- */
        function openShop() { if (activeInstrument) return; if (isArrangeMode) toggleArrangeMode(); activeShopSegment = 'instruments'; renderShopSegment(); shopModal.style.display = 'flex'; }
        function closeShop() { shopModal.style.display = 'none'; }
        function openShopSegment(segment) {
            activeShopSegment = segment;
            renderShopSegment();
        }
        function renderShopSegment() {
            document.getElementById('shop-instruments-tab').classList.toggle('active', activeShopSegment === 'instruments');
            document.getElementById('shop-compliance-tab').classList.toggle('active', activeShopSegment === 'compliance');
            if (activeShopSegment === 'compliance') populateComplianceShop();
            else populateShop();
        }
        function populateComplianceShop() {
            catalogContainer.innerHTML = '';
            const card = document.createElement('div'); card.className = 'catalog-item';
            if (complianceState.ptEnrollment) {
                card.innerHTML = `<div><div class="item-name">PT Enrollment</div><div class="item-price">Enrolled</div><p class="devtools-note">The laboratory is enrolled in an external proficiency testing program.</p></div><button class="buy-btn" disabled>Enrolled</button>`;
            } else {
                card.innerHTML = `<div><div class="item-name">PT Enrollment</div><div class="item-price">$2,500 annual enrollment</div><p class="devtools-note">Enroll the laboratory in an external proficiency testing program.</p></div><button class="buy-btn" ${currentBudget < 2500 ? 'disabled' : ''} onclick="purchasePtEnrollment()">${currentBudget >= 2500 ? 'Purchase' : 'Insufficient Funds'}</button>`;
            }
            catalogContainer.appendChild(card);
        }
        function populateShop() {
            catalogContainer.innerHTML = ''; 
            instrumentCatalog.forEach((inst, index) => {
                const complexityLocked = complianceState.complexity === 'waived' && inst.id !== 'spun_hct';
                const canAfford = currentBudget >= inst.price && !complexityLocked; const card = document.createElement('div'); card.className = 'catalog-item';
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
                    <button class="buy-btn" ${!canAfford ? 'disabled' : ''} onclick="buyInstrument(${index})">${complexityLocked ? 'High Complexity Required' : canAfford ? 'Purchase' : 'Insufficient Funds'}</button>`;
                catalogContainer.appendChild(card);
            });
        }
        function purchasePtEnrollment() {
            if (complianceState.ptEnrollment || currentBudget < 2500) return;
            currentBudget -= 2500; complianceState.ptEnrollment = true; updateUI(); renderShopSegment(); renderComplianceModal();
        }
        function buyInstrument(index) {
            const inst = instrumentCatalog[index];
            if (complianceState.complexity === 'waived' && inst.id !== 'spun_hct') { alert('Waived complexity laboratories cannot purchase this analyzer.'); return; }
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
                ownedInstruments.push({ id: uniqueId, catalogId: activeInstrument.id, name: activeInstrument.name, status: 'Offline', qc: 'Not Verified', pt: 'Not Verified', verification: 'Not Verified', verificationDate: null, ptDueDay: null, ptHistory: [], ptCurrent: null, studies: { Background: 'Not Started', Carryover: 'Not Started', Precision: 'Not Started', Accuracy: 'Not Started', AMR: 'Not Started', Reference: 'Not Started' } });
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

        function openComplianceModal() { if (activeInstrument) return; renderComplianceModal(); complianceModal.style.display = 'flex'; }
        function closeComplianceModal() { complianceModal.style.display = 'none'; }
        function updateCertificateFrame() {
            if (!certificateFrame) return;
            const hasCertificate = Boolean(complianceState.certificate);
            certificateFrame.classList.toggle('registered', hasCertificate && complianceState.certificate.grade !== 'gold');
            certificateFrame.classList.toggle('gold', hasCertificate && complianceState.certificate.grade === 'gold');
            certificateTitle.textContent = hasCertificate ? complianceState.certificate.title : 'No Certificate';
            if (!hasCertificate) { certificateTitle.textContent = 'Apply for certification'; certificateCountdown.textContent = 'No certificate issued'; }
            else if (complianceState.pocTimer !== null) certificateCountdown.textContent = `POC: ${complianceState.pocTimer} days remaining`;
            else if (complianceState.certificate.grade === 'gold') certificateCountdown.textContent = `Inspection in ${complianceState.inspectionTimer} days`;
            else certificateCountdown.textContent = `Inspection in ${complianceState.inspectionTimer} days`;
        }
        function allInstrumentsVerified() {
            return ownedInstruments.length > 0 && ownedInstruments.every(inst => Object.values(inst.studies || {}).every(status => status === 'Pass') && isInstrumentVerified(inst));
        }
        function toggleComplianceRequirement(key) {
            complianceState[key] = !complianceState[key];
            renderComplianceModal(); updateUI();
        }
        function selectCertification(path) {
            complianceState.certificationPath = path;
            if (path === 'cms') complianceState.agency = 'CMS';
            if (path === 'cap') complianceState.agency = 'CAP';
            renderComplianceModal();
        }
        function resetCertificationChoice() {
            complianceState.certificationPath = null;
            complianceState.agency = null;
            renderComplianceModal();
        }
        function submitRegistration() {
            const complexity = document.querySelector('input[name="lab-complexity"]:checked')?.value;
            const agency = document.querySelector('input[name="inspecting-agency"]:checked')?.value || complianceState.agency;
            if (!complexity || !agency) { alert('Select a laboratory complexity and inspecting agency before submitting.'); return; }
            if (currentBudget < 1500) { alert('The $1,500 application fee cannot be paid.'); return; }
            currentBudget -= 1500;
            complianceState.complexity = complexity; complianceState.agency = agency;
            complianceState.certificate = { title: 'Certificate of Registration', grade: 'registration', issuedDay: currentDay };
            renderComplianceModal(); updateUI();
        }
        function getInspectionDeficiencies() {
            const findings = [];
            if (complianceState.complexity === 'high' && !complianceState.staffQualified) {
                findings.push({ id: 'staff', text: 'High Complexity laboratory is using under-qualified staff.', fine: 10000, action: 'Staff training completed and competency records added.' });
            }
            if (!allInstrumentsVerified()) {
                findings.push({ id: 'checklist-verification', text: 'The pre-inspection checklist is incomplete: instrument verification records are not 100% complete.', fine: 10000, action: 'All instruments must complete their verification studies before release.' });
            }
            if (!complianceState.directorLogsSigned) {
                findings.push({ id: 'director-logs', text: 'Director logs have not been signed before inspection.', fine: 5000, action: 'Director log sign-off is required at every inspection.' });
            }
            ownedInstruments.forEach(inst => {
                const studiesComplete = Object.values(inst.studies || {}).every(status => status === 'Pass');
                if (inst.status === 'Online' && !studiesComplete) {
                    findings.push({ id: `verification-${inst.id}`, text: `${inst.name} was placed Online before all verification studies were completed.`, fine: 15000, action: `${inst.name} release workflow requires completed verification.` });
                }
            });
            ownedInstruments.forEach(inst => {
                if (getQcMonthStatus(inst, getCurrentQcMonthKey()) === 'Out of Control' && inst.qc !== 'Verified' && inst.qc !== 'Pass') {
                    findings.push({ id: `qc-${inst.id}`, text: `${inst.name} has an out-of-control QC period without documented corrective action.`, fine: 7500, action: 'QC review and corrective-action documentation required.' });
                }
            });
            if (!complianceState.ptEnrollment) findings.push({ id: 'pt', text: 'The laboratory has no PT enrollment on file.', fine: 7500, action: 'Annual proficiency testing enrollment is now required.' });
            return findings;
        }
        function runInspection() {
            if (!complianceState.certificate || complianceState.certificate.grade === 'gold') return;
            complianceState.deficiencies = getInspectionDeficiencies();
            if (!complianceState.deficiencies.length) {
                awardGoldCertificate();
                alert('The Inspector has arrived. The laboratory passed inspection with no deficiencies.');
            } else {
                complianceState.pocTimer = 30;
                alert(`The Inspector has arrived. ${complianceState.deficiencies.length} deficiency(ies) require a Plan of Correction.`);
            }
            renderComplianceModal(); updateUI();
        }
        function awardGoldCertificate() {
            complianceState.certificate = { ...complianceState.certificate, title: complianceState.agency === 'CAP' ? 'Certificate of Accreditation' : 'Certificate of Compliance', grade: 'gold' };
            complianceState.inspectionTimer = 730; complianceState.pocTimer = null; complianceState.deficiencies = []; complianceState.testingDisabled = false;
        }
        function resolveDeficiency(deficiencyId) {
            const deficiency = complianceState.deficiencies.find(item => item.id === deficiencyId);
            if (!deficiency || currentBudget < deficiency.fine) { alert('Insufficient funds for this corrective action.'); return; }
            currentBudget -= deficiency.fine;
            complianceState.permanentActions.push(deficiency.action);
            complianceState.deficiencies = complianceState.deficiencies.filter(item => item.id !== deficiencyId);
            if (!complianceState.deficiencies.length) awardGoldCertificate();
            renderComplianceModal(); updateUI();
        }
        function renderComplianceModal() {
            if (!complianceContent) return;
            if (!complianceState.certificate) {
                if (!complianceState.certificationPath) {
                    complianceContent.innerHTML = `
                        <div class="compliance-section"><h3>Apply for certification</h3><p class="devtools-note">Choose the certification path for this laboratory.</p>
                            <div class="compliance-grid">
                                <button class="compliance-choice certification-option" onclick="selectCertification('registration')"><strong>Certificate of Registration</strong><span>Begin the CMS-116 registration process and start the 90-day inspection clock.</span></button>
                                <button class="compliance-choice certification-option" onclick="selectCertification('cms')"><strong>Certificate of Compliance via CMS</strong><span>Apply through CMS for the standard certificate of compliance.</span></button>
                                <button class="compliance-choice certification-option" onclick="selectCertification('cap')"><strong>Certificate of Accreditation via CAP</strong><span>Apply through CAP for accreditation and a revenue bonus.</span></button>
                            </div>
                        </div>`;
                    updateCertificateFrame();
                    return;
                }
                complianceContent.innerHTML = `
                    <div class="compliance-section"><h3>${complianceState.certificationPath === 'registration' ? 'CMS-116 Registration Form' : complianceState.certificationPath === 'cms' ? 'CMS Certificate of Compliance Application' : 'CAP Certificate of Accreditation Application'}</h3><p class="devtools-note">Application fee: $1,500. Select laboratory complexity before submitting.</p>
                        <div class="compliance-grid">
                            <label class="compliance-choice"><input type="radio" name="lab-complexity" value="waived"><strong>Waived</strong><span>Lowest cost. Heavy analyzers remain locked.</span></label>
                            <label class="compliance-choice"><input type="radio" name="lab-complexity" value="moderate"><strong>Moderate</strong><span>Standard complexity and operating costs.</span></label>
                            <label class="compliance-choice"><input type="radio" name="lab-complexity" value="high"><strong>High</strong><span>Higher payroll. Unlocks the full analyzer catalog.</span></label>
                        </div>
                    </div>
                    <div class="compliance-section"><h3>Inspecting Agency</h3><div class="compliance-grid">
                        <label class="compliance-choice"><input type="radio" name="inspecting-agency" value="CMS" ${complianceState.agency === 'CMS' ? 'checked' : ''}><strong>CMS</strong><span>Standard Certificate of Compliance.</span></label>
                        <label class="compliance-choice"><input type="radio" name="inspecting-agency" value="CAP" ${complianceState.agency === 'CAP' ? 'checked' : ''}><strong>CAP</strong><span>Premium accreditation with a revenue bonus.</span></label>
                    </div></div>
                    ${complianceState.certificationPath === 'registration' ? '<div class="compliance-section"><h3>Registration Readiness Checklist</h3><div class="compliance-checklist"><div class="compliance-check"><span>1. Purchase PT Enrollment from the shop</span></div><div class="compliance-check"><span>2. Complete instrument verifications</span></div><div class="compliance-check"><span>3. Sign director logs</span></div></div></div>' : ''}
                    <div style="display:flex; gap:10px; flex-wrap:wrap;"><button class="compliance-action" onclick="submitRegistration()">Submit Application and Pay $1,500</button><button class="quiz-back-btn" onclick="resetCertificationChoice()">Back to Certification Options</button></div>`;
                return;
            }
            const verified = allInstrumentsVerified();
            const checklist = [
                { key: 'ptEnrollment', label: 'Purchase PT Enrollment from the shop', complete: complianceState.ptEnrollment },
                { key: 'verified', label: 'Complete instrument verifications', complete: verified },
                { key: 'directorLogsSigned', label: 'Sign director logs', complete: complianceState.directorLogsSigned },
                { key: 'staffQualified', label: 'Confirm staff competency for the selected complexity', complete: complianceState.staffQualified }
            ];
            const findings = complianceState.deficiencies.length ? `<div class="compliance-section"><h3>Plan of Correction <strong>${complianceState.pocTimer} days</strong></h3>${complianceState.deficiencies.map(item => `<div class="compliance-finding"><div><p>${item.text}</p><span class="compliance-fine">Corrective action fine: $${item.fine.toLocaleString()} | Preventive action: ${item.action}</span></div><button class="compliance-action danger" onclick="resolveDeficiency('${item.id}')">Resolve</button></div>`).join('')}</div>` : '';
            complianceContent.innerHTML = `
                <div class="compliance-section"><div class="compliance-status"><div><h3>Certificate Status</h3><strong>${complianceState.certificate.title}</strong><p class="devtools-note">${complianceState.agency} | ${complianceState.complexity} complexity</p></div><div><strong>${complianceState.pocTimer !== null ? `${complianceState.pocTimer} days` : `${complianceState.inspectionTimer} days`}</strong><p class="devtools-note">${complianceState.pocTimer !== null ? 'POC timer' : 'until inspection'}</p></div></div></div>
                <div class="compliance-section"><h3>Pre-Inspection Checklist</h3><div class="compliance-checklist">${checklist.map(item => `<label class="compliance-check ${item.complete ? 'complete' : ''}"><input type="checkbox" ${item.complete ? 'checked' : ''} ${item.key === 'verified' ? 'disabled' : `onchange="toggleComplianceRequirement('${item.key}')"`}><span>${item.complete ? 'Complete: ' : 'Pending: '}${item.label}</span>${item.key === 'ptEnrollment' && !item.complete ? '<button type="button" class="compliance-action" onclick="closeComplianceModal(); openShop()">Open Shop</button>' : ''}</label>`).join('')}</div></div>
                ${findings}
                <div class="compliance-section"><h3>Audit Record</h3><p class="devtools-note">Permanent preventive actions: ${complianceState.permanentActions.length ? complianceState.permanentActions.join(' | ') : 'None recorded'}</p><p class="devtools-note">Patient testing: ${complianceState.testingDisabled ? 'DISABLED until compliance is restored' : 'Enabled'}</p></div>`;
        }

        /** --- ROSTER & VERIFICATION SCREEN --- */
        function openRoster() { if (activeInstrument) return; populateRoster(); rosterModal.style.display = 'flex'; } function closeRoster() { rosterModal.style.display = 'none'; }
        function openDevTools() { if (activeInstrument) return; populateDevTools(); devToolsModal.style.display = 'flex'; }
        function closeDevTools() { devToolsModal.style.display = 'none'; }

        function generateWestgardPattern({ mean, sd, rule, parameter }) {
            switch (rule) {
                case '2s':
                    return [
                        mean - (1.2 * sd),
                        mean - (0.8 * sd),
                        mean - (0.3 * sd),
                        mean + (0.7 * sd),
                        mean + (2.3 * sd),
                        mean + (0.5 * sd),
                        mean - (0.2 * sd)
                    ];
                case 'R4s':
                    return [
                        mean + (0.2 * sd),
                        mean - (0.5 * sd),
                        mean + (0.4 * sd),
                        mean - (0.7 * sd),
                        mean + (2.6 * sd),
                        mean - (2.2 * sd),
                        mean + (0.1 * sd)
                    ];
                case 'Drift':
                    return [
                        mean + (0.2 * sd),
                        mean + (0.7 * sd),
                        mean + (1.1 * sd),
                        mean + (1.8 * sd),
                        mean + (2.5 * sd),
                        mean + (3.1 * sd),
                        mean + (3.8 * sd)
                    ];
                case '10x':
                    return Array.from({ length: 11 }, (_, i) => mean + ((0.9 + (i * 0.15)) * sd));
                case '22s':
                    return [
                        mean + (0.2 * sd),
                        mean + (0.6 * sd),
                        mean + (1.0 * sd),
                        mean + (1.4 * sd),
                        mean + (2.5 * sd),
                        mean + (2.9 * sd),
                        mean + (0.8 * sd)
                    ];
                default:
                    return [mean, mean, mean, mean, mean, mean, mean];
            }
        }

        function buildWestgardQuestion({ parameter, mean, sd, rule, prompt, followUpAnswer, followUpOptions, ruleOptions }) {
            return {
                parameter,
                mean,
                sd,
                ruleAnswer: rule,
                ruleOptions,
                prompt,
                followUpQuestion: 'What is the correct follow-up action?',
                followUpAnswer,
                followUpOptions,
                points: generateWestgardPattern({ mean, sd, rule, parameter })
            };
        }

        const westgardQuizBank = [
            buildWestgardQuestion({
                parameter: 'RBC', mean: 5.1, sd: 0.18, rule: '2s',
                prompt: 'The following hematology QC run shows a single RBC value beyond the +2 SD limit. Which Westgard rule was broken?',
                followUpAnswer: 'Repeat the RBC control and verify sample aspiration, lyse reagent integrity, and analyzer carryover before releasing patient results.',
                followUpOptions: [
                    'Repeat the RBC control and verify sample aspiration, lyse reagent integrity, and analyzer carryover before releasing patient results.',
                    'Reject the run and immediately replace the instrument with a backup analyzer.',
                    'Ignore the warning if the next control is acceptable on the same shift.',
                    'Send the patient reports and troubleshoot after the end of the day.'
                ],
                ruleOptions: ['2s', 'R4s', '22s', '10x']
            }),
            buildWestgardQuestion({
                parameter: 'Hemoglobin', mean: 14.2, sd: 0.42, rule: 'R4s',
                prompt: 'Two consecutive control results are separated by more than 4 SD, which indicates a random error pattern. Which Westgard rule was broken?',
                followUpAnswer: 'Reject the run, repeat the control, and inspect the hemoglobin reagent, mixing and tubing for carryover or pipetting error before continuing.',
                followUpOptions: [
                    'Ignore the result because one control is acceptable.',
                    'Reject the run, repeat the control, and inspect the hemoglobin reagent, mixing and tubing for carryover or pipetting error before continuing.',
                    'Continue the run and document it in the monthly QC summary.',
                    'Only perform maintenance if the same error occurs again the next day.'
                ],
                ruleOptions: ['2s', 'R4s', 'Drift', '10x']
            }),
            buildWestgardQuestion({
                parameter: 'WBC', mean: 7.8, sd: 0.32, rule: 'Drift',
                prompt: 'The plot shows a sustained trend in the same direction across six consecutive control measurements. Which Westgard rule was broken?',
                followUpAnswer: 'Check WBC reagent concentration and storage, remix or replace the reagent, and verify analyzer maintenance before releasing results.',
                followUpOptions: [
                    'Document it and keep running without action.',
                    'Repeat the control once and ignore it.',
                    'Check WBC reagent concentration and storage, remix or replace the reagent, and verify analyzer maintenance before releasing results.',
                    'Continue using the reagent until the next monthly QC review.'
                ],
                ruleOptions: ['2s', 'Drift', 'R4s', '10x']
            }),
            buildWestgardQuestion({
                parameter: 'RBC', mean: 5.1, sd: 0.18, rule: '10x',
                prompt: 'Ten consecutive control values remain on the same side of the mean. Which Westgard rule was broken?',
                followUpAnswer: 'Investigate systematic bias in the RBC channel, verify calibration and reagent lot, and perform analyzer maintenance before resuming patient testing.',
                followUpOptions: [
                    'Ignore it because the values stayed within 2 SD.',
                    'Repeat the run only once and continue.',
                    'Investigate systematic bias in the RBC channel, verify calibration and reagent lot, and perform analyzer maintenance before resuming patient testing.',
                    'Call the manufacturer and ignore the problem until next month.'
                ],
                ruleOptions: ['2s', 'R4s', '10x', 'Drift']
            }),
            buildWestgardQuestion({
                parameter: 'Hemoglobin', mean: 14.2, sd: 0.42, rule: '22s',
                prompt: 'Two consecutive control values both exceed +2 SD on the same side of the mean. Which Westgard rule was broken?',
                followUpAnswer: 'Reject the run and investigate systematic error in the hemoglobin channel, including reagent integrity, calibration, and analyzer maintenance.',
                followUpOptions: [
                    'Ignore the finding if the other control remains normal.',
                    'Document it and continue until end of shift.',
                    'Reject the run and investigate systematic error in the hemoglobin channel, including reagent integrity, calibration, and analyzer maintenance.',
                    'Only check the lot number after the next QC event.'
                ],
                ruleOptions: ['22s', '2s', 'Drift', 'R4s']
            })
        ];

        const quizState = {
            module: 'menu',
            questionIndex: 0,
            completedModules: []
        };

        function upsertQuizResult(moduleName, score, possible) {
            const existing = quizState.completedModules.find(item => item.module === moduleName);
            if (existing) {
                existing.score = score;
                existing.possible = possible;
                return;
            }
            quizState.completedModules.push({ module: moduleName, score, possible });
        }

        function getQuizSummaryMarkup() {
            const totalScore = quizState.completedModules.reduce((sum, item) => sum + item.score, 0);
            const totalPossible = quizState.completedModules.reduce((sum, item) => sum + item.possible, 0);
            const modulesTaken = quizState.completedModules.length ? quizState.completedModules.map(item => `${item.module} (${item.score}/${item.possible})`).join(', ') : 'No quizzes completed yet';
            return `
                <div class="quiz-summary-panel">
                    <div class="quiz-summary-header">Quiz Summary</div>
                    <div class="quiz-summary-score">${totalScore} / ${totalPossible || 0}</div>
                    <div class="quiz-summary-header">Quizzes Taken</div>
                    <ul class="quiz-summary-list"><li>${modulesTaken}</li></ul>
                </div>
            `;
        }

        function buildWestgardChartSvg(question) {
            const values = question.points;
            const mean = question.mean;
            const sd = question.sd;
            const width = 640;
            const height = 290;
            const margin = { top: 18, right: 28, bottom: 34, left: 58 };
            const graphWidth = width - margin.left - margin.right;
            const graphHeight = height - margin.top - margin.bottom;
            const minValue = mean - (3 * sd);
            const maxValue = mean + (3 * sd);
            const yFor = (val) => margin.top + graphHeight - (((val - minValue) / (maxValue - minValue || 1)) * graphHeight);
            const xFor = (index) => margin.left + (index / Math.max(values.length - 1, 1)) * graphWidth;

            const controlLines = [-3, -2, -1, 0, 1, 2, 3].map(offset => {
                const value = mean + (offset * sd);
                const y = yFor(value);
                const isMean = offset === 0;
                return `
                    <line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="${isMean ? '#f8fafc' : 'rgba(148, 163, 184, 0.5)'}" stroke-dasharray="5 5" stroke-width="${isMean ? 1.4 : 1}" />
                    <text x="${width - margin.right - 8}" y="${y - 6}" fill="${isMean ? '#f8fafc' : '#94a3b8'}" font-size="10" text-anchor="end">${offset >= 0 ? '+' : ''}${offset} SD ${value.toFixed(2)}</text>
                `;
            }).join('');

            const points = values.map((value, index) => {
                const x = xFor(index);
                const y = yFor(value);
                return `
                    <circle cx="${x}" cy="${y}" r="5" fill="#4ade80" stroke="#f8fafc" stroke-width="1.2" />
                    <text x="${x}" y="${height - 8}" fill="#94a3b8" font-size="9" text-anchor="middle">${index + 1}</text>
                `;
            }).join('');

            return `
                <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="0" width="${width}" height="${height}" fill="rgba(15,23,42,0.9)" rx="8"/>
                    <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" stroke="#e2e8f0" />
                    <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="#e2e8f0" />
                    ${controlLines}
                    ${points}
                    <text x="${width / 2}" y="${height - 4}" fill="#94a3b8" font-size="11" text-anchor="middle">Control run</text>
                    <text x="16" y="${height / 2}" fill="#94a3b8" font-size="11" transform="rotate(-90 16 ${height / 2})" text-anchor="middle">Result</text>
                </svg>
            `;
        }

        function renderQuizMenu() {
            const container = document.getElementById('quiz-modal-content');
            container.innerHTML = `
                ${getQuizSummaryMarkup()}
                <div class="quiz-mode-list">
                    <button class="quiz-mode-btn" onclick="launchQuizOption('qc')">QC</button>
                    <button class="quiz-mode-btn" onclick="launchQuizOption('verification')">Verification</button>
                    <button class="quiz-mode-btn" onclick="launchQuizOption('clia')">CLIA</button>
                </div>
            `;
        }

        function renderQuizModule(moduleName) {
            const container = document.getElementById('quiz-modal-content');
            if (moduleName === 'qc') {
                const question = westgardQuizBank[quizState.questionIndex];
                const isRuleAnswered = question.ruleAnswered;
                const isFollowUpAnswered = question.followUpAnswered;
                const ruleButtons = question.ruleOptions.map(option => {
                    const selected = question.ruleSelected === option;
                    let classes = 'quiz-option';
                    if (isRuleAnswered) {
                        if (option === question.ruleAnswer) classes += ' correct';
                        else if (selected) classes += ' wrong';
                    }
                    return `<button class="${classes}" onclick="selectQcRule('${option}')">${option}</button>`;
                }).join('');

                const followUpButtons = question.followUpOptions.map(option => {
                    const selected = question.followUpSelected === option;
                    let classes = 'quiz-option';
                    if (isFollowUpAnswered) {
                        if (option === question.followUpAnswer) classes += ' correct';
                        else if (selected) classes += ' wrong';
                    }
                    return `<button class="${classes}" onclick="selectQcFollowUp('${option}')">${option}</button>`;
                }).join('');

                const followUpMarkup = question.ruleAnswered ? `
                    <div class="quiz-question" style="margin-top: 8px;">${question.followUpQuestion}</div>
                    <div class="quiz-answer-grid" style="margin-top: 10px;">${followUpButtons}</div>
                ` : '';

                let feedbackMarkup = '';
                if (question.ruleAnswered && !question.ruleCorrect) {
                    feedbackMarkup = `<div class="quiz-feedback error">Incorrect. The correct rule was <strong>${question.ruleAnswer}</strong>. Review the control pattern and continue to the follow-up question.</div>`;
                } else if (question.ruleAnswered && question.ruleCorrect) {
                    feedbackMarkup = `<div class="quiz-feedback success">Correct. The pattern matches ${question.ruleAnswer}. Continue to the follow-up question.</div>`;
                }

                if (question.followUpAnswered && question.followUpCorrect) {
                    feedbackMarkup += `<div class="quiz-feedback success" style="margin-top: 12px;">Correct follow-up action: ${question.followUpAnswer}</div>`;
                } else if (question.followUpAnswered && !question.followUpCorrect) {
                    feedbackMarkup += `<div class="quiz-feedback error" style="margin-top: 12px;">The correct follow-up action is: ${question.followUpAnswer}</div>`;
                }

                let nextButton = '';
                if (question.followUpAnswered) {
                    nextButton = `<button class="quiz-next-btn" onclick="advanceQcQuestion()">Next Question</button>`;
                }

                container.innerHTML = `
                    <div class="quiz-header-row">
                        <div class="quiz-progress">QC Quiz • Question ${quizState.questionIndex + 1} of ${westgardQuizBank.length}</div>
                        <button class="quiz-back-btn" onclick="renderQuizMenu()">Back</button>
                    </div>
                    <div class="quiz-card">
                        <div class="quiz-question"><strong>${question.parameter}</strong> • ${question.prompt}</div>
                        <div class="quiz-chart-wrap">${buildWestgardChartSvg(question)}</div>
                        <div class="quiz-question">Which rule was broken?</div>
                        <div class="quiz-answer-grid">${ruleButtons}</div>
                        ${feedbackMarkup}
                        ${followUpMarkup}
                        ${nextButton}
                    </div>
                `;
                return;
            }

            if (moduleName === 'verification') {
                const question = {
                    prompt: 'Which statement is correct before an instrument is released for routine clinical testing?',
                    answers: [
                        'Verification must confirm accuracy, precision, reportable range, and reference intervals per CLIA expectations.',
                        'Only the instrument serial number needs to be checked before putting it online.',
                        'The instrument can be used after a single control run.',
                        'Only QC review is required before routine use.'
                    ],
                    correct: 'Verification must confirm accuracy, precision, reportable range, and reference intervals per CLIA expectations.'
                };
                container.innerHTML = `
                    <div class="quiz-header-row">
                        <div class="quiz-progress">Verification Quiz</div>
                        <button class="quiz-back-btn" onclick="renderQuizMenu()">Back</button>
                    </div>
                    <div class="quiz-card">
                        <div class="quiz-question">${question.prompt}</div>
                        <div class="quiz-answer-grid" style="margin-top: 12px;">
                            ${question.answers.map(answer => `<button class="quiz-option" onclick="showVerificationResult('${answer}')">${answer}</button>`).join('')}
                        </div>
                    </div>
                `;
                return;
            }

            if (moduleName === 'clia') {
                const question = {
                    prompt: 'Which CLIA concept is most important before bringing a hematology analyzer into clinical service?',
                    answers: [
                        'Confirming the instrument meets verification standards for accuracy, precision, analytical range, and reference intervals.',
                        'Only documenting annual maintenance.',
                        'Waiting for a single pass on the next QC event.',
                        'Installing the instrument and starting patient testing immediately.'
                    ],
                    correct: 'Confirming the instrument meets verification standards for accuracy, precision, analytical range, and reference intervals.'
                };
                container.innerHTML = `
                    <div class="quiz-header-row">
                        <div class="quiz-progress">CLIA Quiz</div>
                        <button class="quiz-back-btn" onclick="renderQuizMenu()">Back</button>
                    </div>
                    <div class="quiz-card">
                        <div class="quiz-question">${question.prompt}</div>
                        <div class="quiz-answer-grid" style="margin-top: 12px;">
                            ${question.answers.map(answer => `<button class="quiz-option" onclick="showCliaResult('${answer}')">${answer}</button>`).join('')}
                        </div>
                    </div>
                `;
            }
        }

        function selectQcRule(option) {
            const question = westgardQuizBank[quizState.questionIndex];
            if (question.ruleAnswered) return;
            question.ruleSelected = option;
            question.ruleAnswered = true;
            question.ruleCorrect = option === question.ruleAnswer;
            renderQuizModule('qc');
        }

        function selectQcFollowUp(option) {
            const question = westgardQuizBank[quizState.questionIndex];
            if (question.followUpAnswered) return;
            question.followUpSelected = option;
            question.followUpAnswered = true;
            question.followUpCorrect = option === question.followUpAnswer;
            renderQuizModule('qc');
        }

        function finalizeQcQuiz() {
            const score = westgardQuizBank.reduce((total, question) => total + ((question.ruleCorrect ? 1 : 0) + (question.followUpCorrect ? 1 : 0)), 0);
            const possible = westgardQuizBank.length * 2;
            upsertQuizResult('QC', score, possible);
            const container = document.getElementById('quiz-modal-content');
            container.innerHTML = `
                <div class="quiz-header-row">
                    <div class="quiz-progress">QC Quiz Complete</div>
                    <button class="quiz-back-btn" onclick="renderQuizMenu()">Back</button>
                </div>
                <div class="quiz-card">
                    <div class="quiz-summary-panel" style="margin-bottom:0;">
                        <div class="quiz-summary-header">Final Score</div>
                        <div class="quiz-summary-score">${score} / ${possible}</div>
                        <div class="quiz-summary-header">Quizzes Taken</div>
                        <ul class="quiz-summary-list"><li>${quizState.completedModules.map(item => `${item.module} (${item.score}/${item.possible})`).join('</li><li>')}</li></ul>
                    </div>
                    <button class="quiz-next-btn" onclick="renderQuizMenu()">Return to Quiz Menu</button>
                </div>
            `;
        }

        function advanceQcQuestion() {
            const isLastQuestion = quizState.questionIndex === westgardQuizBank.length - 1;
            if (isLastQuestion) {
                finalizeQcQuiz();
                return;
            }
            const nextIndex = quizState.questionIndex + 1;
            quizState.questionIndex = nextIndex;
            westgardQuizBank[quizState.questionIndex].ruleAnswered = false;
            westgardQuizBank[quizState.questionIndex].ruleSelected = null;
            westgardQuizBank[quizState.questionIndex].ruleCorrect = false;
            westgardQuizBank[quizState.questionIndex].followUpAnswered = false;
            westgardQuizBank[quizState.questionIndex].followUpSelected = null;
            westgardQuizBank[quizState.questionIndex].followUpCorrect = false;
            renderQuizModule('qc');
        }

        function showVerificationResult(answer) {
            const correct = 'Verification must confirm accuracy, precision, reportable range, and reference intervals per CLIA expectations.';
            const isCorrect = answer === correct;
            upsertQuizResult('Verification', isCorrect ? 1 : 0, 1);
            const container = document.getElementById('quiz-modal-content');
            const statusClass = isCorrect ? 'success' : 'error';
            const message = isCorrect ? 'Correct. Before an instrument is released for routine testing, it must be verified against the required performance characteristics.' : `Incorrect. The correct answer is: ${correct}`;
            container.innerHTML = `
                <div class="quiz-header-row">
                    <div class="quiz-progress">Verification Quiz</div>
                    <button class="quiz-back-btn" onclick="renderQuizMenu()">Back</button>
                </div>
                <div class="quiz-card">
                    <div class="quiz-feedback ${statusClass}">${message}</div>
                    <button class="quiz-next-btn" onclick="renderQuizMenu()">Return to Menu</button>
                </div>
            `;
        }

        function showCliaResult(answer) {
            const correct = 'Confirming the instrument meets verification standards for accuracy, precision, analytical range, and reference intervals.';
            const isCorrect = answer === correct;
            upsertQuizResult('CLIA', isCorrect ? 1 : 0, 1);
            const container = document.getElementById('quiz-modal-content');
            const statusClass = isCorrect ? 'success' : 'error';
            const message = isCorrect ? 'Correct. CLIA requires verification of analytical performance before clinical use.' : `Incorrect. The correct answer is: ${correct}`;
            container.innerHTML = `
                <div class="quiz-header-row">
                    <div class="quiz-progress">CLIA Quiz</div>
                    <button class="quiz-back-btn" onclick="renderQuizMenu()">Back</button>
                </div>
                <div class="quiz-card">
                    <div class="quiz-feedback ${statusClass}">${message}</div>
                    <button class="quiz-next-btn" onclick="renderQuizMenu()">Return to Menu</button>
                </div>
            `;
        }

        function openQuizMode() { const quizModal = document.getElementById('quiz-modal'); quizModal.style.display = 'flex'; renderQuizMenu(); }
        function closeQuizMode() { document.getElementById('quiz-modal').style.display = 'none'; }
        function launchQuizOption(option) {
            quizState.module = option;
            renderQuizModule(option);
        }

        function ensurePtArchive(instData) {
            if (!instData.ptHistory) instData.ptHistory = [];
            if (!instData.ptCurrent) instData.ptCurrent = null;
            if (!instData.ptDueDay && instData.verificationDate) {
                instData.ptDueDay = instData.verificationDate + 120;
            }
        }

        function createPtReport(instData) {
            const analytes = getInstrumentAnalytes(instData);
            return {
                id: `pt-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
                day: currentDay,
                dateLabel: new Date(2026, 0, currentDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: 'Pass',
                rows: analytes.map(analyte => {
                    const refMean = analyte.target;
                    const ourResult = analyte.target + ((Math.random() - 0.5) * analyte.sd * 1.1);
                    const pass = Math.abs(ourResult - refMean) <= analyte.sd * 1.5;
                    return {
                        analyte: analyte.label,
                        referenceMean: Number(refMean.toFixed(analyte.key === 'Platelets' || analyte.key === 'Hemoglobin' ? 1 : 2)),
                        ourResult: Number(ourResult.toFixed(analyte.key === 'Platelets' || analyte.key === 'Hemoglobin' ? 1 : 2)),
                        result: pass ? 'Pass' : 'Fail'
                    };
                })
            };
        }

        function buildPtArchiveNav(instData, activeReportId) {
            ensurePtArchive(instData);
            if (!instData.ptHistory || !instData.ptHistory.length) return '';
            const entries = [...instData.ptHistory].sort((a, b) => a.day - b.day);
            return `
                <div class="qc-month-tabs">
                    ${entries.map(report => `
                        <button class="qc-month-btn ${report.id === activeReportId ? 'active' : ''}" onclick="openArchivedPt('${instData.id}', '${report.id}')">
                            <span class="qc-month-name">${report.dateLabel}</span>
                            <span class="qc-month-status ${report.status === 'Fail' ? 'out' : 'in'}">${report.status}</span>
                        </button>
                    `).join('')}
                </div>
            `;
        }

        function renderPtReportBody(instData, report, allowDecision = true) {
            const statusBadge = report.status === 'Pass' ? '<span class="pt-status-badge pt-status-pass">Pass</span>' : '<span class="pt-status-badge pt-status-fail">Fail</span>';
            const rows = report.rows.map(row => `
                <tr>
                    <td>${row.analyte}</td>
                    <td>${row.referenceMean}</td>
                    <td>${row.ourResult}</td>
                    <td>${row.result}</td>
                </tr>
            `).join('');
            const decisionButtons = allowDecision ? `
                <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:18px;">
                    <button class="btn-reject" onclick="markPtResult('${instData.id}', 'Fail')">Mark Fail</button>
                    <button class="btn-accept" onclick="markPtResult('${instData.id}', 'Pass')">Mark Pass</button>
                </div>
            ` : '';

            return `
                <div class="pt-report-header">
                    <h3>${instData.name}</h3>
                    ${statusBadge}
                </div>
                <div class="pt-summary-grid">
                    <div class="pt-summary-card">
                        <div class="label">Instrument</div>
                        <div class="value">${instData.name}</div>
                    </div>
                    <div class="pt-summary-card">
                        <div class="label">Reference Lab Mean</div>
                        <div class="value">${report.rows[0].referenceMean}</div>
                    </div>
                    <div class="pt-summary-card">
                        <div class="label">PT Date</div>
                        <div class="value">${report.dateLabel}</div>
                    </div>
                </div>
                <table class="pt-report-table">
                    <thead>
                        <tr>
                            <th>Analyte</th>
                            <th>Reference Mean</th>
                            <th>Our Laboratory</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
                ${decisionButtons}
                <p class="pt-note">Reference means are the target values from the proficiency program. By default, the PT report is considered a pass until the user marks the final result as pass or fail.</p>
            `;
        }

        function markPtResult(instId, result) {
            const instData = ownedInstruments.find(i => i.id === instId);
            if (!instData) return;
            ensurePtArchive(instData);
            if (!instData.ptCurrent) {
                instData.ptCurrent = createPtReport(instData);
            }
            instData.ptCurrent.status = result;
            instData.ptCurrent.rows = instData.ptCurrent.rows.map(row => ({
                ...row,
                result
            }));
            instData.ptHistory.push({ ...instData.ptCurrent, archivedAt: Date.now() });
            instData.ptCurrent = null;
            instData.pt = result;
            instData.ptDueDay = currentDay + 120;
            populateRoster();
            populateDevTools();
            openPtModal(instId);
        }

        function openArchivedPt(instId, reportId) {
            const instData = ownedInstruments.find(i => i.id === instId);
            if (!instData) return;
            ensurePtArchive(instData);
            const report = (instData.ptHistory || []).find(entry => entry.id === reportId);
            if (!report) return;
            const archiveNav = buildPtArchiveNav(instData, reportId);
            document.getElementById('pt-modal-content').innerHTML = `${archiveNav}${renderPtReportBody(instData, report, false)}`;
            document.getElementById('pt-modal').style.display = 'flex';
        }

        function handlePtButtonClick(instId) {
            const instData = ownedInstruments.find(i => i.id === instId);
            if (!instData) return;
            if (instData.verification !== 'Verified') {
                openVerificationScreen(instId);
                return;
            }
            openPtModal(instId);
        }

        function openPtModal(instId) {
            const instData = ownedInstruments.find(i => i.id === instId);
            if (!instData) return;
            ensurePtArchive(instData);

            const dueDay = instData.ptDueDay ?? (instData.verificationDate ? instData.verificationDate + 120 : currentDay + 120);
            if (currentDay < dueDay) {
                if (instData.ptHistory && instData.ptHistory.length) {
                    const archiveNav = buildPtArchiveNav(instData, null);
                    document.getElementById('pt-modal-content').innerHTML = `${archiveNav}<div class="pt-note">No new PT is currently available. Archived PT results are listed above.</div>`;
                } else {
                    document.getElementById('pt-modal-content').innerHTML = '<div class="pt-note">No PT is currently available. Archived PT results will appear here once completed.</div>';
                }
                document.getElementById('pt-modal').style.display = 'flex';
                return;
            }

            if (!instData.ptCurrent) {
                instData.ptCurrent = createPtReport(instData);
            }
            instData.ptCurrent.status = 'Pass';
            instData.ptCurrent.rows = instData.ptCurrent.rows.map(row => ({ ...row, result: 'Pass' }));
            document.getElementById('pt-modal-content').innerHTML = `${buildPtArchiveNav(instData, null)}${renderPtReportBody(instData, instData.ptCurrent, true)}`;
            document.getElementById('pt-modal').style.display = 'flex';
        }

        function getInstrumentAnalytes(inst) {
            const catalogData = instrumentCatalog.find(c => c.id === inst.catalogId);
            if (catalogData && catalogData.id === 'hem_analyzer') {
                return [
                    { key: 'RBC', label: 'RBC', target: 5.1, sd: 0.18 },
                    { key: 'WBC', label: 'WBC', target: 7.8, sd: 0.32 },
                    { key: 'Platelets', label: 'Platelets', target: 250, sd: 10 },
                    { key: 'Hemoglobin', label: 'Hemoglobin', target: 14.2, sd: 0.42 }
                ];
            }
            return [{ key: 'QC', label: 'QC', target: 100, sd: 2.5 }];
        }
        function ensureQcHistory(inst) {
            if (!inst.qcHistory) inst.qcHistory = {};
            const analytes = getInstrumentAnalytes(inst);
            analytes.forEach(analyte => {
                if (!inst.qcHistory[analyte.key]) inst.qcHistory[analyte.key] = [];
            });
        }
        const qcMonthLengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        function getQcDateFromDay(dayNumber) {
            let remaining = dayNumber;
            let year = 2026;
            let monthIndex = 0;
            while (remaining > qcMonthLengths[monthIndex]) {
                remaining -= qcMonthLengths[monthIndex];
                monthIndex += 1;
                if (monthIndex >= 12) {
                    monthIndex = 0;
                    year += 1;
                }
            }
            return {
                year,
                monthIndex,
                monthKey: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
                dayOfMonth: remaining,
                monthLabel: new Date(year, monthIndex, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            };
        }

        function getCurrentQcMonthKey() {
            return getQcDateFromDay(currentDay).monthKey;
        }

        function generateNormalQcValue(mean, sd) {
            const u1 = Math.max(Number.MIN_VALUE, Math.random());
            const u2 = Math.random();
            const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            return mean + (z0 * sd);
        }

        function addDailyQcPointForInstrument(inst) {
            ensureQcHistory(inst);
            const analytes = getInstrumentAnalytes(inst);
            const qcDate = getQcDateFromDay(currentDay);
            analytes.forEach(analyte => {
                const series = inst.qcHistory[analyte.key];
                const value = generateNormalQcValue(analyte.target, analyte.sd);
                const boundedValue = Math.min(Math.max(value, analyte.target - (3 * analyte.sd)), analyte.target + (3 * analyte.sd));
                series.push({
                    day: qcDate.dayOfMonth,
                    date: new Date(qcDate.year, qcDate.monthIndex, qcDate.dayOfMonth).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    monthKey: qcDate.monthKey,
                    value: Number(boundedValue.toFixed(analyte.key === 'Platelets' || analyte.key === 'Hemoglobin' ? 1 : 2))
                });
            });
        }

        function buildLeveyJenningsSVG(series, analyte) {
            const values = series.map(p => p.value);
            const minValue = Math.min(...values, analyte.target - (3 * analyte.sd));
            const maxValue = Math.max(...values, analyte.target + (3 * analyte.sd));
            const margin = { top: 20, right: 20, bottom: 40, left: 60 };
            const width = 860;
            const height = 300;
            const graphWidth = width - margin.left - margin.right;
            const graphHeight = height - margin.top - margin.bottom;
            const xFor = (index) => margin.left + (series.length === 1 ? graphWidth / 2 : (index / Math.max(series.length - 1, 1)) * graphWidth);
            const yFor = (value) => margin.top + graphHeight - (((value - minValue) / Math.max(maxValue - minValue, 1)) * graphHeight);
            const meanY = yFor(analyte.target);
            const formatValue = (v) => Number(v).toFixed(analyte.key === 'Platelets' || analyte.key === 'Hemoglobin' ? 1 : 2);
            const controlLevels = [
                { label: '-3 SD', value: analyte.target - (3 * analyte.sd), color: '#f87171', side: 'left' },
                { label: '-2 SD', value: analyte.target - (2 * analyte.sd), color: '#fbbf24', side: 'left' },
                { label: '-1 SD', value: analyte.target - (1 * analyte.sd), color: '#38bdf8', side: 'left' },
                { label: 'Mean', value: analyte.target, color: '#f8fafc', side: 'right' },
                { label: '+1 SD', value: analyte.target + (1 * analyte.sd), color: '#38bdf8', side: 'right' },
                { label: '+2 SD', value: analyte.target + (2 * analyte.sd), color: '#fbbf24', side: 'right' },
                { label: '+3 SD', value: analyte.target + (3 * analyte.sd), color: '#f87171', side: 'right' }
            ];

            const grid = Array.from({ length: 6 }, (_, i) => {
                const y = margin.top + (i / 5) * graphHeight;
                return `<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="rgba(148,163,184,0.18)" />`;
            }).join('');

            const lines = controlLevels.map(level => {
                const y = yFor(level.value);
                const x = level.side === 'left' ? margin.left + 4 : width - margin.right - 4;
                const anchor = level.side === 'left' ? 'start' : 'end';
                const displayValue = formatValue(level.value);
                return `
                    <line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="${level.color}" stroke-dasharray="4 4" stroke-width="1" />
                    <text x="${x}" y="${y - 6}" fill="${level.color}" font-size="11" text-anchor="${anchor}">${level.label} (${displayValue})</text>
                `;
            }).join('');

            const dataPoints = series.map((point, index) => {
                const x = xFor(index);
                const y = yFor(point.value);
                return `
                    <g>
                        <circle cx="${x}" cy="${y}" r="4.5" fill="#4ade80" stroke="#f8fafc" stroke-width="1" />
                        <text x="${x}" y="${height - 15}" text-anchor="middle" font-size="9" fill="#94a3b8">${point.day}</text>
                    </g>
                `;
            }).join('');

            return `
                <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
                    ${grid}
                    ${lines}
                    <line x1="${margin.left}" y1="${meanY}" x2="${width - margin.right}" y2="${meanY}" stroke="#f8fafc" stroke-width="1.2" stroke-dasharray="6 6" />
                    <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" stroke="#e2e8f0" />
                    <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="#e2e8f0" />
                    ${dataPoints}
                    <text x="${width / 2}" y="${height - 2}" text-anchor="middle" fill="#94a3b8" font-size="11">Day</text>
                    <text x="18" y="${height / 2}" fill="#94a3b8" font-size="11" transform="rotate(-90 18 ${height / 2})" text-anchor="middle">Value</text>
                </svg>
            `;
        }

        function getQcMonthLabel(monthKey) {
            if (!monthKey) return 'Current';
            const [year, month] = monthKey.split('-').map(Number);
            return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }

        function getQcMonthKeys(instData) {
            if (!instData || !instData.qcHistory) return [];
            const keys = new Set();
            Object.values(instData.qcHistory).forEach(series => {
                (series || []).forEach(point => {
                    if (point.monthKey) keys.add(point.monthKey);
                });
            });
            const currentMonthKey = getCurrentQcMonthKey();
            if (currentMonthKey) keys.add(currentMonthKey);
            return Array.from(keys).sort();
        }

        function getSeriesForQcMonth(series, monthKey) {
            if (!Array.isArray(series)) return [];
            return series.filter(point => point.monthKey === monthKey);
        }

        function getQcMonthStatus(instData, monthKey) {
            if (!instData || !instData.qcHistory) return 'In Control';
            const analytes = getInstrumentAnalytes(instData);
            for (const analyte of analytes) {
                const series = getSeriesForQcMonth(instData.qcHistory[analyte.key] || [], monthKey);
                for (const point of series) {
                    if (point.value < analyte.target - (2 * analyte.sd) || point.value > analyte.target + (2 * analyte.sd)) {
                        return 'Out of Control';
                    }
                }
            }
            return 'In Control';
        }

        function buildQcMonthNav(instData, activeMonthKey) {
            const monthKeys = getQcMonthKeys(instData);
            if (!monthKeys.length) return '';
            const selectedMonth = activeMonthKey || monthKeys[monthKeys.length - 1];
            const buttons = monthKeys.map(monthKey => {
                const status = getQcMonthStatus(instData, monthKey);
                const statusClass = status === 'Out of Control' ? 'out' : 'in';
                return `
                    <button class="qc-month-btn ${monthKey === selectedMonth ? 'active' : ''}" onclick="selectQcMonth('${instData.id}', '${monthKey}')">
                        <span class="qc-month-name">${getQcMonthLabel(monthKey)}</span>
                        <span class="qc-month-status ${statusClass}">${status}</span>
                    </button>
                `;
            }).join('');
            return `<div class="qc-month-tabs">${buttons}</div>`;
        }

        function buildQcAnalyteTabs(instData, monthKey, selectedKey) {
            const analytes = getInstrumentAnalytes(instData);
            const targetKey = selectedKey || analytes[0].key;
            return `
                <div class="qc-analyte-tabs">
                    ${analytes.map(analyte => `
                        <button class="qc-analyte-btn ${analyte.key === targetKey ? 'active' : ''}" onclick="selectQcAnalyte('${instData.id}', '${monthKey}', '${analyte.key}')">
                            ${analyte.label}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        function buildPeerGroupComparison(analyte, series) {
            const peerLabs = 200;
            const observedMean = series.length ? calcMean(series.map(point => point.value)) : analyte.target;
            const peerMean = analyte.target;
            const peerSD = analyte.sd * 1.25;
            const sdi = Number(Math.min(1.95, Math.max(-1.95, ((observedMean - peerMean) / peerSD) * 0.8)).toFixed(2));
            const cv = Number(((peerSD / peerMean) * 100).toFixed(2));
            const cvi = Number(Math.min(1.95, Math.max(-1.95, sdi * 0.8)).toFixed(2));

            return {
                labs: peerLabs,
                mean: Number(peerMean.toFixed(analyte.key === 'Platelets' || analyte.key === 'Hemoglobin' ? 1 : 2)),
                sd: Number(peerSD.toFixed(analyte.key === 'Platelets' || analyte.key === 'Hemoglobin' ? 1 : 2)),
                sdi,
                cv,
                cvi
            };
        }

        function renderQcMonthCards(instData, monthKey, selectedKey = null) {
            const analytes = getInstrumentAnalytes(instData);
            const activeKey = selectedKey || analytes[0].key;
            const analyte = analytes.find(item => item.key === activeKey) || analytes[0];
            const series = getSeriesForQcMonth(instData.qcHistory[analyte.key] || [], monthKey);
            const logHtml = series.length ? series.map(point => `<li>${point.date}: ${point.value.toFixed(analyte.key === 'Platelets' || analyte.key === 'Hemoglobin' ? 1 : 2)}</li>`).join('') : '<li>No data for this month</li>';
            const peer = buildPeerGroupComparison(analyte, series);
            return `
                <div class="qc-single-panel">
                    ${buildQcAnalyteTabs(instData, monthKey, analyte.key)}
                    <div class="qc-chart-card single-chart-card">
                        <h3>${analyte.label}</h3>
                        ${buildLeveyJenningsSVG(series, analyte)}
                        <div class="qc-log"><strong>Daily log:</strong><ul>${logHtml}</ul></div>
                        <div class="qc-peer-group">
                            <h4>Peer Group Comparison</h4>
                            <div class="qc-peer-grid">
                                <div><span>Other Labs</span><strong>${peer.labs}</strong></div>
                                <div><span>Mean</span><strong>${peer.mean}</strong></div>
                                <div><span>SD</span><strong>${peer.sd}</strong></div>
                                <div><span>SDI</span><strong>${peer.sdi}</strong></div>
                                <div><span>CV</span><strong>${peer.cv}%</strong></div>
                                <div><span>CVI</span><strong>${peer.cvi}</strong></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function selectQcMonth(instId, monthKey) {
            const instData = ownedInstruments.find(i => i.id === instId);
            if (!instData || !monthKey) return;
            ensureQcHistory(instData);
            const selectedKey = getInstrumentAnalytes(instData)[0].key;
            qcModalTitle.textContent = `${instData.name} - Levy-Jennings QC`;
            const archiveNav = buildQcMonthNav(instData, monthKey);
            const cards = renderQcMonthCards(instData, monthKey, selectedKey);
            qcModalContent.innerHTML = `${archiveNav}<div class="qc-chart-container">${cards}</div>`;
        }

        function selectQcAnalyte(instId, monthKey, analyteKey) {
            const instData = ownedInstruments.find(i => i.id === instId);
            if (!instData || !monthKey) return;
            ensureQcHistory(instData);
            qcModalTitle.textContent = `${instData.name} - Levy-Jennings QC`;
            const archiveNav = buildQcMonthNav(instData, monthKey);
            const cards = renderQcMonthCards(instData, monthKey, analyteKey);
            qcModalContent.innerHTML = `${archiveNav}<div class="qc-chart-container">${cards}</div>`;
        }

        function openQcModal(instId) {
            const instData = ownedInstruments.find(i => i.id === instId);
            if (!instData) return;
            if (!isInstrumentVerified(instData)) {
                alert(`${instData.name} must be marked as verified before QC can run.`);
                return;
            }
            ensureQcHistory(instData);
            const monthKeys = getQcMonthKeys(instData);
            const defaultMonth = monthKeys.includes(getCurrentQcMonthKey()) ? getCurrentQcMonthKey() : (monthKeys.length ? monthKeys[monthKeys.length - 1] : getCurrentQcMonthKey());
            const defaultKey = getInstrumentAnalytes(instData)[0].key;
            qcModalTitle.textContent = `${instData.name} - Levy-Jennings QC`;
            qcModalContent.innerHTML = `${buildQcMonthNav(instData, defaultMonth)}<div class="qc-chart-container">${renderQcMonthCards(instData, defaultMonth, defaultKey)}</div>`;
            qcModal.style.display = 'flex';
        }
        function populateDevTools() {
            devToolsContainer.innerHTML = '';
            if (ownedInstruments.length === 0) {
                devToolsContainer.innerHTML = '<p class="devtools-note">No instruments are currently in the lab. Purchase one first.</p>';
                return;
            }

            const table = document.createElement('table'); table.className = 'devtools-table';
            table.innerHTML = `
                <thead>
                    <tr><th>Instrument</th><th>QC</th><th>PT</th><th>Verification</th></tr>
                </thead>
                <tbody></tbody>
            `;

            ownedInstruments.forEach(inst => {
                const row = document.createElement('tr');
                const ptState = getPtButtonState(inst);
                const ptWarning = ptState.showWarning ? '<span class="pt-warning-mark">⚠</span>' : '';
                row.innerHTML = `
                    <td><strong>${inst.name}</strong></td>
                    <td><button class="secondary" onclick="toggleInstrumentFlag('${inst.id}', 'qc')">${inst.qc === 'Verified' ? 'QC Verified' : 'QC Not Verified'}</button></td>
                    <td><button class="status-badge ${ptState.actionClass} ${ptState.className}" onclick="handlePtButtonClick('${inst.id}')">${ptState.label}${ptWarning}</button></td>
                    <td><button onclick="toggleInstrumentFlag('${inst.id}', 'verification')">${inst.verification === 'Verified' ? 'Verification Verified' : 'Verification Not Verified'}</button></td>
                `;
                table.querySelector('tbody').appendChild(row);
            });

            devToolsContainer.appendChild(table);
        }
        function isInstrumentVerified(inst) {
            if (!inst) return false;
            return inst.verification === 'Verified' || inst.verification === 'Complete' || inst.status === 'Online';
        }

        function quickApproveQC(instId) {
            const instData = ownedInstruments.find(i => i.id === instId);
            if (!instData) return;
            instData.qc = 'Pass';
            populateRoster();
            populateDevTools();
        }
        function quickApprovePT(instId) {
            const instData = ownedInstruments.find(i => i.id === instId);
            if (!instData) return;
            instData.pt = 'Pass';
            populateRoster();
            populateDevTools();
        }
        function quickVerifyInstrument(instId) {
            const instData = ownedInstruments.find(i => i.id === instId);
            if (!instData) return;

            Object.keys(instData.studies).forEach(key => {
                instData.studies[key] = 'Pass';
            });

            instData.verification = instData.verification === 'Verified' ? 'Not Verified' : 'Verified';
            instData.status = instData.verification === 'Verified' ? 'Online' : 'Offline';
            instData.verificationDate = instData.verification === 'Verified' ? currentDay : null;
            instData.ptDueDay = instData.verification === 'Verified' ? currentDay + 120 : null;

            if (verificationView.style.display === 'flex' && verifyingInstrumentId === instId) {
                closeVerificationScreen();
                studyRunnerView.style.display = 'none';
            }

            populateRoster();
            populateDevTools();
            if (studyRunnerView.style.display === 'flex' && verifyingInstrumentId === instId) {
                studyRunnerView.style.display = 'none';
            }
            alert(`${instData.name} verification is now ${instData.verification}.`);
        }
        function toggleInstrumentFlag(instId, field) {
            const instData = ownedInstruments.find(i => i.id === instId);
            if (!instData) return;
            const currentValue = instData[field] || 'Not Verified';
            instData[field] = currentValue === 'Verified' ? 'Not Verified' : 'Verified';
            if (field === 'verification') {
                if (instData.verification === 'Verified') {
                    Object.keys(instData.studies || {}).forEach(key => {
                        instData.studies[key] = 'Pass';
                    });
                }
                instData.status = instData.verification === 'Verified' ? 'Online' : 'Offline';
                instData.verificationDate = instData.verification === 'Verified' ? currentDay : null;
                instData.ptDueDay = instData.verification === 'Verified' ? currentDay + 120 : null;
            }
            populateRoster();
            populateDevTools();
        }
        function getBadgeClass(statusStr) { if (['pass', 'online', 'verified', 'complete'].includes(statusStr.toLowerCase())) return 'badge-pass'; if (['fail', 'not verified'].includes(statusStr.toLowerCase())) return 'badge-fail'; return 'badge-offline'; }
        function getPtButtonState(inst) {
            if (inst.verification !== 'Verified') {
                return { label: 'None', className: 'badge-fail', actionClass: 'clickable', showWarning: false };
            }
            const dueDay = inst.ptDueDay ?? ((inst.verificationDate || currentDay) + 120);
            if (currentDay >= dueDay) {
                return { label: 'Available', className: 'badge-warning', actionClass: 'warning-action', showWarning: true };
            }
            return { label: 'None', className: 'badge-pass', actionClass: 'green-action', showWarning: false };
        }
        function populateRoster() {
            rosterBody.innerHTML = '';
            if (ownedInstruments.length === 0) { rosterBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No instruments currently in lab.</td></tr>`; return; }
            ownedInstruments.forEach(inst => {
                const tr = document.createElement('tr');
                const verificationIsActive = inst.verification === 'Verified';
                const verificationClass = verificationIsActive ? 'clickable green-action badge-pass' : `clickable ${getBadgeClass(inst.verification)}`;
                let verifHTML = `<button class="status-badge ${verificationClass}" onclick="openVerificationScreen('${inst.id}')">${inst.verification}</button>`;
                if (inst.verification === 'Not Verified') {
                    verifHTML = `<button class="status-badge clickable ${getBadgeClass(inst.verification)}" onclick="openVerificationScreen('${inst.id}')">${inst.verification}</button>`;
                }
                const qcIsActive = inst.verification === 'Verified';
                const qcLabel = qcIsActive ? 'Active' : (inst.qc === 'Verified' ? 'QC Verified' : 'QC Not Verified');
                const qcClass = qcIsActive ? 'badge-pass' : getBadgeClass(inst.qc);
                const qcActionClass = qcIsActive ? 'clickable green-action' : 'clickable';
                const qcCell = `<button class="status-badge ${qcActionClass} ${qcClass}" onclick="openQcModal('${inst.id}')">${qcLabel}</button>`;
                const ptState = getPtButtonState(inst);
                const ptWarning = ptState.showWarning ? '<span class="pt-warning-mark">⚠</span>' : '';
                const ptCell = `<button class="status-badge clickable ${ptState.actionClass} ${ptState.className}" onclick="handlePtButtonClick('${inst.id}')">${ptState.label}${ptWarning}</button>`;
                tr.innerHTML = `<td><strong>${inst.name}</strong></td><td><span class="status-badge ${getBadgeClass(inst.status)}">${inst.status}</span></td><td>${qcCell}</td><td>${ptCell}</td><td>${verifHTML}</td>`;
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
            populateRoster();
            populateDevTools();
        }
        function updateQCDataOnDayAdvance() {
            ownedInstruments.forEach(inst => {
                if (!isInstrumentVerified(inst)) return;
                ensureQcHistory(inst);
                const qcDate = getQcDateFromDay(currentDay);
                const analytes = getInstrumentAnalytes(inst);
                analytes.forEach(analyte => {
                    const series = inst.qcHistory[analyte.key];
                    const variation = (Math.random() - 0.5) * analyte.sd * 1.2;
                    const value = Math.min(Math.max(analyte.target + variation, analyte.target - (2 * analyte.sd)), analyte.target + (2 * analyte.sd));
                    series.push({
                        day: qcDate.dayOfMonth,
                        date: new Date(qcDate.year, qcDate.monthIndex, qcDate.dayOfMonth).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        monthKey: qcDate.monthKey,
                        value: Number(value.toFixed(analyte.key === 'Platelets' || analyte.key === 'Hemoglobin' ? 1 : 2))
                    });
                });
            });
        }
        initGame();
    
