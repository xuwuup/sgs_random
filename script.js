document.addEventListener('DOMContentLoaded', () => {
    // --- 获取 DOM 元素引用 ---
    // Views
    const settingsView = document.getElementById('settings-view');
    const selectionView = document.getElementById('selection-view');
    const confirmationView = document.getElementById('confirmation-view');
    const finalView = document.getElementById('final-view');

    // Settings View Elements
    const packsListDiv = document.getElementById('expansion-packs-list');
    const drawCountInput = document.getElementById('draw-count-input');
    const initialDrawButton = document.getElementById('initial-draw-button');
    const poolInfoP = document.getElementById('pool-info');

    // Selection View Elements
    const selectionCarousel = document.getElementById('selection-carousel');
    const cancelSelectionButton = document.getElementById('cancel-selection-button');

    // Confirmation View Elements
    const confirmCardDetailsContainer = document.getElementById('confirm-card-details'); // 确认视图卡片容器
    const backToSelectionButton = document.getElementById('back-to-selection-button');
    const confirmSelectionButton = document.getElementById('confirm-selection-button');

    // Final View Elements
    const finalCardDetailsContainer = document.getElementById('final-card-details'); // 最终视图卡片容器
    const redrawButton = document.getElementById('redraw-button');
    const lockButton = document.getElementById('lock-button');
    const lockButtonIcon = lockButton.querySelector('i');
    const lockButtonText = lockButton.querySelector('span');

    // --- State Variables ---
    let availablePacksInfo = [];
    let currentPool = [];
    let drawnBatch = [];             // 存储一次抽出的多张卡牌
    let selectedCardForConfirmation = null; // 在选择视图中选中的卡牌
    let confirmedCard = null;         // 最终确认的卡牌
    let isLocked = false;             // 锁定状态
    let currentView = 'settings';     // 当前视图 ('settings', 'selection', 'confirmation', 'final')

    // --- Helper Functions ---

    // 切换视图
    function showView(viewName) {
        settingsView.classList.add('hidden');
        selectionView.classList.add('hidden');
        confirmationView.classList.add('hidden');
        finalView.classList.add('hidden');

        const viewToShow = document.getElementById(`${viewName}-view`);
        if (viewToShow) {
            viewToShow.classList.remove('hidden');
            currentView = viewName;
            console.log("Switched to view:", currentView);
        } else {
            console.error("View not found:", viewName);
            showView('settings'); // Fallback to settings
        }
    }

    // 填充扩展包复选框 (默认全选)
    function populateExpansionCheckboxes() {
        packsListDiv.innerHTML = '';
        if (!availablePacksInfo || availablePacksInfo.length === 0) {
            packsListDiv.innerHTML = '<p style="color: red;">未能加载扩展包列表。</p>';
            return;
        }
        availablePacksInfo.forEach((packInfo) => {
            const itemDiv = document.createElement('div'); itemDiv.className = 'pack-item';
            const label = document.createElement('label'); const checkbox = document.createElement('input');
            checkbox.type = 'checkbox'; checkbox.value = packInfo.dataFile; checkbox.id = `pack-${packInfo.id}`;
            checkbox.checked = true; // *** 默认全选 ***
            checkbox.addEventListener('change', buildCurrentPool); label.htmlFor = `pack-${packInfo.id}`;
            label.appendChild(checkbox); label.appendChild(document.createTextNode(` ${packInfo.name}`));
            const descriptionP = document.createElement('p'); descriptionP.className = 'pack-description';
            descriptionP.textContent = packInfo.description; itemDiv.appendChild(label); itemDiv.appendChild(descriptionP);
            packsListDiv.appendChild(itemDiv);
        });
         // 初始构建卡池 (因为默认全选)
        buildCurrentPool();
    }

    // 构建当前卡池 (异步)
    async function buildCurrentPool() {
        const selectedDataFiles = []; const selectedPackNames = [];
        const checkboxes = packsListDiv.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            selectedDataFiles.push(checkbox.value);
            const packInfo = availablePacksInfo.find(p => p.dataFile === checkbox.value);
            if (packInfo) { selectedPackNames.push(packInfo.name); }
        });

        currentPool = [];
        poolInfoP.textContent = '正在构建卡池...';
        initialDrawButton.disabled = true; // 构建时禁用

        // 如果没有选择包，直接提示并返回
        if (selectedDataFiles.length === 0) {
            poolInfoP.textContent = '请至少选择一个扩展包！';
            initialDrawButton.disabled = true;
            return;
        }

        try {
            const fetchPromises = selectedDataFiles.map(dataFile => fetch(dataFile).then(response => { if (!response.ok) { throw new Error(`无法加载 ${dataFile}: ${response.statusText}`); } return response.json(); }));
            const results = await Promise.all(fetchPromises);
            results.forEach((packCards, index) => { const packName = selectedPackNames[index] || '未知包'; const cardsWithPackInfo = packCards.map(card => ({ ...card, pack: packName })); currentPool = currentPool.concat(cardsWithPackInfo); });

            if (currentPool.length > 0) {
                poolInfoP.textContent = `当前卡池共 ${currentPool.length} 名武将 (来自: ${selectedPackNames.length} 个扩展包)`;
                initialDrawButton.disabled = false; // 构建成功且有牌则启用
                // 设置抽卡数量输入框的最大值
                drawCountInput.max = currentPool.length;
                 // 如果当前值大于最大值，重置为最大值
                if (parseInt(drawCountInput.value) > currentPool.length) {
                    drawCountInput.value = currentPool.length;
                }
                 // 最小值不能超过卡池数量
                 if (parseInt(drawCountInput.min) > currentPool.length) {
                     drawCountInput.min = 1; // 确保最小值有效，或设置为卡池大小
                 } else {
                     drawCountInput.min = 1; // 恢复默认最小值
                 }


            } else {
                poolInfoP.textContent = `选中的扩展包中没有找到有效的武将数据。`;
                initialDrawButton.disabled = true;
                drawCountInput.max = 1; // 没有卡牌，最大值为1（虽然也抽不了）
                drawCountInput.min = 1;
                drawCountInput.value = 1;
            }
        } catch (error) {
            console.error('构建卡池时出错:', error);
            poolInfoP.textContent = `构建卡池失败: ${error.message}`;
            currentPool = [];
            initialDrawButton.disabled = true;
        }
    }

    // 填充选择视图的卡牌轮播
    function populateSelectionCarousel() {
        selectionCarousel.innerHTML = ''; // 清空
        if (!drawnBatch || drawnBatch.length === 0) {
            selectionCarousel.innerHTML = '<p>未能抽取到卡牌。</p>';
            return;
        }

        drawnBatch.forEach((card, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'selection-card-item';
            itemDiv.dataset.index = index; // 存储索引

            const img = document.createElement('img');
            img.src = card.image || ''; // 处理图片路径不存在
            img.alt = card.name || '图片';
            img.onerror = () => { img.style.display = 'none'; }; // 隐藏加载失败的图片
            itemDiv.appendChild(img);

            const nameSpan = document.createElement('span');
            nameSpan.className = 'item-name';
            nameSpan.textContent = card.name || '未知名称';
            itemDiv.appendChild(nameSpan);

            const factionSpan = document.createElement('span');
            factionSpan.className = 'item-faction';
            factionSpan.textContent = `${card.faction || '？'} (${card.pack || '？'})`;
            itemDiv.appendChild(factionSpan);

            itemDiv.addEventListener('click', handleCardSelection); // 添加点击事件
            selectionCarousel.appendChild(itemDiv);
        });
    }

    // 更新卡牌详情显示 (通用函数)
    function updateCardDisplay(cardData, targetPrefix) {
        const container = document.getElementById(`${targetPrefix}-card-details`);
        const imgElement = document.getElementById(`${targetPrefix}-general-image`);
        const nameElement = document.getElementById(`${targetPrefix}-general-name`);
        const factionElement = document.getElementById(`${targetPrefix}-general-faction`);
        const genderElement = document.getElementById(`${targetPrefix}-general-gender`);
        const packElement = document.getElementById(`${targetPrefix}-general-pack`);
        const skillsListElement = document.getElementById(`${targetPrefix}-general-skills-list`);

        if (!container || !imgElement || !nameElement || !factionElement || !genderElement || !packElement || !skillsListElement) {
             console.error("更新卡牌显示时，找不到目标元素，前缀:", targetPrefix);
             return;
        }


        if (!cardData) {
            container.classList.add('placeholder');
            container.removeAttribute('data-faction');
            nameElement.textContent = '?';
            imgElement.style.display = 'none'; imgElement.src = '';
            factionElement.textContent = '势力: ?'; genderElement.textContent = '性别: ?';
            packElement.textContent = '';
            skillsListElement.innerHTML = '<li>...</li>';
            return;
        }

        container.classList.remove('placeholder');
        nameElement.textContent = cardData.name || '未知名称';
        packElement.textContent = cardData.pack ? `(${cardData.pack})` : '';
        factionElement.textContent = `势力: ${cardData.faction || '未知'}`;
        genderElement.textContent = `性别: ${cardData.gender || '未知'}`;
        if (cardData.faction) { container.setAttribute('data-faction', cardData.faction); } else { container.removeAttribute('data-faction'); }

        imgElement.src = cardData.image || '';
        imgElement.alt = cardData.name || '武将图片';
        imgElement.style.display = cardData.image ? 'block' : 'none';
        imgElement.onerror = () => { imgElement.style.display = 'none'; };

        skillsListElement.innerHTML = '';
        if (cardData.skills && Array.isArray(cardData.skills) && cardData.skills.length > 0) {
            cardData.skills.forEach(skill => {
                 const li = document.createElement('li'); const nameSpan = document.createElement('span');
                 nameSpan.className = 'skill-name'; nameSpan.textContent = skill.skillName || '未知技能';
                 const descP = document.createElement('p'); descP.className = 'skill-description';
                 descP.textContent = skill.skillDescription || '暂无技能描述'; li.appendChild(nameSpan);
                 li.appendChild(descP); skillsListElement.appendChild(li);
            });
        } else {
            const li = document.createElement('li'); li.textContent = '该武将无特殊技能。'; skillsListElement.appendChild(li);
        }
    }

    // 更新锁定按钮状态和外观
    function updateLockButton() {
        if (isLocked) {
            lockButton.classList.add('locked');
            lockButtonIcon.classList.remove('fa-unlock'); lockButtonIcon.classList.add('fa-lock');
            lockButtonText.textContent = '锁定'; lockButton.title = '解锁卡牌';
            redrawButton.disabled = true; // 锁定状态禁用重抽按钮
        } else {
            lockButton.classList.remove('locked');
            lockButtonIcon.classList.remove('fa-lock'); lockButtonIcon.classList.add('fa-unlock');
            lockButtonText.textContent = '解锁'; lockButton.title = '锁定卡牌';
            redrawButton.disabled = false; // 解锁状态启用重抽按钮
        }
    }

    // --- Event Handlers ---

    // 1. 点击 "开始抽取" (设置视图)
    function handleInitialDraw() {
        const countToDraw = parseInt(drawCountInput.value, 10);
        const maxDrawable = currentPool.length;

        // 验证
        if (isNaN(countToDraw) || countToDraw <= 0) { alert('请输入有效的抽卡数量！'); return; }
        if (maxDrawable === 0) { alert('卡池为空！'); return; }
        if (countToDraw > maxDrawable) { alert(`卡池中最多只能抽取 ${maxDrawable} 张卡牌。`); drawCountInput.value = maxDrawable; return; }

        // 执行不重复抽卡
        drawnBatch = [];
        const poolCopy = [...currentPool];
        for (let i = 0; i < countToDraw; i++) {
            if (poolCopy.length === 0) break;
            const randomIndex = Math.floor(Math.random() * poolCopy.length);
            drawnBatch.push(poolCopy.splice(randomIndex, 1)[0]);
        }

        // 填充并显示选择视图
        populateSelectionCarousel();
        showView('selection');
    }

    // 2. 点击选择视图中的卡牌
    function handleCardSelection(event) {
        const selectedIndex = event.currentTarget.dataset.index;
        if (selectedIndex !== undefined && drawnBatch[selectedIndex]) {
            selectedCardForConfirmation = drawnBatch[selectedIndex];
            updateCardDisplay(selectedCardForConfirmation, 'confirm'); // 更新确认视图的显示
            showView('confirmation'); // 显示确认视图
        } else {
            console.error("选择的卡牌索引无效:", selectedIndex);
        }
    }

    // 3. 点击 "返回设置" (选择视图)
    function handleCancelSelection() {
        drawnBatch = []; // 清空批次
        showView('settings');
    }

     // 4. 点击 "返回重选" (确认视图)
     function handleBackToSelection() {
         selectedCardForConfirmation = null;
         updateCardDisplay(null, 'confirm'); // 清空确认视图显示
         showView('selection'); // 返回选择视图
     }


    // 5. 点击 "确认选取" (确认视图)
    function handleConfirmSelection() {
        if (selectedCardForConfirmation) {
            confirmedCard = selectedCardForConfirmation;
            updateCardDisplay(confirmedCard, 'final'); // 更新最终视图的显示
            isLocked = false; // 每次确认新卡牌时，重置锁定状态
            updateLockButton();
            showView('final'); // 显示最终视图
        } else {
            console.error("没有可确认的卡牌");
            showView('selection'); // 如果出错，返回选择视图
        }
    }

    // 6. 点击 "重新抽取" (最终视图)
    function handleRedraw() {
        if (!isLocked) {
            // 清理状态
            drawnBatch = [];
            selectedCardForConfirmation = null;
            confirmedCard = null;
            // 清空显示 (可选，或者让设置视图加载时自动清空)
            // updateCardDisplay(null, 'confirm');
            // updateCardDisplay(null, 'final');
            showView('settings'); // 返回设置视图
        } else {
            // 提示已锁定
            lockButton.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => { lockButton.style.animation = ''; }, 500);
        }
    }

    // 7. 点击 "锁定/解锁" (最终视图)
    function handleLock() {
        isLocked = !isLocked;
        updateLockButton();
    }

    // --- Data Loading and Initialization ---
    function loadInitialPackList() {
        fetch('packs/packs.json')
            .then(response => { if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); } return response.json(); })
            .then(data => {
                availablePacksInfo = data;
                populateExpansionCheckboxes(); // 这会触发 buildCurrentPool
                // 不在此处立即显示视图，等待 buildCurrentPool 完成
            })
            .catch(error => {
                console.error('加载 packs.json 失败:', error);
                packsListDiv.innerHTML = `<p style="color: red;">错误：无法加载扩展包列表 (${error.message})。</p>`;
                poolInfoP.textContent = '加载扩展包列表失败。';
                initialDrawButton.disabled = true;
                showView('settings'); // 即使出错也显示设置
            });
    }

    // --- Bind Events and Start ---
    initialDrawButton.addEventListener('click', handleInitialDraw);
    cancelSelectionButton.addEventListener('click', handleCancelSelection);
    backToSelectionButton.addEventListener('click', handleBackToSelection);
    confirmSelectionButton.addEventListener('click', handleConfirmSelection);
    redrawButton.addEventListener('click', handleRedraw);
    lockButton.addEventListener('click', handleLock);

    loadInitialPackList(); // 开始加载
    showView('settings'); // 明确初始显示设置视图

});

// (确保 CSS 中包含 shake 动画定义)
/*
@keyframes shake {
  0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); }
  50% { transform: translateX(3px); } 75% { transform: translateX(-3px); }
}
*/