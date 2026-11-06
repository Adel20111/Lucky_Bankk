let players = [
    { id: 1, name: 'لاعب 1', cash: 10000, debt: 1500, color: '#e11d48' },
    { id: 2, name: 'لاعب 2', cash: 8500, debt: 500, color: '#2563eb' },
    { id: 3, name: 'لاعب 3', cash: 6200, debt: 0, color: '#16a34a' },
    { id: 4, name: 'لاعب 4', cash: 4100, debt: 2000, color: '#d97706' }
];

let cities = [
    { id: 'c1', name: 'القاهرة', price: 2000, owner: null, projectCost: 1000, hasProject: false },
    { id: 'c2', name: 'الإسكندرية', price: 1800, owner: null, projectCost: 900, hasProject: false },
    { id: 'c3', name: 'الأقصر', price: 1500, owner: null, projectCost: 750, hasProject: false },
    { id: 'c4', name: 'أسوان', price: 1200, owner: null, projectCost: 600, hasProject: false },
    { id: 'c5', name: 'شرم الشيخ', price: 2500, owner: null, projectCost: 1200, hasProject: false },
    { id: 'c6', name: 'الغردقة', price: 2200, owner: null, projectCost: 1100, hasProject: false },
    { id: 'c7', name: 'المنصورة', price: 1000, owner: null, projectCost: 500, hasProject: false },
    { id: 'c8', name: 'الإسماعيلية', price: 1100, owner: null, projectCost: 550, hasProject: false }
];

let currentPlayerIndex = 0;
let secondsElapsed = 0;
let timerInterval = null;
let selectedCity = null;
let currentPendingOffer = null;

document.addEventListener('DOMContentLoaded', () => {
    initTimer();
    renderBoard();
    updateHUD();
    renderLeaderboard();
    setupEventListeners();
});

function initTimer() {
    const timerElement = document.getElementById('gameTimer');
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const hrs = String(Math.floor(secondsElapsed / 3600)).padStart(2, '0');
        const mins = String(Math.floor((secondsElapsed % 3600) / 60)).padStart(2, '0');
        const secs = String(secondsElapsed % 60).padStart(2, '0');
        timerElement.textContent = `${hrs}:${mins}:${secs}`;
    }, 1000);
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function updateHUD() {
    const currentPlayer = players[currentPlayerIndex];
    document.getElementById('cashValue').textContent = formatNumber(currentPlayer.cash);
    document.getElementById('debtValue').textContent = formatNumber(currentPlayer.debt);
}

function renderBoard() {
    const boardGrid = document.getElementById('boardGrid');
    boardGrid.innerHTML = '';

    cities.slice(0, 4).forEach(city => boardGrid.appendChild(createCityCell(city)));

    const centerPanel = document.createElement('div');
    centerPanel.className = 'center-panel';
    centerPanel.innerHTML = `
        <div class="dice-section">
            <button id="rollDiceBtn" class="btn-action btn-yes">رمي النرد</button>
            <div id="diceResult" class="dice-display">-</div>
        </div>
    `;
    boardGrid.appendChild(centerPanel);

    cities.slice(4, 8).forEach(city => boardGrid.appendChild(createCityCell(city)));
}

function createCityCell(city) {
    const cell = document.createElement('div');
    cell.className = 'board-cell property';
    const ownerName = city.owner ? players.find(p => p.id === city.owner).name : 'غير مملوكة';
    const projectStatus = city.hasProject ? ' 🏗️ (مشروع)' : '';

    cell.innerHTML = `
        ${city.name}${projectStatus}<br>
        <span>${formatNumber(city.price)} EGP</span>
        <div class="city-owner">المالك: ${ownerName}</div>
    `;

    cell.addEventListener('click', () => openCityActions(city));
    return cell;
}

function openCityActions(city) {
    selectedCity = city;
    const player = players[currentPlayerIndex];

    const actionModal = document.getElementById('actionModal');
    const actionTitle = document.getElementById('actionTitle');
    const actionDesc = document.getElementById('actionDesc');

    const btnBuy = document.getElementById('btnBuyCity');
    const btnBuild = document.getElementById('btnBuildProject');
    const btnOffer = document.getElementById('btnMakeOffer');

    btnBuy.classList.add('hidden');
    btnBuild.classList.add('hidden');
    btnOffer.classList.add('hidden');

    actionTitle.textContent = city.name;

    if (!city.owner) {
        actionDesc.textContent = `سعر السراء: ${formatNumber(city.price)} EGP`;
        btnBuy.classList.remove('hidden');
    } else if (city.owner === player.id) {
        actionDesc.textContent = city.hasProject ? 'المدينة مملوكة لك وتم بناء مشروع فيها!' : `تكلفة بناء مشروع: ${formatNumber(city.projectCost)} EGP`;
        if (!city.hasProject) btnBuild.classList.remove('hidden');
    } else {
        const ownerPlayer = players.find(p => p.id === city.owner);
        actionDesc.textContent = `المدينة مملوكة لـ ${ownerPlayer.name}`;
        btnOffer.classList.remove('hidden');
    }

    actionModal.classList.remove('hidden');
}

function renderLeaderboard() {
    const listContainer = document.getElementById('leaderboardList');
    listContainer.innerHTML = '';
    const sortedPlayers = [...players].sort((a, b) => (b.cash - b.debt) - (a.cash - a.debt));

    sortedPlayers.forEach((player, index) => {
        const card = document.createElement('div');
        card.className = `player-card ${index === 0 ? 'rank-1' : ''}`;
        let badge = index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;

        card.innerHTML = `
            <div class="player-info">
                <span class="player-badge">${badge}</span>
                <span class="player-dot" style="background-color: ${player.color};"></span>
                <span>${player.name}</span>
            </div>
            <div class="player-cash">${formatNumber(player.cash)} EGP</div>
        `;
        listContainer.appendChild(card);
    });
}

function setupEventListeners() {
    document.getElementById('settingsBtn').addEventListener('click', () => document.getElementById('settingsModal').classList.remove('hidden'));
    document.getElementById('closeSettingsBtn').addEventListener('click', () => document.getElementById('settingsModal').classList.add('hidden'));
    document.getElementById('exitBtn').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.add('hidden');
        document.getElementById('exitConfirmModal').classList.remove('hidden');
    });
    document.getElementById('confirmNoBtn').addEventListener('click', () => document.getElementById('exitConfirmModal').classList.add('hidden'));
    document.getElementById('confirmYesBtn').addEventListener('click', () => window.location.reload());

    document.getElementById('btnCloseAction').addEventListener('click', () => document.getElementById('actionModal').classList.add('hidden'));

    // شراء المدينة
    document.getElementById('btnBuyCity').addEventListener('click', () => {
        const player = players[currentPlayerIndex];
        if (player.cash >= selectedCity.price) {
            player.cash -= selectedCity.price;
            selectedCity.owner = player.id;
            alert(`مبروك! قمت بشراء ${selectedCity.name}`);
            document.getElementById('actionModal').classList.add('hidden');
            renderBoard();
            updateHUD();
            renderLeaderboard();
        } else {
            alert('ليس لديك كاش كافي لشراء هذه المدينة!');
        }
    });

    // بناء مشروع
    document.getElementById('btnBuildProject').addEventListener('click', () => {
        const player = players[currentPlayerIndex];
        if (player.cash >= selectedCity.projectCost) {
            player.cash -= selectedCity.projectCost;
            selectedCity.hasProject = true;
            alert(`تم بناء مشروع في ${selectedCity.name}!`);
            document.getElementById('actionModal').classList.add('hidden');
            renderBoard();
            updateHUD();
        } else {
            alert('ليس لديك كاش كافي لبناء المشروع!');
        }
    });

    // إرسال عرض شراء
    document.getElementById('btnMakeOffer').addEventListener('click', () => {
        document.getElementById('actionModal').classList.add('hidden');
        const ownerPlayer = players.find(p => p.id === selectedCity.owner);
        document.getElementById('offerTargetText').textContent = `تقديم عرض لـ ${ownerPlayer.name} لشراء ${selectedCity.name}`;
        document.getElementById('offerModal').classList.remove('hidden');
    });

    document.getElementById('btnCancelOffer').addEventListener('click', () => document.getElementById('offerModal').classList.add('hidden'));

    document.getElementById('btnSendOffer').addEventListener('click', () => {
        const priceInput = document.getElementById('offerPriceInput');
        const offeredPrice = parseInt(priceInput.value);
        const buyer = players[currentPlayerIndex];

        if (!offeredPrice || offeredPrice <= 0) {
            alert('برجاء إدخال مبلغ صحيح!');
            return;
        }

        if (buyer.cash < offeredPrice) {
            alert('ليس لديك هذا المبلغ في الكاش!');
            return;
        }

        currentPendingOffer = {
            buyerId: buyer.id,
            sellerId: selectedCity.owner,
            city: selectedCity,
            price: offeredPrice
        };

        document.getElementById('offerModal').classList.add('hidden');
        priceInput.value = '';

        const seller = players.find(p => p.id === selectedCity.owner);
        document.getElementById('negotiateText').textContent = `اللاعب (${buyer.name}) يقدم لك عرضاً لشراء ${selectedCity.name} بمبلغ ${formatNumber(offeredPrice)} EGP.`;
        document.getElementById('negotiateModal').classList.remove('hidden');
    });

    // قبول أو رفض العرض
    document.getElementById('btnAcceptOffer').addEventListener('click', () => {
        const { buyerId, sellerId, city, price } = currentPendingOffer;
        const buyer = players.find(p => p.id === buyerId);
        const seller = players.find(p => p.id === sellerId);

        buyer.cash -= price;
        seller.cash += price;
        city.owner = buyer.id;

        alert(`تمت الصفقة بنجاح! انتقلت ملكية ${city.name} إلى ${buyer.name}`);
        document.getElementById('negotiateModal').classList.add('hidden');
        renderBoard();
        updateHUD();
        renderLeaderboard();
    });

    document.getElementById('btnRejectOffer').addEventListener('click', () => {
        alert('تم رفض عرض الشراء.');
        document.getElementById('negotiateModal').classList.add('hidden');
    });

    // زر النرد
    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'rollDiceBtn') {
            const roll = Math.floor(Math.random() * 6) + 1;
            document.getElementById('diceResult').textContent = `النتيجة: ${roll}`;

            let player = players[currentPlayerIndex];
            player.cash += roll * 150;
            if (player.debt > 0) player.debt = Math.max(0, player.debt - 100);

            updateHUD();
            renderLeaderboard();

            currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        }
    });
}