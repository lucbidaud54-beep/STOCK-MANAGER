// ========================================
// STOCK MANAGER
// DNMADE Daunot - Audiovisuel
// VERSION CORRIGÉE - STABLE
// ========================================

class StockApp {
    constructor() {
        this.currentUser = null;
        this.articles = [];
        this.movements = [];
        this.history = [];
        this.users = [];
        this.requests = [];
        this.notifications = [];
        this.inventory = null;
        
        console.log('StockApp Constructor - Initialisation...');
        this.init();
    }

    // ====== INITIALISATION ======
    init() {
        console.log('Init - Étape 1: Chargement du stockage');
        this.loadFromStorage();
        
        console.log('Init - Étape 2: Setup event listeners');
        this.setupEventListeners();
        
        console.log('Init - Étape 3: Vérification authentification');
        this.checkAuthentication();
        
        console.log('Init - Étape 4: Initialiser données démo si vide');
        if (this.users.length === 0) {
            this.initializeDemoData();
        }
        
        console.log('Init - COMPLÈTE');
    }

    initializeDemoData() {
        console.log('Initializing demo data...');
        
        // Utilisateurs de démonstration
        this.users = [
            { id: 1, fullName: 'Admin', username: 'admin', password: 'admin123', role: 'Admin', createdAt: new Date() },
            { id: 2, fullName: 'Gestionnaire Stock', username: 'gestionnaire', password: 'gestionnaire123', role: 'Gestionnaire', createdAt: new Date() },
            { id: 3, fullName: 'Utilisateur', username: 'user', password: 'user123', role: 'Utilisateur', createdAt: new Date() }
        ];

        // Articles de démonstration
        this.articles = [
            { id: 1, name: 'Microphone Shure SM58', category: 'Son', location: 'Magasin', quantity: 5, minStock: 2, price: 99, description: 'Microphone professionnel' },
            { id: 2, name: 'Câble XLR 10m', category: 'Son', location: 'Magasin', quantity: 12, minStock: 5, price: 15, description: 'Câble audio professionnel' },
            { id: 3, name: 'Table de Mixage Yamaha', category: 'Son', location: 'Salle A', quantity: 2, minStock: 1, price: 350, description: 'Console de mixage 8 canaux' },
            { id: 4, name: 'Projecteur LED RGB', category: 'Lumière', location: 'Salle B', quantity: 8, minStock: 4, price: 200, description: 'Projecteur intelligent RGB' },
            { id: 5, name: 'Camera Sony A6700', category: 'Vidéo', location: 'Salle C', quantity: 3, minStock: 1, price: 1200, description: 'Caméra sans miroir profesionnelle' },
            { id: 6, name: 'Trépied Manfrotto', category: 'Vidéo', location: 'Magasin', quantity: 6, minStock: 2, price: 85, description: 'Trépied professionnel' },
            { id: 7, name: 'Ampoule LED 5600K', category: 'Lumière', location: 'Magasin', quantity: 20, minStock: 10, price: 25, description: 'Ampoule LED studio' },
            { id: 8, name: 'Batterie Externe USB', category: 'Accessoires', location: 'Magasin', quantity: 0, minStock: 5, price: 45, description: 'Batterie pour équipement mobile' }
        ];

        this.saveToStorage();
        this.logActivity('INIT', 'Données de démonstration chargées', 'success');
        console.log('Demo data initialized - Users:', this.users.length, 'Articles:', this.articles.length);
    }

    // ====== AUTHENTIFICATION ======
    setupEventListeners() {
        console.log('setupEventListeners - START');
        
        // Formulaire de connexion - PRIORITÉ
        const loginForm = document.getElementById('loginForm');
        console.log('loginForm element:', loginForm);
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                console.log('Login form submitted');
                this.handleLogin(e);
            });
            console.log('✓ Login form listener attaché');
        } else {
            console.error('✗ ERREUR: loginForm NOT FOUND');
        }

        // Déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Articles
        const addArticleBtn = document.getElementById('addArticleBtn');
        if (addArticleBtn) {
            addArticleBtn.addEventListener('click', () => this.openArticleModal());
        }

        const articleForm = document.getElementById('articleForm');
        if (articleForm) {
            articleForm.addEventListener('submit', (e) => this.handleSaveArticle(e));
        }

        // Mouvements
        const newMovementBtn = document.getElementById('newMovementBtn');
        if (newMovementBtn) {
            newMovementBtn.addEventListener('click', () => this.openMovementModal());
        }

        const movementForm = document.getElementById('movementForm');
        if (movementForm) {
            movementForm.addEventListener('submit', (e) => this.handleSaveMovement(e));
        }

        // Inventaire
        const startInventoryBtn = document.getElementById('startInventoryBtn');
        if (startInventoryBtn) {
            startInventoryBtn.addEventListener('click', () => this.openInventoryModal());
        }

        const completeInventoryBtn = document.getElementById('completeInventoryBtn');
        if (completeInventoryBtn) {
            completeInventoryBtn.addEventListener('click', (e) => this.handleCompleteInventory(e));
        }

        // Utilisateurs (Admin)
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.openUserModal());
        }

        const addGestManagerBtn = document.getElementById('addGestManagerBtn');
        if (addGestManagerBtn) {
            addGestManagerBtn.addEventListener('click', () => this.openGestManagerModal());
        }

        const userForm = document.getElementById('userForm');
        if (userForm) {
            userForm.addEventListener('submit', (e) => this.handleSaveUser(e));
        }

        // Demandes de matériel
        const newRequestBtn = document.getElementById('newRequestBtn');
        if (newRequestBtn) {
            newRequestBtn.addEventListener('click', () => this.openRequestModal());
        }

        const requestForm = document.getElementById('requestForm');
        if (requestForm) {
            requestForm.addEventListener('submit', (e) => this.handleSaveRequest(e));
        }

        document.getElementById('filterRequestStatus')?.addEventListener('change', () => this.renderRequests());
        document.getElementById('filterRequestDate')?.addEventListener('change', () => this.renderRequests());

        // Filtres
        document.getElementById('searchArticles')?.addEventListener('input', () => this.renderArticles());
        document.getElementById('filterCategory')?.addEventListener('change', () => this.renderArticles());
        document.getElementById('filterLocation')?.addEventListener('change', () => this.renderArticles());
        document.getElementById('filterMovementType')?.addEventListener('change', () => this.renderMovements());
        document.getElementById('filterDate')?.addEventListener('change', () => this.renderMovements());
        document.getElementById('searchHistory')?.addEventListener('input', () => this.renderHistory());
        document.getElementById('filterHistoryDate')?.addEventListener('change', () => this.renderHistory());

        // Modales
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(btn.closest('.modal')));
        });

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(btn.closest('.modal')));
        });
        
        console.log('setupEventListeners - END');
    }

    handleLogin(e) {
        e.preventDefault();
        console.log('=== HANDLE LOGIN ===');
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        console.log('Tentative de connexion:');
        console.log('  Username saisi:', username);
        console.log('  Password saisi:', password);
        console.log('  Utilisateurs disponibles:', this.users);

        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            console.log('✓ Utilisateur TROUVÉ:', user);
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.showLogin(false);
            this.renderApp();
            this.logActivity('LOGIN', `Connexion de ${user.fullName}`, 'success');
            this.showToast('Bienvenue ' + user.fullName + '!', 'success');
            console.log('✓ Login SUCCÈS');
        } else {
            console.log('✗ Utilisateur NON TROUVÉ');
            this.showToast('Identifiants incorrects', 'error');
            this.logActivity('LOGIN', 'Tentative de connexion échouée', 'error');
        }
    }

    handleLogout() {
        this.logActivity('LOGOUT', `Déconnexion de ${this.currentUser.fullName}`, 'success');
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showLogin(true);
        document.getElementById('loginForm').reset();
    }

    checkAuthentication() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.showLogin(false);
            this.renderApp();
        } else {
            this.showLogin(true);
        }
    }

    // ====== UI ======
    showLogin(show) {
        document.getElementById('loginScreen').style.display = show ? 'flex' : 'none';
        document.getElementById('appScreen').style.display = show ? 'none' : 'flex';
    }

    renderApp() {
        // Informations utilisateur
        document.getElementById('userInfo').textContent = `${this.currentUser.fullName}\n(${this.currentUser.role})`;

        // Filtrer les onglets selon le rôle
        this.filterNavByRole();

        // Affichage/masquage des éléments admin
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            if (this.currentUser.role === 'Admin') {
                el.classList.add('visible');
                el.style.display = el.className.includes('visible') ? 'flex' : 'block';
            } else {
                el.classList.remove('visible');
                el.style.display = 'none';
            }
        });

        // Affichage/masquage des éléments admin + gestionnaire
        const adminGestElements = document.querySelectorAll('[data-admin="true"]');
        adminGestElements.forEach(el => {
            if (this.currentUser.role === 'Admin' || this.currentUser.role === 'Gestionnaire') {
                el.style.display = 'flex';
            } else {
                el.style.display = 'none';
            }
        });

        // Champs articles
        this.populateArticleSelects();

        // Charger les notifications
        this.loadNotifications();

        // Afficher le tableau de bord (ou la première page accessible)
        this.navigateTo('dashboard');
    }

    handleNavigation(e) {
        e.preventDefault();
        const page = e.target.getAttribute('data-page');
        this.navigateTo(page);
    }

    navigateTo(page) {
        // Vérifier que l'utilisateur a accès à cette page
        const roleMap = {
            'Admin': ['dashboard', 'articles', 'movements', 'inventory', 'requests', 'checklist', 'notifications', 'exports', 'history', 'users'],
            'Gestionnaire': ['dashboard', 'articles', 'movements', 'inventory', 'requests', 'checklist', 'notifications', 'exports', 'history', 'users'],
            'Utilisateur': ['requests', 'notifications']
        };

        const allowedPages = roleMap[this.currentUser.role] || [];

        if (!allowedPages.includes(page)) {
            this.showToast('Accès refusé', 'error');
            // Rediriger vers la première page accessible
            page = allowedPages[0] || 'requests';
        }

        // Masquer toutes les pages
        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');

        // Mettre à jour la navigation active
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

        // Afficher la page
        const pageEl = document.getElementById(page);
        if (pageEl) {
            pageEl.style.display = 'block';

            // Rendre le contenu
            switch (page) {
                case 'dashboard':
                    this.renderDashboard();
                    break;
                case 'articles':
                    this.renderArticles();
                    break;
                case 'movements':
                    this.renderMovements();
                    break;
                case 'requests':
                    this.renderRequests();
                    break;
                case 'checklist':
                    this.renderChecklist();
                    break;
                case 'notifications':
                    this.renderNotifications();
                    break;
                case 'exports':
                    // Page statique, pas besoin de rendu
                    break;
                case 'inventory':
                    this.renderInventoryPage();
                    break;
                case 'history':
                    this.renderHistory();
                    break;
                case 'users':
                    this.renderUsers();
                    break;
            }
        }
    }

    // ====== TABLEAU DE BORD ======
    renderDashboard() {
        // Articles en stock
        const totalArticles = this.articles.length;
        document.getElementById('totalArticles').textContent = totalArticles;

        // Mouvements aujourd'hui
        const today = new Date().toDateString();
        const todayMovements = this.movements.filter(m => new Date(m.date).toDateString() === today).length;
        document.getElementById('todayMovements').textContent = todayMovements;

        // Stock critique
        const criticalStock = this.articles.filter(a => a.quantity < a.minStock).length;
        document.getElementById('criticalStock').textContent = criticalStock;

        // Valeur du stock
        const stockValue = this.articles.reduce((sum, a) => sum + (a.quantity * a.price), 0);
        document.getElementById('stockValue').textContent = stockValue.toFixed(2) + '€';

        // Top catégories
        this.renderTopCategories();

        // Graphique mouvements
        this.renderMovementsChart();
    }

    renderTopCategories() {
        const categories = {};
        this.articles.forEach(a => {
            if (!categories[a.category]) {
                categories[a.category] = 0;
            }
            categories[a.category] += a.quantity;
        });

        const sorted = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const container = document.getElementById('topCategories');
        container.innerHTML = sorted.map(([cat, qty]) => `
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>${cat}</span>
                    <strong>${qty}</strong>
                </div>
                <div style="background: #e1e4e8; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: #0052CC; height: 100%; width: ${(qty / (Math.max(...sorted.map(s => s[1])) || 1)) * 100}%; transition: width 0.3s;"></div>
                </div>
            </div>
        `).join('');
    }

    renderMovementsChart() {
        const last7Days = Array(7).fill(0).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toDateString();
        }).reverse();

        const data = last7Days.map(day => {
            return this.movements.filter(m => new Date(m.date).toDateString() === day).length;
        });

        const container = document.getElementById('movementsChart');
        container.innerHTML = data.map((count, i) => `
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-size: 0.85rem;">${last7Days[i].substring(0, 3)}</span>
                    <strong>${count}</strong>
                </div>
                <div style="background: #e1e4e8; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: #FF7A45; height: 100%; width: ${(count / (Math.max(...data) || 1)) * 100}%; transition: width 0.3s;"></div>
                </div>
            </div>
        `).join('');
    }

    // ====== ARTICLES ======
    renderArticles() {
        const search = document.getElementById('searchArticles')?.value || '';
        const category = document.getElementById('filterCategory')?.value || '';
        const location = document.getElementById('filterLocation')?.value || '';

        let filtered = this.articles.filter(a => {
            const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
            const matchCategory = !category || a.category === category;
            const matchLocation = !location || a.location === location;
            return matchSearch && matchCategory && matchLocation;
        });

        // Mettre à jour les options de catégories et emplacements
        this.updateFilterOptions();

        const container = document.getElementById('articlesContainer');
        if (filtered.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">Aucun article trouvé</p>';
            return;
        }

        container.innerHTML = filtered.map(article => {
            const isLow = article.quantity < article.minStock;
            const isCritical = article.quantity === 0;

            return `
                <div class="article-card">
                    <div class="article-header">
                        <h3 class="article-title">${article.name}</h3>
                        <span class="article-badge">${article.category}</span>
                    </div>
                    <div class="article-meta">
                        <div>📍 <strong>${article.location}</strong></div>
                        <div>💰 <strong>${article.price}€</strong></div>
                        ${article.description ? `<div style="font-size: 0.9rem; margin-top: 5px;">${article.description}</div>` : ''}
                    </div>
                    <div class="article-quantity">
                        <span>Quantité:</span>
                        <span class="quantity-badge ${isCritical ? 'critical' : isLow ? 'low' : ''}">${article.quantity}</span>
                    </div>
                    ${isLow ? `<div style="background: rgba(255, 193, 7, 0.1); padding: 8px; border-radius: 4px; font-size: 0.9rem; color: #856404; margin: 8px 0;">⚠️ Stock faible (min: ${article.minStock})</div>` : ''}
                    <div class="article-actions">
                        ${this.currentUser.role === 'Admin' ? `<button class="btn btn-secondary" onclick="app.editArticle(${article.id})">Éditer</button>` : ''}
                        <button class="btn btn-primary" onclick="app.openMovementModal(${article.id})">+ Mouvement</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateFilterOptions() {
        const categories = [...new Set(this.articles.map(a => a.category))];
        const locations = [...new Set(this.articles.map(a => a.location))];

        const categorySelect = document.getElementById('filterCategory');
        if (categorySelect) {
            const current = categorySelect.value;
            categorySelect.innerHTML = '<option value="">Toutes les catégories</option>' + 
                categories.map(c => `<option value="${c}">${c}</option>`).join('');
            categorySelect.value = current;
        }

        const locationSelect = document.getElementById('filterLocation');
        if (locationSelect) {
            const current = locationSelect.value;
            locationSelect.innerHTML = '<option value="">Tous les emplacements</option>' + 
                locations.map(l => `<option value="${l}">${l}</option>`).join('');
            locationSelect.value = current;
        }
    }

    openArticleModal(articleId = null) {
        const modal = document.getElementById('articleModal');
        const form = document.getElementById('articleForm');
        form.reset();

        if (articleId) {
            const article = this.articles.find(a => a.id === articleId);
            if (article) {
                document.getElementById('articleModalTitle').textContent = 'Éditer l\'Article';
                document.getElementById('articleName').value = article.name;
                document.getElementById('articleCategory').value = article.category;
                document.getElementById('articleLocation').value = article.location;
                document.getElementById('articleQuantity').value = article.quantity;
                document.getElementById('articleMinStock').value = article.minStock;
                document.getElementById('articlePrice').value = article.price;
                document.getElementById('articleDescription').value = article.description;
                form.dataset.editId = articleId;
            }
        } else {
            document.getElementById('articleModalTitle').textContent = 'Ajouter un Article';
            delete form.dataset.editId;
        }

        modal.style.display = 'flex';
    }

    handleSaveArticle(e) {
        e.preventDefault();
        const form = document.getElementById('articleForm');

        const articleData = {
            name: document.getElementById('articleName').value,
            category: document.getElementById('articleCategory').value,
            location: document.getElementById('articleLocation').value,
            quantity: parseInt(document.getElementById('articleQuantity').value),
            minStock: parseInt(document.getElementById('articleMinStock').value),
            price: parseFloat(document.getElementById('articlePrice').value),
            description: document.getElementById('articleDescription').value
        };

        if (form.dataset.editId) {
            const id = parseInt(form.dataset.editId);
            const article = this.articles.find(a => a.id === id);
            Object.assign(article, articleData);
            this.logActivity('EDIT_ARTICLE', `Édition: ${articleData.name}`, 'success');
            this.showToast('Article modifié', 'success');
        } else {
            const newArticle = {
                id: Math.max(...this.articles.map(a => a.id), 0) + 1,
                ...articleData,
                createdAt: new Date()
            };
            this.articles.push(newArticle);
            this.logActivity('CREATE_ARTICLE', `Création: ${articleData.name}`, 'success');
            this.showToast('Article créé', 'success');
        }

        this.saveToStorage();
        this.closeModal(document.getElementById('articleModal'));
        this.renderArticles();
    }

    editArticle(articleId) {
        this.openArticleModal(articleId);
    }

    deleteArticle(articleId) {
        if (confirm('Confirmer la suppression ?')) {
            const article = this.articles.find(a => a.id === articleId);
            this.articles = this.articles.filter(a => a.id !== articleId);
            this.logActivity('DELETE_ARTICLE', `Suppression: ${article.name}`, 'warning');
            this.saveToStorage();
            this.renderArticles();
            this.showToast('Article supprimé', 'success');
        }
    }

    populateArticleSelects() {
        const select = document.getElementById('movementArticle');
        if (select) {
            select.innerHTML = '<option value="">Sélectionner un article...</option>' +
                this.articles.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
        }
    }

    // ====== MOUVEMENTS ======
    renderMovements() {
        const typeFilter = document.getElementById('filterMovementType')?.value || '';
        const dateFilter = document.getElementById('filterDate')?.value || '';

        let filtered = this.movements.filter(m => {
            const matchType = !typeFilter || m.type === typeFilter;
            const matchDate = !dateFilter || m.date === dateFilter;
            return matchType && matchDate;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        const tbody = document.getElementById('movementsTableBody');
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">Aucun mouvement enregistré</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(movement => {
            const article = this.articles.find(a => a.id === movement.articleId);
            return `
                <tr>
                    <td>${new Date(movement.date).toLocaleDateString('fr-FR')}</td>
                    <td><span class="status-badge status-${movement.type === 'Entrée' ? 'success' : 'warning'}">${movement.type}</span></td>
                    <td>${article?.name || 'Article supprimé'}</td>
                    <td><strong>${movement.quantity}</strong></td>
                    <td>${movement.reason}</td>
                    <td>${movement.username}</td>
                    <td>
                        ${this.currentUser.role === 'Admin' ? `<button class="btn btn-secondary" style="font-size: 0.8rem; padding: 4px 8px;" onclick="app.deleteMovement(${movement.id})">Supprimer</button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    }

    openMovementModal(articleId = null) {
        const modal = document.getElementById('movementModal');
        const form = document.getElementById('movementForm');
        form.reset();

        if (articleId) {
            document.getElementById('movementArticle').value = articleId;
        }

        document.getElementById('movementDate').valueAsDate = new Date();
        modal.style.display = 'flex';
    }

    handleSaveMovement(e) {
        e.preventDefault();

        const movement = {
            id: Math.max(...this.movements.map(m => m.id), 0) + 1,
            type: document.getElementById('movementType').value,
            articleId: parseInt(document.getElementById('movementArticle').value),
            quantity: parseInt(document.getElementById('movementQuantity').value),
            date: document.getElementById('movementDate').value,
            reason: document.getElementById('movementReason').value,
            notes: document.getElementById('movementNotes').value,
            username: this.currentUser.fullName,
            createdAt: new Date()
        };

        const article = this.articles.find(a => a.id === movement.articleId);
        if (!article) {
            this.showToast('Article non trouvé', 'error');
            return;
        }

        switch (movement.type) {
            case 'Entrée':
                article.quantity += movement.quantity;
                break;
            case 'Sortie':
            case 'Retour':
                article.quantity -= movement.quantity;
                if (article.quantity < 0) {
                    this.showToast('Stock insuffisant', 'error');
                    return;
                }
                break;
            case 'Ajustement':
                article.quantity = movement.quantity;
                break;
        }

        this.movements.push(movement);
        this.saveToStorage();
        this.logActivity('MOVEMENT', `Mouvement ${movement.type}: ${article.name} (${movement.quantity})`, 'success');
        this.showToast('Mouvement enregistré', 'success');
        this.closeModal(document.getElementById('movementModal'));
        this.renderMovements();
        this.renderDashboard();
    }

    deleteMovement(movementId) {
        if (confirm('Confirmer la suppression du mouvement ?')) {
            const movement = this.movements.find(m => m.id === movementId);
            if (movement) {
                const article = this.articles.find(a => a.id === movement.articleId);
                if (article) {
                    switch (movement.type) {
                        case 'Entrée':
                            article.quantity -= movement.quantity;
                            break;
                        case 'Sortie':
                        case 'Retour':
                            article.quantity += movement.quantity;
                            break;
                        case 'Ajustement':
                            break;
                    }
                }
            }
            this.movements = this.movements.filter(m => m.id !== movementId);
            this.saveToStorage();
            this.logActivity('DELETE_MOVEMENT', 'Suppression de mouvement', 'warning');
            this.renderMovements();
            this.showToast('Mouvement supprimé', 'success');
        }
    }

    // ====== INVENTAIRE ======
    renderInventoryPage() {
        const container = document.getElementById('inventoryContainer');
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p style="font-size: 1.1rem; margin-bottom: 20px;">Cliquez sur "Débuter Inventaire" pour procéder à l'inventaire physique.</p>
                <p style="color: #6a737d;">L'inventaire permettra de corriger les écarts entre le stock système et le stock physique.</p>
            </div>
        `;
    }

    openInventoryModal() {
        const modal = document.getElementById('inventoryModal');
        const container = document.getElementById('inventoryItems');

        this.inventory = {};
        this.articles.forEach(a => {
            this.inventory[a.id] = { ...a, countedQuantity: 0, difference: 0 };
        });

        container.innerHTML = this.articles.map(article => `
            <div class="inventory-item">
                <h4>${article.name}</h4>
                <div style="color: #6a737d; font-size: 0.9rem; margin-bottom: 10px;">
                    Système: <strong>${article.quantity}</strong>
                </div>
                <div class="inventory-input-group">
                    <label style="flex: 0 0 100px;">Compté:</label>
                    <input type="number" min="0" value="${article.quantity}" 
                        data-article-id="${article.id}"
                        class="inventory-count"
                        style="flex: 1;">
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.inventory-count').forEach(input => {
            input.addEventListener('input', (e) => {
                const articleId = parseInt(e.target.getAttribute('data-article-id'));
                const counted = parseInt(e.target.value) || 0;
                const article = this.articles.find(a => a.id === articleId);
                if (article) {
                    const item = this.inventory[articleId];
                    item.countedQuantity = counted;
                    item.difference = counted - article.quantity;
                }
            });
        });

        modal.style.display = 'flex';
    }

    handleCompleteInventory(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        let hasChanges = false;
        for (let articleId in this.inventory) {
            const item = this.inventory[articleId];
            if (item.difference !== 0) {
                hasChanges = true;
                const article = this.articles.find(a => a.id === parseInt(articleId));
                if (article) {
                    const movement = {
                        id: Math.max(...this.movements.map(m => m.id), 0) + 1,
                        type: 'Ajustement',
                        articleId: parseInt(articleId),
                        quantity: item.countedQuantity,
                        date: new Date().toISOString().split('T')[0],
                        reason: 'Ajustement inventaire',
                        notes: `Inventaire: système ${article.quantity} → compté ${item.countedQuantity}`,
                        username: this.currentUser.fullName,
                        createdAt: new Date()
                    };
                    this.movements.push(movement);
                    article.quantity = item.countedQuantity;
                }
            }
        }

        if (hasChanges) {
            this.saveToStorage();
            this.logActivity('INVENTORY', 'Inventaire complété avec ajustements', 'success');
            this.showToast('Inventaire validé et ajustements enregistrés', 'success');
        } else {
            this.showToast('Pas d\'écarts détectés', 'info');
        }

        this.closeModal(document.getElementById('inventoryModal'));
    }

    // ====== HISTORIQUE ======
    renderHistory() {
        const search = document.getElementById('searchHistory')?.value || '';
        const dateFilter = document.getElementById('filterHistoryDate')?.value || '';

        let filtered = this.history.filter(h => {
            const matchSearch = h.action.toLowerCase().includes(search.toLowerCase()) ||
                               h.details.toLowerCase().includes(search.toLowerCase());
            const matchDate = !dateFilter || new Date(h.timestamp).toISOString().split('T')[0] === dateFilter;
            return matchSearch && matchDate;
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const tbody = document.getElementById('historyTableBody');
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">Pas d\'activité</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(entry => {
            const date = new Date(entry.timestamp);
            const formattedDate = date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR');

            return `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${entry.username}</td>
                    <td><strong>${entry.action}</strong></td>
                    <td>${entry.details}</td>
                    <td><span class="status-badge status-${entry.status}">${entry.status}</span></td>
                </tr>
            `;
        }).join('');
    }

    logActivity(action, details, status = 'success') {
        const entry = {
            id: Math.max(...this.history.map(h => h.id), 0) + 1,
            timestamp: new Date().toISOString(),
            username: this.currentUser?.fullName || 'Système',
            action: action,
            details: details,
            status: status
        };
        this.history.push(entry);
        this.saveToStorage();
    }

    // ====== CHECK-LIST RETOUR ======
    renderChecklist() {
        // Récupérer les demandes approuvées avec date de retour aujourd'hui ou dépassée
        const today = new Date().toISOString().split('T')[0];
        const returnDue = this.requests.filter(r => 
            r.status === 'Approuvée' && r.returnDate <= today
        ).sort((a, b) => new Date(a.returnDate) - new Date(b.returnDate));

        const container = document.getElementById('checklistContainer');

        if (returnDue.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p style="font-size: 1.1rem; margin-bottom: 20px;">✅ Aucun retour prévu aujourd'hui</p>
                    <p style="color: #6a737d;">Les articles à retour apparaîtront ici.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = returnDue.map(request => {
            const article = this.articles.find(a => a.id === request.articleId);
            const startDate = new Date(request.startDate).toLocaleDateString('fr-FR');
            const returnDate = new Date(request.returnDate).toLocaleDateString('fr-FR');
            const isOverdue = new Date(request.returnDate) < new Date(today);

            return `
                <div class="checklist-item" id="checklist-${request.id}">
                    <h4>📦 ${article?.name || 'Article supprimé'}</h4>
                    
                    <div class="checklist-dates" style="${isOverdue ? 'background: rgba(220, 53, 69, 0.1); border-left: 3px solid #DC3545;' : ''}">
                        <strong>Période d'emprunt :</strong><br>
                        Du ${startDate} au ${returnDate}
                        ${isOverdue ? '<br><span style="color: #DC3545; font-weight: bold;">⚠️ En retard !</span>' : ''}
                    </div>

                    <div class="checklist-meta">
                        <div>👤 Emprunté par : <strong>${request.username}</strong></div>
                        <div>📊 Quantité : <strong>${request.quantity}</strong></div>
                        <div>💬 Motif : <strong>${request.reason}</strong></div>
                    </div>

                    <div class="checklist-checkbox">
                        <input type="checkbox" id="check-${request.id}" class="checklist-check" data-request-id="${request.id}">
                        <label for="check-${request.id}" style="cursor: pointer; flex: 1; margin: 0;">
                            Article reçu ✓
                        </label>
                    </div>

                    <div class="checklist-note">
                        <label for="note-${request.id}"><strong>📝 Note de retour</strong></label>
                        <textarea id="note-${request.id}" class="checklist-note-text" data-request-id="${request.id}" placeholder="Ex: Bon état, Rayé, Fonctionne normalement, Batterie faible..."></textarea>
                    </div>

                    <div class="checklist-actions">
                        <button class="btn btn-primary" onclick="app.confirmReturn(${request.id})" style="flex: 1;">
                            ✓ Valider Retour
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Ajouter un bouton global de validation
        const globalContainer = document.createElement('div');
        globalContainer.style.cssText = 'grid-column: 1/-1; padding: 20px; background: #f6f8fa; border-radius: 6px; margin-top: 20px;';
        globalContainer.innerHTML = `
            <button class="btn btn-success" onclick="app.confirmAllReturns()" style="width: 100%;">
                ✓ Valider Tous les Retours Cochés
            </button>
        `;
        container.appendChild(globalContainer);
    }

    confirmReturn(requestId) {
        const checkbox = document.getElementById(`check-${requestId}`);
        const noteText = document.getElementById(`note-${requestId}`).value;

        if (!checkbox.checked) {
            this.showToast('Veuillez cocher "Article reçu" d\'abord', 'warning');
            return;
        }

        const request = this.requests.find(r => r.id === requestId);
        if (!request) {
            this.showToast('Demande non trouvée', 'error');
            return;
        }

        const article = this.articles.find(a => a.id === request.articleId);
        if (!article) {
            this.showToast('Article non trouvé', 'error');
            return;
        }

        // Augmenter le stock
        article.quantity += request.quantity;

        // Créer un mouvement de retour
        const movement = {
            id: Math.max(...this.movements.map(m => m.id), 0) + 1,
            type: 'Retour',
            articleId: request.articleId,
            quantity: request.quantity,
            date: new Date().toISOString().split('T')[0],
            reason: 'Retour matériel emprunté',
            notes: noteText || 'Retour sans notes',
            username: this.currentUser.fullName,
            createdAt: new Date()
        };
        this.movements.push(movement);

        // Mettre à jour le statut de la demande
        request.status = 'Retourné';

        this.saveToStorage();
        this.logActivity('RETURN', `Retour: ${article.name} x${request.quantity} de ${request.username}. Note: ${noteText}`, 'success');
        this.showToast('Retour enregistré avec succès', 'success');

        // Actualiser la check-list
        this.renderChecklist();
    }

    confirmAllReturns() {
        const checkboxes = document.querySelectorAll('.checklist-check:checked');
        
        if (checkboxes.length === 0) {
            this.showToast('Aucun article coché', 'warning');
            return;
        }

        let success = 0;
        checkboxes.forEach(checkbox => {
            const requestId = parseInt(checkbox.getAttribute('data-request-id'));
            this.confirmReturn(requestId);
            success++;
        });

        this.showToast(`${success} retour(s) enregistré(s)`, 'success');
    }

    // ====== DEMANDES DE MATÉRIEL ======
    renderRequests() {
        const statusFilter = document.getElementById('filterRequestStatus')?.value || '';
        const dateFilter = document.getElementById('filterRequestDate')?.value || '';

        let filtered = this.requests.filter(r => {
            const matchStatus = !statusFilter || r.status === statusFilter;
            const matchDate = !dateFilter || r.startDate === dateFilter;
            return matchStatus && matchDate;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const tbody = document.getElementById('requestsTableBody');
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">Aucune demande</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(request => {
            const article = this.articles.find(a => a.id === request.articleId);
            const statusColor = request.status === 'Approuvée' ? 'success' : 
                               request.status === 'Refusée' ? 'danger' : 
                               request.status === 'Livrée' ? 'success' : 'warning';

            const startDate = new Date(request.startDate).toLocaleDateString('fr-FR');
            const returnDate = new Date(request.returnDate).toLocaleDateString('fr-FR');

            return `
                <tr>
                    <td>
                        <small style="color: #6a737d;">Du ${startDate}</small><br>
                        <small style="color: #6a737d;">Au ${returnDate}</small>
                    </td>
                    <td>${article?.name || 'Article supprimé'}</td>
                    <td><strong>${request.quantity}</strong></td>
                    <td>${request.username}</td>
                    <td>${request.reason}</td>
                    <td><span class="status-badge status-${statusColor}">${request.status}</span></td>
                    <td>
                        ${this.currentUser.role === 'Admin' ? `
                            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                                ${request.status === 'En attente' ? `
                                    <button class="btn btn-success" style="font-size: 0.75rem; padding: 4px 6px;" onclick="app.updateRequestStatus(${request.id}, 'Approuvée')">✓</button>
                                    <button class="btn btn-danger" style="font-size: 0.75rem; padding: 4px 6px;" onclick="app.updateRequestStatus(${request.id}, 'Refusée')">✗</button>
                                ` : ''}
                                ${request.status === 'Approuvée' ? `
                                    <button class="btn btn-primary" style="font-size: 0.75rem; padding: 4px 6px;" onclick="app.updateRequestStatus(${request.id}, 'Livrée')">Livrer</button>
                                ` : ''}
                            </div>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');

        // Recharger les notifications
        this.loadNotifications();
    }

    openRequestModal() {
        const modal = document.getElementById('requestModal');
        const form = document.getElementById('requestForm');
        form.reset();

        // Dates minimales = aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('requestStartDate').value = today;
        document.getElementById('requestStartDate').min = today;
        
        // Date de retour = demain
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('requestReturnDate').value = tomorrow.toISOString().split('T')[0];
        document.getElementById('requestReturnDate').min = today;

        // Récupérer les catégories uniques
        const categories = [...new Set(this.articles.map(a => a.category))].sort();

        // Créer les boutons de catégories
        const categoriesContainer = document.getElementById('categoriesSelectionContainer');
        categoriesContainer.innerHTML = '';

        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'category-button';
            btn.textContent = `📁 ${category}`;
            btn.onclick = () => this.selectCategory(category, categories);
            categoriesContainer.appendChild(btn);
        });

        // Sélectionner la première catégorie par défaut
        if (categories.length > 0) {
            this.selectCategory(categories[0], categories);
        }

        // Mettre à jour le récapitulatif initial
        this.updateRequestSummary();

        modal.style.display = 'flex';
    }

    selectCategory(selectedCategory, allCategories) {
        // Mettre à jour les boutons de catégories
        document.querySelectorAll('.category-button').forEach(btn => {
            if (btn.textContent.includes(selectedCategory)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Afficher les articles de cette catégorie
        const container = document.getElementById('articlesSelectionContainer');
        container.innerHTML = '';

        const articlesInCategory = this.articles.filter(a => a.category === selectedCategory).sort((a, b) => a.name.localeCompare(b.name));

        if (articlesInCategory.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px; color: #6a737d;">Aucun article dans cette catégorie</p>';
            return;
        }

        articlesInCategory.forEach(article => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'article-selection-item';
            itemDiv.id = `article-select-${article.id}`;
            itemDiv.innerHTML = `
                <label>
                    <input type="checkbox" class="article-checkbox" data-article-id="${article.id}" data-article-name="${article.name}" onchange="app.updateRequestSummary()">
                    <strong>${article.name}</strong>
                </label>
                <div class="article-selection-info">
                    📍 ${article.location} | 💰 ${article.price}€ | 📦 Dispo: ${article.quantity}
                </div>
                <div class="article-selection-quantity">
                    <label style="margin: 0; font-size: 0.85rem;">Qté :</label>
                    <input type="number" min="1" max="${article.quantity}" value="1" class="article-quantity-input" data-article-id="${article.id}" onchange="app.updateRequestSummary()">
                </div>
            `;
            container.appendChild(itemDiv);
        });

        this.updateRequestSummary();
    }

    updateRequestSummary() {
        const checkboxes = document.querySelectorAll('.article-checkbox:checked');
        const summaryDiv = document.getElementById('requestSummary');

        if (checkboxes.length === 0) {
            summaryDiv.innerHTML = '<p>Aucun article sélectionné</p>';
            return;
        }

        let html = '<ul style="list-style: none; padding: 0; margin: 0;">';
        checkboxes.forEach(checkbox => {
            const articleId = parseInt(checkbox.getAttribute('data-article-id'));
            const articleName = checkbox.getAttribute('data-article-name');
            const quantityInput = document.querySelector(`input[data-article-id="${articleId}"].article-quantity-input`);
            const quantity = parseInt(quantityInput.value);
            const article = this.articles.find(a => a.id === articleId);
            const total = article ? (quantity * article.price).toFixed(2) : '0';

            html += `<li style="padding: 5px 0; border-bottom: 1px solid #e1e4e8;">
                        <strong>${articleName}</strong> × ${quantity} = ${total}€
                    </li>`;
        });
        html += '</ul>';
        summaryDiv.innerHTML = html;

        // Activer/désactiver le bouton de soumission
        document.getElementById('submitRequestBtn').disabled = checkboxes.length === 0;
    }

    handleSaveRequest(e) {
        e.preventDefault();

        // Récupérer les articles sélectionnés
        const checkboxes = document.querySelectorAll('.article-checkbox:checked');
        
        if (checkboxes.length === 0) {
            this.showToast('Veuillez sélectionner au moins un article', 'warning');
            return;
        }

        const startDate = document.getElementById('requestStartDate').value;
        const returnDate = document.getElementById('requestReturnDate').value;
        const reason = document.getElementById('requestReason').value;
        const notes = document.getElementById('requestNotes').value;

        // Vérifier que la date de retour est après la date de départ
        if (new Date(returnDate) < new Date(startDate)) {
            this.showToast('La date de retour doit être après la date de départ', 'error');
            return;
        }

        let createdCount = 0;

        // Créer une demande par article sélectionné
        checkboxes.forEach(checkbox => {
            const articleId = parseInt(checkbox.getAttribute('data-article-id'));
            const quantityInput = document.querySelector(`input[data-article-id="${articleId}"].article-quantity-input`);
            const quantity = parseInt(quantityInput.value);

            const request = {
                id: Math.max(...this.requests.map(r => r.id), 0) + 1,
                articleId: articleId,
                quantity: quantity,
                startDate: startDate,
                returnDate: returnDate,
                reason: reason,
                notes: notes,
                username: this.currentUser.fullName,
                status: 'En attente',
                createdAt: new Date()
            };

            const article = this.articles.find(a => a.id === articleId);
            if (article) {
                this.requests.push(request);
                this.logActivity('REQUEST', `Demande: ${article.name} x${quantity} du ${startDate} au ${returnDate} (${reason})`, 'success');
                createdCount++;
            }
        });

        if (createdCount > 0) {
            this.saveToStorage();
            this.showToast(`${createdCount} demande(s) envoyée(s) avec succès`, 'success');
            this.closeModal(document.getElementById('requestModal'));
            this.renderRequests();
        } else {
            this.showToast('Erreur lors de la création des demandes', 'error');
        }
    }

    updateRequestStatus(requestId, newStatus) {
        const request = this.requests.find(r => r.id === requestId);
        if (request) {
            const oldStatus = request.status;
            request.status = newStatus;

            // Si approuvée, pas de changement de stock
            // Si livrée, retirer du stock
            if (newStatus === 'Livrée' && oldStatus === 'Approuvée') {
                const article = this.articles.find(a => a.id === request.articleId);
                if (article) {
                    article.quantity -= request.quantity;
                    if (article.quantity < 0) article.quantity = 0;

                    // Créer un mouvement
                    const movement = {
                        id: Math.max(...this.movements.map(m => m.id), 0) + 1,
                        type: 'Sortie',
                        articleId: request.articleId,
                        quantity: request.quantity,
                        date: new Date().toISOString().split('T')[0],
                        reason: 'Livraison demande matériel',
                        notes: `Demande de ${request.username} (${request.reason})`,
                        username: this.currentUser.fullName,
                        createdAt: new Date()
                    };
                    this.movements.push(movement);
                }
            }

            this.saveToStorage();
            this.logActivity('REQUEST_STATUS', `Demande #${requestId}: ${oldStatus} → ${newStatus}`, 'success');
            this.showToast(`Demande ${newStatus.toLowerCase()}`, 'success');
            this.renderRequests();
        }
    }

    // ====== UTILISATEURS (ADMIN) ======
    renderUsers() {
        const container = document.getElementById('usersContainer');
        container.innerHTML = this.users.map(user => `
            <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e1e4e8;">
                <div>
                    <h4 style="margin-bottom: 5px;">${user.fullName}</h4>
                    <p style="color: #6a737d; font-size: 0.9rem; margin: 0;">@${user.username} • <span class="status-badge status-success">${user.role}</span></p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" onclick="app.editUser(${user.id})" style="font-size: 0.8rem;">Éditer</button>
                    <button class="btn btn-danger" onclick="app.deleteUser(${user.id})" style="font-size: 0.8rem;">Supprimer</button>
                </div>
            </div>
        `).join('');
    }

    openUserModal(userId = null) {
        const modal = document.getElementById('userModal');
        const form = document.getElementById('userForm');
        form.reset();

        if (userId) {
            const user = this.users.find(u => u.id === userId);
            if (user) {
                document.getElementById('userModalTitle').textContent = 'Éditer Utilisateur';
                document.getElementById('userName').value = user.fullName;
                document.getElementById('userUsername').value = user.username;
                document.getElementById('userPassword').value = user.password;
                document.getElementById('userRole').value = user.role;
                form.dataset.editId = userId;
            }
        } else {
            document.getElementById('userModalTitle').textContent = 'Ajouter Utilisateur';
            delete form.dataset.editId;
        }

        modal.style.display = 'flex';
    }

    handleSaveUser(e) {
        e.preventDefault();

        const userData = {
            fullName: document.getElementById('userName').value,
            username: document.getElementById('userUsername').value,
            password: document.getElementById('userPassword').value,
            role: document.getElementById('userRole').value
        };

        if (document.getElementById('userForm').dataset.editId) {
            const id = parseInt(document.getElementById('userForm').dataset.editId);
            const user = this.users.find(u => u.id === id);
            Object.assign(user, userData);
            this.logActivity('EDIT_USER', `Édition: ${userData.fullName} (${userData.role})`, 'success');
            this.showToast('Utilisateur modifié', 'success');
        } else {
            const newUser = {
                id: Math.max(...this.users.map(u => u.id), 0) + 1,
                ...userData,
                createdAt: new Date()
            };
            this.users.push(newUser);
            
            const messageType = userData.role === 'Gestionnaire' ? 'Gestionnaire Stock créé' : 'Utilisateur créé';
            this.logActivity('CREATE_USER', `Création: ${userData.fullName} (${userData.role})`, 'success');
            this.showToast(messageType, 'success');
        }

        this.saveToStorage();
        this.closeModal(document.getElementById('userModal'));
        this.renderUsers();
    }

    editUser(userId) {
        this.openUserModal(userId);
    }

    openGestManagerModal() {
        // Pré-remplir avec le rôle Gestionnaire
        document.getElementById('userName').value = '';
        document.getElementById('userUsername').value = '';
        document.getElementById('userPassword').value = '';
        document.getElementById('userRole').value = 'Gestionnaire';
        document.getElementById('userForm').dataset.editId = '';
        document.getElementById('userModalTitle').textContent = 'Ajouter un Gestionnaire Stock';

        const modal = document.getElementById('userModal');
        modal.style.display = 'flex';
    }

    deleteUser(userId) {
        if (confirm('Confirmer la suppression ?')) {
            const user = this.users.find(u => u.id === userId);
            this.users = this.users.filter(u => u.id !== userId);
            this.logActivity('DELETE_USER', `Suppression: ${user.fullName}`, 'warning');
            this.saveToStorage();
            this.renderUsers();
            this.showToast('Utilisateur supprimé', 'success');
        }
    }

    // ====== MODALES ======
    closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // ====== FILTRER LES ONGLETS PAR RÔLE ======
    filterNavByRole() {
        const roleMap = {
            'Admin': ['dashboard', 'articles', 'movements', 'inventory', 'requests', 'checklist', 'notifications', 'exports', 'history', 'users', 'logoutBtn'],
            'Gestionnaire': ['dashboard', 'articles', 'movements', 'inventory', 'requests', 'checklist', 'notifications', 'exports', 'history', 'users', 'logoutBtn'],
            'Utilisateur': ['requests', 'notifications', 'logoutBtn']
        };

        const allowedPages = roleMap[this.currentUser.role] || [];

        // Masquer/afficher les onglets selon le rôle
        document.querySelectorAll('.nav-link').forEach(link => {
            const page = link.getAttribute('data-page');
            const id = link.getAttribute('id');
            const identifier = page || id;

            if (allowedPages.includes(identifier)) {
                link.style.display = 'flex';
            } else {
                link.style.display = 'none';
            }
        });
    }

    // ====== NOTIFICATIONS ======
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        // Créer aussi une notification dans le centre
        const titles = {
            'success': '✅ Succès',
            'error': '❌ Erreur',
            'warning': '⚠️ Avertissement',
            'info': 'ℹ️ Information'
        };
        
        this.addNotification(type, titles[type] || 'Notification', message);
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ====== EXPORTS PDF & EXCEL ======

    // Export Catalogue - PDF
    exportArticlesPDF() {
        const doc = document.createElement('div');
        doc.innerHTML = `
            <h1 style="text-align: center; margin-bottom: 20px;">📋 Catalogue d'Articles - Stock Manager</h1>
            <p style="text-align: center; color: #666; margin-bottom: 30px;">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background: #0052CC; color: white;">
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Article</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Catégorie</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Emplacement</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Quantité</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Min</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Prix Unit.</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Valeur</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.articles.map(a => `
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 10px; border: 1px solid #ddd;">${a.name}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${a.category}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${a.location}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${a.quantity}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${a.minStock}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${a.price}€</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${(a.quantity * a.price).toFixed(2)}€</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p style="margin-top: 30px; text-align: right; font-weight: bold;">
                Valeur totale du stock : ${this.articles.reduce((sum, a) => sum + (a.quantity * a.price), 0).toFixed(2)}€
            </p>
        `;
        
        const opt = { margin: 10, filename: 'Catalogue_Articles.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { orientation: 'landscape' } };
        html2pdf().set(opt).from(doc).save();
        this.showToast('PDF Catalogue exporté', 'success');
    }

    // Export Catalogue - Excel
    exportArticlesExcel() {
        const data = this.articles.map(a => ({
            'Article': a.name,
            'Catégorie': a.category,
            'Emplacement': a.location,
            'Quantité': a.quantity,
            'Stock Min': a.minStock,
            'Prix Unit.': a.price,
            'Valeur': a.quantity * a.price,
            'Description': a.description
        }));
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Catalogue');
        XLSX.writeFile(wb, 'Catalogue_Articles.xlsx');
        this.showToast('Excel Catalogue exporté', 'success');
    }

    // Export Mouvements - PDF
    exportMovementsPDF() {
        const doc = document.createElement('div');
        doc.innerHTML = `
            <h1 style="text-align: center; margin-bottom: 20px;">🔄 Mouvements de Stock - Stock Manager</h1>
            <p style="text-align: center; color: #666; margin-bottom: 30px;">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px;">
                <thead>
                    <tr style="background: #0052CC; color: white;">
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Date</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Type</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Article</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Quantité</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Raison</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Utilisateur</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.movements.map(m => {
                        const article = this.articles.find(a => a.id === m.articleId);
                        return `
                            <tr style="border-bottom: 1px solid #ddd;">
                                <td style="padding: 8px; border: 1px solid #ddd;">${new Date(m.date).toLocaleDateString('fr-FR')}</td>
                                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.type}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${article?.name || 'N/A'}</td>
                                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${m.quantity}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${m.reason}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${m.username}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            <p style="margin-top: 20px; color: #666;">Total mouvements : ${this.movements.length}</p>
        `;
        
        const opt = { margin: 10, filename: 'Mouvements_Stock.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { orientation: 'landscape' } };
        html2pdf().set(opt).from(doc).save();
        this.showToast('PDF Mouvements exporté', 'success');
    }

    // Export Mouvements - Excel
    exportMovementsExcel() {
        const data = this.movements.map(m => {
            const article = this.articles.find(a => a.id === m.articleId);
            return {
                'Date': new Date(m.date).toLocaleDateString('fr-FR'),
                'Type': m.type,
                'Article': article?.name || 'N/A',
                'Quantité': m.quantity,
                'Raison': m.reason,
                'Notes': m.notes,
                'Utilisateur': m.username
            };
        });
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Mouvements');
        XLSX.writeFile(wb, 'Mouvements_Stock.xlsx');
        this.showToast('Excel Mouvements exporté', 'success');
    }

    // Export Demandes - PDF
    exportRequestsPDF() {
        const doc = document.createElement('div');
        doc.innerHTML = `
            <h1 style="text-align: center; margin-bottom: 20px;">📝 Demandes de Matériel - Stock Manager</h1>
            <p style="text-align: center; color: #666; margin-bottom: 30px;">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px;">
                <thead>
                    <tr style="background: #0052CC; color: white;">
                        <th style="padding: 8px; border: 1px solid #ddd;">Départ</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Retour</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Article</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Qty</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Demandeur</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Raison</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Statut</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.requests.map(r => {
                        const article = this.articles.find(a => a.id === r.articleId);
                        return `
                            <tr style="border-bottom: 1px solid #ddd;">
                                <td style="padding: 8px; border: 1px solid #ddd;">${new Date(r.startDate).toLocaleDateString('fr-FR')}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${new Date(r.returnDate).toLocaleDateString('fr-FR')}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${article?.name || 'N/A'}</td>
                                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${r.quantity}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${r.username}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${r.reason}</td>
                                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${r.status}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        const opt = { margin: 10, filename: 'Demandes_Materiel.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { orientation: 'landscape' } };
        html2pdf().set(opt).from(doc).save();
        this.showToast('PDF Demandes exporté', 'success');
    }

    // Export Demandes - Excel
    exportRequestsExcel() {
        const data = this.requests.map(r => {
            const article = this.articles.find(a => a.id === r.articleId);
            return {
                'Départ': new Date(r.startDate).toLocaleDateString('fr-FR'),
                'Retour': new Date(r.returnDate).toLocaleDateString('fr-FR'),
                'Article': article?.name || 'N/A',
                'Quantité': r.quantity,
                'Demandeur': r.username,
                'Raison': r.reason,
                'Statut': r.status,
                'Notes': r.notes
            };
        });
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Demandes');
        XLSX.writeFile(wb, 'Demandes_Materiel.xlsx');
        this.showToast('Excel Demandes exporté', 'success');
    }

    // Export Historique - PDF
    exportHistoryPDF() {
        const doc = document.createElement('div');
        doc.innerHTML = `
            <h1 style="text-align: center; margin-bottom: 20px;">📜 Historique d'Activité - Stock Manager</h1>
            <p style="text-align: center; color: #666; margin-bottom: 30px;">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px;">
                <thead>
                    <tr style="background: #0052CC; color: white;">
                        <th style="padding: 8px; border: 1px solid #ddd;">Date & Heure</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Utilisateur</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Action</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Détails</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Statut</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.history.map(h => `
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(h.timestamp).toLocaleDateString('fr-FR')} ${new Date(h.timestamp).toLocaleTimeString('fr-FR')}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${h.username}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${h.action}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${h.details}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${h.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        const opt = { margin: 10, filename: 'Historique_Activite.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { orientation: 'landscape' } };
        html2pdf().set(opt).from(doc).save();
        this.showToast('PDF Historique exporté', 'success');
    }

    // Export Historique - Excel
    exportHistoryExcel() {
        const data = this.history.map(h => ({
            'Date': new Date(h.timestamp).toLocaleDateString('fr-FR'),
            'Heure': new Date(h.timestamp).toLocaleTimeString('fr-FR'),
            'Utilisateur': h.username,
            'Action': h.action,
            'Détails': h.details,
            'Statut': h.status
        }));
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Historique');
        XLSX.writeFile(wb, 'Historique_Activite.xlsx');
        this.showToast('Excel Historique exporté', 'success');
    }

    // Export Complet - PDF
    exportAllPDF() {
        const doc = document.createElement('div');
        doc.innerHTML = `
            <h1 style="text-align: center; margin-bottom: 10px;">📦 Stock Manager - Rapport Complet</h1>
            <p style="text-align: center; color: #666; margin-bottom: 30px;">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            
            <h2 style="margin-top: 40px; border-bottom: 2px solid #0052CC; padding-bottom: 10px;">📋 Catalogue</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px;">
                <thead>
                    <tr style="background: #f0f0f0;">
                        <th style="padding: 8px; border: 1px solid #ddd;">Article</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Cat.</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Qty</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Min</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Prix</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Valeur</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.articles.map(a => `
                        <tr><td style="padding: 6px; border: 1px solid #ddd;">${a.name}</td>
                        <td style="padding: 6px; border: 1px solid #ddd;">${a.category}</td>
                        <td style="padding: 6px; border: 1px solid #ddd;">${a.quantity}</td>
                        <td style="padding: 6px; border: 1px solid #ddd;">${a.minStock}</td>
                        <td style="padding: 6px; border: 1px solid #ddd;">${a.price}€</td>
                        <td style="padding: 6px; border: 1px solid #ddd;">${(a.quantity * a.price).toFixed(2)}€</td></tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h2 style="margin-top: 40px; border-bottom: 2px solid #0052CC; padding-bottom: 10px;">🔄 Mouvements Récents (10 derniers)</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10px;">
                <tbody>
                    ${this.movements.slice(-10).map(m => {
                        const article = this.articles.find(a => a.id === m.articleId);
                        return `<tr><td style="padding: 4px; border: 1px solid #ddd;">${new Date(m.date).toLocaleDateString('fr-FR')} | ${m.type} | ${article?.name || 'N/A'} | Qty: ${m.quantity} | ${m.username}</td></tr>`;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        const opt = { margin: 10, filename: 'Rapport_Complet.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { orientation: 'landscape' } };
        html2pdf().set(opt).from(doc).save();
        this.showToast('PDF Complet exporté', 'success');
    }

    // Export Complet - Excel
    exportAllExcel() {
        const wb = XLSX.utils.book_new();
        
        // Feuille 1: Catalogue
        const articlesData = this.articles.map(a => ({
            'Article': a.name,
            'Catégorie': a.category,
            'Emplacement': a.location,
            'Quantité': a.quantity,
            'Stock Min': a.minStock,
            'Prix Unit.': a.price,
            'Valeur': a.quantity * a.price
        }));
        const ws1 = XLSX.utils.json_to_sheet(articlesData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Catalogue');
        
        // Feuille 2: Mouvements
        const movementsData = this.movements.map(m => {
            const article = this.articles.find(a => a.id === m.articleId);
            return {
                'Date': new Date(m.date).toLocaleDateString('fr-FR'),
                'Type': m.type,
                'Article': article?.name || 'N/A',
                'Quantité': m.quantity,
                'Raison': m.reason,
                'Utilisateur': m.username
            };
        });
        const ws2 = XLSX.utils.json_to_sheet(movementsData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Mouvements');
        
        // Feuille 3: Demandes
        const requestsData = this.requests.map(r => {
            const article = this.articles.find(a => a.id === r.articleId);
            return {
                'Départ': new Date(r.startDate).toLocaleDateString('fr-FR'),
                'Retour': new Date(r.returnDate).toLocaleDateString('fr-FR'),
                'Article': article?.name || 'N/A',
                'Quantité': r.quantity,
                'Demandeur': r.username,
                'Statut': r.status
            };
        });
        const ws3 = XLSX.utils.json_to_sheet(requestsData);
        XLSX.utils.book_append_sheet(wb, ws3, 'Demandes');
        
        // Feuille 4: Historique
        const historyData = this.history.map(h => ({
            'Date': new Date(h.timestamp).toLocaleDateString('fr-FR'),
            'Heure': new Date(h.timestamp).toLocaleTimeString('fr-FR'),
            'Utilisateur': h.username,
            'Action': h.action,
            'Détails': h.details
        }));
        const ws4 = XLSX.utils.json_to_sheet(historyData);
        XLSX.utils.book_append_sheet(wb, ws4, 'Historique');
        
        XLSX.writeFile(wb, 'Rapport_Complet.xlsx');
        this.showToast('Excel Complet exporté', 'success');
    }

    // ====== NOTIFICATIONS ======
    addNotification(type, title, message) {
        const notification = {
            id: Math.max(...this.notifications.map(n => n.id), 0) + 1,
            type: type, // 'success', 'error', 'warning', 'info'
            title: title,
            message: message,
            timestamp: new Date(),
            read: false
        };

        this.notifications.unshift(notification); // Ajouter en début de liste

        // Garder seulement les 100 dernières notifications
        if (this.notifications.length > 100) {
            this.notifications.pop();
        }

        this.updateNotificationBadge();
        this.saveToStorage();

        return notification;
    }

    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notificationBadge');

        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }

    renderNotifications() {
        const container = document.getElementById('notificationsCenter');

        if (this.notifications.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #6a737d;"><p>Aucune notification</p></div>';
            return;
        }

        container.innerHTML = this.notifications.map(notification => {
            const time = new Date(notification.timestamp);
            const timeStr = time.toLocaleDateString('fr-FR') + ' ' + time.toLocaleTimeString('fr-FR');

            return `
                <div class="notification-item ${notification.type}" ${notification.read ? 'style="opacity: 0.6;"' : ''}>
                    <div class="notification-header">
                        <div>
                            <span class="notification-title">${notification.title}</span>
                            <span class="notification-type" style="margin-left: 10px;">${notification.type.toUpperCase()}</span>
                        </div>
                        <span class="notification-time">${timeStr}</span>
                    </div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-actions">
                        ${!notification.read ? `<button class="btn btn-secondary" onclick="app.markNotificationAsRead(${notification.id})">Marquer comme lu</button>` : ''}
                        <button class="btn btn-secondary" onclick="app.deleteNotification(${notification.id})">Supprimer</button>
                    </div>
                </div>
            `;
        }).join('');

        // Marquer toutes comme lues
        this.notifications.forEach(n => n.read = true);
        this.updateNotificationBadge();
        this.saveToStorage();
    }

    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.updateNotificationBadge();
            this.saveToStorage();
            this.renderNotifications();
        }
    }

    deleteNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateNotificationBadge();
        this.saveToStorage();
        this.renderNotifications();
    }

    clearAllNotifications() {
        if (confirm('Supprimer toutes les notifications ?')) {
            this.notifications = [];
            this.updateNotificationBadge();
            this.saveToStorage();
            this.renderNotifications();
            this.showToast('Toutes les notifications ont été supprimées', 'success');
        }
    }

    // ====== NOTIFICATIONS ======
    loadNotifications() {
        const notificationsBar = document.getElementById('notificationsBar');
        notificationsBar.innerHTML = '';

        const notifications = [];

        // 1. Notifications de retour d'articles (dates dépassées)
        const today = new Date().toISOString().split('T')[0];
        const overduReturns = this.requests.filter(r => 
            r.status === 'Approuvée' && r.returnDate < today
        );

        overduReturns.forEach(request => {
            const article = this.articles.find(a => a.id === request.articleId);
            const daysOverdue = Math.floor((new Date(today) - new Date(request.returnDate)) / (1000 * 60 * 60 * 24));
            
            notifications.push({
                type: 'return',
                icon: '📦',
                title: `Retour en Retard`,
                message: `${article?.name} emprunté par ${request.username} depuis ${daysOverdue} jour(s)`,
                critical: daysOverdue > 3,
                action: { label: 'Check-list', page: 'checklist' },
                id: `return-${request.id}`
            });
        });

        // 2. Notifications de demandes en attente (Admin uniquement)
        if (this.currentUser.role === 'Admin') {
            const pendingRequests = this.requests.filter(r => r.status === 'En attente');
            
            if (pendingRequests.length > 0) {
                notifications.push({
                    type: 'pending',
                    icon: '⏳',
                    title: `Demandes en Attente`,
                    message: `${pendingRequests.length} demande(s) à traiter`,
                    critical: pendingRequests.length > 5,
                    action: { label: 'Voir', page: 'requests' },
                    id: 'pending-requests'
                });
            }
        }

        // Afficher les notifications
        if (notifications.length === 0) {
            notificationsBar.classList.add('hidden');
            return;
        }

        notificationsBar.classList.remove('hidden');

        notifications.forEach(notif => {
            const notifEl = document.createElement('div');
            notifEl.className = `notification-item ${notif.critical ? 'critical' : ''}`;
            notifEl.id = notif.id;
            notifEl.innerHTML = `
                <div class="notification-icon">${notif.icon}</div>
                <div class="notification-content">
                    <div class="notification-title">${notif.title}</div>
                    <div class="notification-message">${notif.message}</div>
                </div>
                ${notif.action ? `<div class="notification-action">
                    <button class="btn btn-primary" onclick="app.navigateTo('${notif.action.page}')">${notif.action.label}</button>
                </div>` : ''}
                <button class="notification-close" onclick="document.getElementById('${notif.id}').remove()">✕</button>
            `;
            notificationsBar.appendChild(notifEl);
        });
    }

    // ====== TOGGLE MOT DE PASSE ======
    togglePasswordVisibility(fieldId) {
        const field = document.getElementById(fieldId);
        const button = event.target.closest('.password-toggle-btn');
        
        if (field.type === 'password') {
            field.type = 'text';
            button.textContent = '🙈';
        } else {
            field.type = 'password';
            button.textContent = '👁️';
        }
    }

    // ====== STOCKAGE ======
    saveToStorage() {
        localStorage.setItem('articles', JSON.stringify(this.articles));
        localStorage.setItem('movements', JSON.stringify(this.movements));
        localStorage.setItem('history', JSON.stringify(this.history));
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('requests', JSON.stringify(this.requests));
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    loadFromStorage() {
        const articles = localStorage.getItem('articles');
        const movements = localStorage.getItem('movements');
        const history = localStorage.getItem('history');
        const users = localStorage.getItem('users');
        const requests = localStorage.getItem('requests');
        const notifications = localStorage.getItem('notifications');

        if (articles) this.articles = JSON.parse(articles);
        if (movements) this.movements = JSON.parse(movements);
        if (history) this.history = JSON.parse(history);
        if (users) this.users = JSON.parse(users);
        if (requests) this.requests = JSON.parse(requests);
        if (notifications) this.notifications = JSON.parse(notifications);
    }
}

// Initialiser l'application
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - Création de app');
    app = new StockApp();
});
