// Wrap in IIFE to create a private scope and avoid global pollution
(() => {
    "use strict"; // Enable strict mode

    // --- DOM Element References (Assumed from your refactored HTML structure) ---
    const elements = {
        views: {
            settings: document.getElementById('view-settings'),
            selection: document.getElementById('view-selection'),
            confirmation: document.getElementById('view-confirmation'),
            final: document.getElementById('view-final'),
        },
        settings: {
            packListContainer: document.getElementById('pack-list-container'),
            drawCountInput: document.getElementById('draw-count-input'),
            initialDrawButton: document.getElementById('btn-initial-draw'),
            poolInfo: document.getElementById('pool-info'),
        },
        selection: {
            carouselContainer: document.getElementById('card-carousel-container'), // Target for event delegation
            carouselPlaceholder: document.querySelector('#card-carousel-container .card-carousel__placeholder'),
            cancelButton: document.getElementById('btn-cancel-selection'),
        },
        confirmation: {
            cardDetailsContainer: document.getElementById('confirm-card-details'),
            backButton: document.getElementById('btn-back-to-selection'),
            confirmButton: document.getElementById('btn-confirm-selection'),
            // Card Detail Elements are fetched within updateCardDisplay
        },
        final: {
            cardDetailsContainer: document.getElementById('final-card-details'),
            redrawButton: document.getElementById('btn-redraw'),
            lockButton: document.getElementById('btn-lock'),
            lockButtonIcon: document.querySelector('#btn-lock i'),
            lockButtonText: document.querySelector('#btn-lock span'),
            // Card Detail Elements are fetched within updateCardDisplay
        }
    };

    // --- State Variables ---
    let state = {
        availablePacksInfo: [], // Stores content of packs/packs.json (top-level pack configs)
        currentPool: [],        // Array of all available general card objects
        drawnBatch: [],         // Array of currently drawn general card objects for selection
        selectedCardForConfirmation: null, // The card object selected in the carousel, pending confirmation
        confirmedCard: null,    // The final confirmed card object
        isLocked: false,        // Boolean indicating if the final card is locked
        currentView: 'settings',// String identifier of the currently visible view
        buildPoolAbortController: null, // AbortController for cancellable pool builds
        debounceTimer: null,    // Timer ID for debouncing checkbox changes
    };

    // --- Constants ---
    const PLACEHOLDER_IMAGE_ERROR = 'this.style.display="none";'; // Inline JS for image load error
    const DEBOUNCE_DELAY = 300; // Milliseconds for debouncing pack selection changes

    // --- Helper Functions ---

    /**
     * Debounces a function, delaying its execution until after a specified wait time
     * has elapsed since the last time it was invoked.
     * @param {Function} func - The function to debounce.
     * @param {number} delay - The delay in milliseconds.
     * @returns {Function} The debounced function.
     */
    function debounce(func, delay) {
        return function(...args) {
            clearTimeout(state.debounceTimer);
            state.debounceTimer = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    /**
     * Shows the specified view and hides all other views.
     * Manages `hidden` class and `aria-hidden` attribute.
     * @param {string} viewName - The key of the view to show (e.g., 'settings', 'selection').
     */
    function showView(viewName) {
        Object.entries(elements.views).forEach(([key, viewElement]) => {
            const show = key === viewName;
            if (viewElement) { // Ensure element exists
                viewElement.classList.toggle('hidden', !show);
                viewElement.setAttribute('aria-hidden', String(!show));
            } else {
                console.warn(`View element not found for key: ${key}`);
            }
        });
        state.currentView = viewName;
    }

    /**
     * Formats health display (e.g., "4", "3/4").
     * @param {number | undefined | null} currentHealth - The general's starting health if different from max.
     * @param {number | undefined | null} maxHealth - The general's maximum health.
     * @returns {string} Formatted health string or '?' if data is missing.
     */
    function formatHealth(currentHealth, maxHealth) {
        const maxH = maxHealth ?? null; // Use nullish coalescing for cleaner null/undefined checks
        const currentH = currentHealth ?? maxH;

        if (maxH === null) return '?'; // If no max health, display '?'

        return (currentH !== null && currentH !== maxH) ? `${currentH}/${maxH}` : `${maxH}`;
    }

    /**
     * Updates the detailed card display in either the confirmation or final view.
     * Handles single or dual faction display.
     * @param {object | null} cardData - The general's data object, or null to show placeholder content.
     * @param {'confirm' | 'final'} targetPrefix - Identifier for the target view's elements (e.g., 'confirm').
     */
    function updateCardDisplay(cardData, targetPrefix) {
        const container = document.getElementById(`${targetPrefix}-card-details`);
        if (!container) {
            console.error(`Card container not found for prefix: ${targetPrefix}`);
            return;
        }

        // Dynamically fetch elements within the specific container
        const imgElement = container.querySelector(`.card-details__image`);
        const nameElement = container.querySelector(`.card-details__name`);
        const factionElement = container.querySelector(`#${targetPrefix}-general-faction`); // For faction text
        const genderElement = container.querySelector(`#${targetPrefix}-general-gender`);
        const healthElement = container.querySelector(`#${targetPrefix}-general-health`);
        const armorContainerElement = container.querySelector(`#${targetPrefix}-general-armor`);
        const armorValueElement = armorContainerElement?.querySelector('.armor-value');
        const packElement = container.querySelector(`.card-details__pack`); // For pack text
        const skillsListElement = container.querySelector(`.card-details__skill-list`);

        // Basic validation for essential elements
        if (!imgElement || !nameElement || !factionElement || !genderElement || !healthElement || !armorContainerElement || !packElement || !skillsListElement) {
             console.error(`One or more card detail elements not found for prefix: ${targetPrefix}. Cannot update display.`);
             return;
        }

        // Toggle placeholder class and set primary faction for CSS styling (e.g., border color)
        container.classList.toggle('placeholder', !cardData);
        container.setAttribute('data-faction', cardData?.faction || ''); // Use primary faction for CSS

        // Set basic text content or placeholders
        nameElement.textContent = cardData?.name || '?';

        // --- Faction Display (Handles single or dual faction) ---
        let factionDisplayText = cardData?.faction || '?';
        if (cardData?.faction2 && cardData.faction2.trim() !== "") { // Check if faction2 exists and is not empty
            factionDisplayText += ` / ${cardData.faction2}`;
        }
        factionElement.textContent = `势力: ${factionDisplayText}`;
        // --- End Faction Display ---

        genderElement.textContent = `性别: ${cardData?.gender || '?'}`;
        healthElement.textContent = `体力: ${cardData ? formatHealth(cardData.startingHealth, cardData.health) : '?'}`;

        // Armor display
        const initialArmor = cardData?.initialArmor;
        const showArmor = initialArmor && initialArmor > 0;
        armorContainerElement.classList.toggle('hidden', !showArmor);
        if (armorValueElement) armorValueElement.textContent = showArmor ? initialArmor : '?';

        // Pack display (uses pre-formatted displayPack from cardData)
        packElement.textContent = cardData?.displayPack ? `(${cardData.displayPack})` : '';

        // Image display
        imgElement.src = cardData?.image || '';
        imgElement.alt = cardData?.name ? `${cardData.name} 武将图片` : '武将图片';
        imgElement.style.display = cardData?.image ? 'block' : 'none';
        imgElement.onerror = PLACEHOLDER_IMAGE_ERROR;

        // Skills List (using DocumentFragment for efficiency)
        skillsListElement.innerHTML = ''; // Clear previous skills
        if (cardData?.skills?.length > 0) { // Check if skills array exists and has items
            const fragment = document.createDocumentFragment();
            cardData.skills.forEach(skill => {
                const li = document.createElement('li');
                const skillNameSpan = document.createElement('span');
                skillNameSpan.className = 'card-details__skill-name';
                skillNameSpan.textContent = skill.skillName || '未知技能';

                const skillDescP = document.createElement('p');
                skillDescP.className = 'card-details__skill-description';
                skillDescP.textContent = skill.skillDescription || '暂无技能描述';

                li.appendChild(skillNameSpan);
                li.appendChild(skillDescP);
                fragment.appendChild(li);
            });
            skillsListElement.appendChild(fragment);
        } else if (cardData) { // If cardData exists but no skills
            skillsListElement.innerHTML = '<li>该武将无特殊技能。</li>';
        } else { // Placeholder state
            skillsListElement.innerHTML = '<li>...</li>';
        }
    }

    /**
     * Populates the expansion pack selection list in the settings view.
     * Uses data from `state.availablePacksInfo` (content of `packs/packs.json`).
     */
    function populateExpansionCheckboxes() {
        const container = elements.settings.packListContainer;
        container.innerHTML = ''; // Clear previous list

        if (!state.availablePacksInfo?.length) { // Check if array exists and has items
            container.innerHTML = '<p style="color: var(--color-error);">未能加载扩展包列表。</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        state.availablePacksInfo.forEach((packConfig) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'pack-selector__item';

            const label = document.createElement('label');
            label.htmlFor = `pack-${packConfig.id}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = packConfig.id; // Store pack ID
            checkbox.id = `pack-${packConfig.id}`;
            checkbox.checked = true; // Default to checked

            // Use nameForCheckbox from packs.json for display, fallback to ID
            const nameText = document.createTextNode(` ${packConfig.nameForCheckbox || packConfig.id}`);

            label.appendChild(checkbox);
            label.appendChild(nameText);
            itemDiv.appendChild(label);

            // Add description if available in packs.json
            if (packConfig.description) {
                 const descriptionP = document.createElement('p');
                 descriptionP.className = 'pack-selector__description';
                 descriptionP.textContent = packConfig.description;
                 itemDiv.appendChild(descriptionP);
            }
            fragment.appendChild(itemDiv);
        });
        container.appendChild(fragment);
        // Trigger initial pool build after populating checkboxes
        buildCurrentPool();
    }

    /**
     * Builds the card pool based on selected packs.
     * Fetches `_packinfo.json` for each selected pack, then fetches individual data files.
     * Implements concurrent fetching within each pack and an abort signal for cancellation.
     * @async
     */
    async function buildCurrentPool() {
        // Abort any previous ongoing pool build
        if (state.buildPoolAbortController) {
            state.buildPoolAbortController.abort();
            // console.log("Aborted previous pool build attempt.");
        }
        // Create a new AbortController for this build operation
        state.buildPoolAbortController = new AbortController();
        const signal = state.buildPoolAbortController.signal; // Get the signal for fetch requests

        const selectedPackIds = Array.from(
            elements.settings.packListContainer.querySelectorAll('input[type="checkbox"]:checked')
        ).map(cb => cb.value);

        // Update UI to reflect loading state
        state.currentPool = [];
        elements.settings.poolInfo.textContent = '正在构建卡池...';
        elements.settings.initialDrawButton.disabled = true;

        if (selectedPackIds.length === 0) {
            elements.settings.poolInfo.textContent = '请至少选择一个扩展包！';
            state.buildPoolAbortController = null; // Clear the controller as this build is complete (failed)
            return;
        }

        let allCards = [];
        const loadedPackDisplayNames = new Set(); // To show "来自: 包A, 包B"
        const fetchOptions = { signal }; // Options object for fetch, including the abort signal

        try {
            // Process each selected top-level pack (defined in packs.json)
            for (const packId of selectedPackIds) {
                 // Check if the operation has been aborted before processing the next pack
                 if (signal.aborted) throw new DOMException('Build aborted by user', 'AbortError');

                const packConfig = state.availablePacksInfo.find(p => p.id === packId);
                if (!packConfig?.folder) { // Ensure packConfig and its folder property exist
                    console.warn(`Skipping pack ID ${packId}: Configuration missing or 'folder' not specified.`);
                    continue;
                }

                const packFolderPath = `packs/${packConfig.folder}`;
                const manifestPath = `${packFolderPath}/_packinfo.json`;
                let manifest;

                // Fetch and parse the _packinfo.json manifest for the current pack
                try {
                    const manifestResponse = await fetch(manifestPath, fetchOptions);
                    if (!manifestResponse.ok) throw new Error(` ${manifestResponse.statusText}`);
                    manifest = await manifestResponse.json();
                } catch (manifestError) {
                    if (manifestError.name === 'AbortError') throw manifestError; // Re-throw if aborted
                    console.error(`加载清单 ${manifestPath} 失败: ${manifestError.message}. 跳过此扩展包.`);
                    continue; // Skip this pack if its manifest fails to load
                }

                 // Check for abort again after manifest fetch
                 if (signal.aborted) throw new DOMException('Build aborted by user', 'AbortError');

                const parentPackDisplayName = manifest.displayName || packConfig.nameForCheckbox || packId; // Determine display name
                loadedPackDisplayNames.add(parentPackDisplayName);

                if (!manifest?.files?.length) { // Check if files array exists and has items
                    console.warn(`清单 ${manifestPath} 无效或 'files' 数组为空.`);
                    continue;
                }

                // Fetch all data files defined in the manifest concurrently for this pack
                const dataFilePromises = manifest.files.map(async (fileInfo) => {
                    if (!fileInfo?.file) return null; // Skip if file path is missing in manifest entry

                    const dataFilePath = `${packFolderPath}/${fileInfo.file}`;
                    try {
                        const dataResponse = await fetch(dataFilePath, fetchOptions);
                        if (!dataResponse.ok) throw new Error(`${dataResponse.statusText}`); // Include status for context
                        const cardDataArray = await dataResponse.json();

                        // Augment and validate card data immediately
                        if (Array.isArray(cardDataArray)) {
                            const subPackName = fileInfo.subPackName || '';
                            const displayPack = subPackName
                                ? `${parentPackDisplayName} - ${subPackName}`
                                : parentPackDisplayName;

                            return cardDataArray
                                .filter(card => card && typeof card === 'object') // Basic card object validation
                                .map(card => ({ // Augment each card with pack information
                                    ...card,
                                    parentPackName: parentPackDisplayName,
                                    subPackName: subPackName,
                                    displayPack: displayPack
                                }));
                        } else {
                            console.warn(`数据文件 ${dataFilePath} 的内容不是一个有效的数组.`);
                            return null; // Indicate failure for this specific data file
                        }
                    } catch (dataFileError) {
                        if (dataFileError.name === 'AbortError') throw dataFileError; // Re-throw if aborted
                        console.error(`加载或处理数据文件 ${dataFilePath} 时出错: ${dataFileError.message}`);
                        return null; // Indicate failure for this specific data file
                    }
                });

                // Wait for all data files of the current pack to be fetched and processed
                const results = await Promise.all(dataFilePromises);

                 // Check for abort again after data file fetches
                 if (signal.aborted) throw new DOMException('Build aborted by user', 'AbortError');

                // Aggregate valid card arrays into the main list
                results.forEach(cardArray => {
                    if (cardArray) { // Only add if the result is a valid array (not null)
                        allCards.push(...cardArray);
                    }
                });

            } // End loop through selectedPackIds

            // Final state update after all selected packs are processed
            state.currentPool = allCards;
            const poolSize = state.currentPool.length;

            // Update UI only if this build operation was not aborted
            if (!signal.aborted) {
                 if (poolSize > 0) {
                    elements.settings.poolInfo.textContent = `当前卡池共 ${poolSize} 名武将 (来自: ${Array.from(loadedPackDisplayNames).join(', ')})`;
                    elements.settings.initialDrawButton.disabled = false;
                    // Adjust draw count input constraints
                    const drawInput = elements.settings.drawCountInput;
                    drawInput.max = poolSize;
                    drawInput.min = 1;
                    if (parseInt(drawInput.value, 10) > poolSize) drawInput.value = poolSize;
                    else if (parseInt(drawInput.value, 10) < 1) drawInput.value = 1;
                } else {
                    elements.settings.poolInfo.textContent = `加载完成，但未找到有效的武将数据。`;
                    // Reset draw input constraints if pool is empty
                    const drawInput = elements.settings.drawCountInput;
                    drawInput.max = 1; drawInput.min = 1; drawInput.value = 1;
                }
            } else {
                 // If aborted, might want to show a specific message or just leave it as "loading..."
                 console.log("卡池构建已中止, UI 未更新最终结果.");
                 elements.settings.poolInfo.textContent = '卡池构建已取消。'; // Or some other status
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('卡池构建操作被用户中止。');
                elements.settings.poolInfo.textContent = '卡池构建已取消。';
            } else {
                // General error during the build process
                console.error('构建卡池过程中发生错误:', error);
                elements.settings.poolInfo.textContent = `构建卡池失败: ${error.message}`;
            }
            state.currentPool = []; // Ensure pool is empty on any error or abort
            elements.settings.initialDrawButton.disabled = true; // Keep button disabled
        } finally {
            // Clean up the AbortController reference for this build operation
            state.buildPoolAbortController = null;
        }
    }

    /**
     * Populates the selection carousel with drawn cards.
     * Reads 'displayPack' and dual faction info from cardData.
     */
    function populateSelectionCarousel() {
        const container = elements.selection.carouselContainer;
        container.innerHTML = ''; // Clear previous carousel items
        container.appendChild(elements.selection.carouselPlaceholder); // Re-add placeholder initially

        if (!state.drawnBatch?.length) { // Check if drawnBatch exists and has items
            elements.selection.carouselPlaceholder.textContent = '未能抽取到卡牌。';
            elements.selection.carouselPlaceholder.style.display = 'block';
            return;
        }

        elements.selection.carouselPlaceholder.style.display = 'none'; // Hide placeholder

        const fragment = document.createDocumentFragment();
        state.drawnBatch.forEach((card, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'card-carousel__item';
            itemDiv.dataset.index = index; // For identifying card on click

            const img = document.createElement('img');
            img.src = card.image || '';
            img.alt = card.name || '图片';
            img.loading = 'lazy'; // Lazy load images in carousel
            img.onerror = PLACEHOLDER_IMAGE_ERROR;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'card-carousel__item-name';
            nameSpan.textContent = card.name || '未知名称';

            const factionSpan = document.createElement('span');
            factionSpan.className = 'card-carousel__item-faction';

            // --- Faction Display for Carousel Item (Handles single or dual faction) ---
            let carouselFactionDisplay = card.faction || '？';
            if (card.faction2 && card.faction2.trim() !== "") {
                carouselFactionDisplay += ` / ${card.faction2}`;
            }
            factionSpan.textContent = `${carouselFactionDisplay} (${card.displayPack || '未知包'})`;
            // --- End Faction Display ---

            itemDiv.appendChild(img);
            itemDiv.appendChild(nameSpan);
            itemDiv.appendChild(factionSpan);
            fragment.appendChild(itemDiv);
        });
        container.appendChild(fragment);
    }

    /** Updates the lock button's appearance and state (locked/unlocked). */
    function updateLockButton() {
        const isLocked = state.isLocked;
        elements.final.lockButton.classList.toggle('locked', isLocked);
        elements.final.lockButtonIcon.classList.toggle('fa-unlock', !isLocked);
        elements.final.lockButtonIcon.classList.toggle('fa-lock', isLocked);
        elements.final.lockButtonText.textContent = isLocked ? '锁定' : '解锁';
        elements.final.lockButton.title = isLocked ? '解锁卡牌' : '锁定卡牌';
        elements.final.lockButton.setAttribute('aria-pressed', String(isLocked));
        elements.final.redrawButton.disabled = isLocked; // Disable redraw when locked
    }

    /** Triggers a shake animation on the lock button (visual feedback). */
    function shakeLockButton() {
        elements.final.lockButton.classList.add('shake-animation');
        // Remove class after animation to allow re-triggering
        elements.final.lockButton.addEventListener('animationend', () => {
            elements.final.lockButton.classList.remove('shake-animation');
        }, { once: true }); // Listener executes only once
    }

    // --- Event Handlers ---

    /** Handles the click of the "Initial Draw" button. */
    function handleInitialDraw() {
        const countToDraw = parseInt(elements.settings.drawCountInput.value, 10);
        const poolSize = state.currentPool.length;

        // Validation
        if (isNaN(countToDraw) || countToDraw <= 0) { alert('请输入有效的抽卡数量！'); return; }
        if (poolSize === 0) { alert('卡池为空，无法抽取！'); return; }
        if (countToDraw > poolSize) {
            alert(`卡池中最多只能抽取 ${poolSize} 张卡牌。`);
            elements.settings.drawCountInput.value = poolSize; // Correct input value
            return;
        }

        // Perform unique random draw
        state.drawnBatch = [];
        const poolCopy = [...state.currentPool]; // Create a shallow copy to modify
        for (let i = 0; i < countToDraw; i++) {
            if (poolCopy.length === 0) break; // Safety break, should not happen with validation
            const randomIndex = Math.floor(Math.random() * poolCopy.length);
            state.drawnBatch.push(poolCopy.splice(randomIndex, 1)[0]); // Remove and add to batch
        }

        populateSelectionCarousel();
        showView('selection');
    }

    /** Handles click events within the card carousel using event delegation. */
    function handleCardSelection(event) {
        const clickedItem = event.target.closest('.card-carousel__item'); // Find the actual card item clicked
        if (!clickedItem) return; // Click was not on a card item

        const selectedIndex = clickedItem.dataset.index;
        if (selectedIndex !== undefined && state.drawnBatch[selectedIndex]) {
            state.selectedCardForConfirmation = state.drawnBatch[selectedIndex];
            updateCardDisplay(state.selectedCardForConfirmation, 'confirm');
            state.isLocked = false; // Reset lock state when viewing a new confirmation
            updateLockButton();     // Update lock button (though it's in another view)
            showView('confirmation');
        } else {
            console.error("选择的卡牌索引无效或数据丢失:", selectedIndex);
        }
    }

    /** Handles the click of the "Cancel Selection" button. */
    function handleCancelSelection() {
        state.drawnBatch = []; // Clear the drawn batch
        state.selectedCardForConfirmation = null; // Clear any pending confirmation
        showView('settings'); // Return to settings view
    }

    /** Handles the click of the "Back to Selection" button from confirmation view. */
    function handleBackToSelection() {
        state.selectedCardForConfirmation = null; // Clear pending confirmation
        updateCardDisplay(null, 'confirm'); // Clear the confirmation display
        showView('selection'); // Return to selection carousel
    }

    /** Handles the click of the "Confirm Selection" button. */
    function handleConfirmSelection() {
        if (state.selectedCardForConfirmation) {
            state.confirmedCard = state.selectedCardForConfirmation;
            updateCardDisplay(state.confirmedCard, 'final');
            state.isLocked = false; // New card confirmed, reset lock state
            updateLockButton();
            showView('final');
        } else {
            console.error("没有可确认的卡牌，无法执行确认。");
            showView('selection'); // Fallback to selection if no card is pending
        }
    }

    /** Handles the click of the "Redraw" button in the final view. */
    function handleRedraw() {
        if (!state.isLocked) {
            // Reset relevant states for a new draw cycle
            state.drawnBatch = [];
            state.selectedCardForConfirmation = null;
            state.confirmedCard = null;
            // No need to explicitly clear displays, showView('settings') will handle it
            showView('settings');
        } else {
            shakeLockButton(); // Indicate that the card is locked
        }
    }

    /** Handles the click of the "Lock/Unlock" button. */
    function handleLock() {
        state.isLocked = !state.isLocked; // Toggle lock state
        updateLockButton();
    }

    // Create a debounced version of buildCurrentPool for handling pack changes
    const debouncedBuildCurrentPool = debounce(buildCurrentPool, DEBOUNCE_DELAY);

    /** Handles changes on pack checkboxes (event is delegated). */
    function handlePackChange() {
        // Call the debounced version to prevent rapid-fire pool rebuilds
        debouncedBuildCurrentPool();
    }

    // --- Data Loading and Initialization ---

    /**
     * Loads the initial list of top-level expansion packs from `packs/packs.json`.
     * @async
     */
    async function loadInitialPackList() {
        try {
            const response = await fetch('packs/packs.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            state.availablePacksInfo = await response.json(); // Store top-level pack configurations
            populateExpansionCheckboxes(); // This will trigger the first (non-debounced) buildCurrentPool
        } catch (error) {
            console.error('加载 packs.json 失败:', error);
            elements.settings.packListContainer.innerHTML = `<p style="color: var(--color-error);">错误：无法加载扩展包列表 (${error.message})。</p>`;
            elements.settings.poolInfo.textContent = '加载扩展包列表失败。';
            elements.settings.initialDrawButton.disabled = true;
        } finally {
            // Ensure the settings view is shown, even if loading fails, so user sees status.
            showView('settings');
        }
    }

    /** Attaches all necessary event listeners to DOM elements. */
    function bindEventListeners() {
        // Direct listeners for buttons
        elements.settings.initialDrawButton.addEventListener('click', handleInitialDraw);
        elements.selection.cancelButton.addEventListener('click', handleCancelSelection);
        elements.confirmation.backButton.addEventListener('click', handleBackToSelection);
        elements.confirmation.confirmButton.addEventListener('click', handleConfirmSelection);
        elements.final.redrawButton.addEventListener('click', handleRedraw);
        elements.final.lockButton.addEventListener('click', handleLock);

        // Event delegation for pack checkboxes (listens on the container)
        elements.settings.packListContainer.addEventListener('change', (event) => {
             if (event.target.type === 'checkbox' && event.target.closest('.pack-selector__item')) { // Ensure it's a checkbox in our list
                 handlePackChange();
             }
        });

        // Event delegation for card selection carousel (listens on the container)
        elements.selection.carouselContainer.addEventListener('click', handleCardSelection);
    }

    // --- Application Start ---
    /** Initializes the application by binding event listeners and loading initial data. */
    function initializeApp() {
        bindEventListeners();
        loadInitialPackList(); // Start data loading process
    }

    // Wait for the DOM to be fully loaded and parsed before initializing the app
    if (document.readyState === 'loading') { // Loading hasn't finished yet
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else { // `DOMContentLoaded` has already fired
        initializeApp();
    }

})(); // End of IIFE