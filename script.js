/**
 * Sistema de Autenticação
 * Gerencia login, registro e estado do usuário
 */
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.initAuth();
    }

    initAuth() {
        if (window.location.pathname.includes('login.html')) {
            this.setupAuthForms();
            this.setupTabSwitching();
        }
        this.updateAuthUI();
        this.loadProfileData();
    }

    setupAuthForms() {
        // Formulário de Login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                this.login(email, password);
            });
        }

        // Formulário de Registro
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('register-name').value;
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const confirmPassword = document.getElementById('register-confirm').value;
                
                if (password !== confirmPassword) {
                    this.showAlert('As senhas não coincidem!', 'error');
                    return;
                }
                
                this.register(name, email, password);
            });
        }
    }

    setupTabSwitching() {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(`${tab.dataset.tab}-form`).classList.add('active');
            });
        });
    }

    register(name, email, password) {
        if (this.users.some(user => user.email === email)) {
            this.showAlert('Este e-mail já está cadastrado!', 'error');
            return;
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            reviews: [],
            orders: []
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        
        this.showAlert('Cadastro realizado com sucesso!', 'success');
        document.querySelector('.auth-tab[data-tab="login"]').click();
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            this.showAlert('E-mail ou senha incorretos!', 'error');
            return;
        }

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.showAlert(`Bem-vindo(a), ${user.name}!`, 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    logout() {
        // Limpa o carrinho ao fazer logout
        const shoppingCart = new ShoppingCart();
        shoppingCart.clearCart();
        
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showAlert('Você saiu da sua conta.', 'success');
        this.updateAuthUI();
        
        // Redireciona para a página inicial após 1 segundo
        setTimeout(() => {
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'index.html';
            }
        }, 1000);
    }

    updateAuthUI() {
        const authLinks = document.querySelector('.auth-links');
        if (!authLinks) return;

        if (this.currentUser) {
            authLinks.innerHTML = `
                <div class="user-dropdown">
                    <a href="perfil.html" class="user-icon" title="Meu Perfil">
                        <i class="fas fa-user-circle"></i>
                    </a>
                </div>
                <a href="#" class="logout">Sair</a>
            `;
            
            // Adiciona evento de logout
            document.querySelector('.logout')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        } else {
            authLinks.innerHTML = `
                <a href="login.html">Login</a>
                <a href="login.html" class="btn-register">Criar Conta</a>
            `;
        }
    }

    loadProfileData() {
        if (!this.currentUser || !window.location.pathname.includes('perfil.html')) return;
        
        document.getElementById('profile-name').textContent = this.currentUser.name;
        document.getElementById('profile-email').textContent = this.currentUser.email;
        
        // Configura botões
        document.getElementById('logout-button')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
        
        document.getElementById('change-password')?.addEventListener('click', () => {
            this.showChangePasswordForm();
        });
    }

    showChangePasswordForm() {
        const formHtml = `
            <div class="password-form">
                <h3>Alterar Senha</h3>
                <div class="form-group">
                    <label for="current-password">Senha Atual</label>
                    <input type="password" id="current-password" required>
                </div>
                <div class="form-group">
                    <label for="new-password">Nova Senha</label>
                    <input type="password" id="new-password" required>
                </div>
                <div class="form-group">
                    <label for="confirm-new-password">Confirme a Nova Senha</label>
                    <input type="password" id="confirm-new-password" required>
                </div>
                <button class="btn" id="submit-password-change">Salvar</button>
                <button class="btn btn-cancel" id="cancel-password-change">Cancelar</button>
            </div>
        `;
        
        const securitySection = document.querySelector('.profile-section:nth-child(3)');
        securitySection.insertAdjacentHTML('beforeend', formHtml);
        
        document.getElementById('submit-password-change').addEventListener('click', () => {
            this.changePassword();
        });
        
        document.getElementById('cancel-password-change').addEventListener('click', () => {
            document.querySelector('.password-form').remove();
        });
    }

    changePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;
        
        if (newPassword !== confirmPassword) {
            this.showAlert('As novas senhas não coincidem!', 'error');
            return;
        }
        
        if (this.currentUser.password !== currentPassword) {
            this.showAlert('Senha atual incorreta!', 'error');
            return;
        }
        
        // Atualiza a senha
        this.currentUser.password = newPassword;
        
        // Atualiza no array de usuários
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            localStorage.setItem('users', JSON.stringify(this.users));
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
        
        this.showAlert('Senha alterada com sucesso!', 'success');
        document.querySelector('.password-form').remove();
    }

    showAlert(message, type = 'success') {
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alert = document.createElement('div');
        alert.className = `custom-alert ${type}`;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 3000);
    }
}

/**
 * Carrinho de Compras
 * Gerencia todos os aspectos do carrinho
 */
class ShoppingCart {
    constructor() {
        this.cart = this.loadCart();
        this.cartCountElement = null;
        this.initCart();
        this.setupEventListeners();
        this.updateCartUI();
    }

    loadCart() {
        try {
            return JSON.parse(localStorage.getItem('shoppingCart')) || [];
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error);
            return [];
        }
    }

    initCart() {
        // Remove contadores duplicados se existirem
        const counters = document.querySelectorAll('.cart-count');
        if (counters.length > 1) {
            counters.forEach((counter, index) => {
                if (index > 0) counter.remove();
            });
        }

        // Usa o contador existente ou cria um novo
        this.cartCountElement = document.querySelector('.cart-count');
        
        if (!this.cartCountElement) {
            this.cartCountElement = document.createElement('span');
            this.cartCountElement.classList.add('cart-count');
            const cartLink = document.querySelector('.cart-link');
            if (cartLink) {
                cartLink.appendChild(this.cartCountElement);
                cartLink.style.position = 'relative';
            }
        }
        
        this.updateCartCount();
    }

    setupEventListeners() {
        // Adicionar ao carrinho
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const productCard = e.target.closest('.product-card');
                if (productCard) {
                    const product = this.getProductData(productCard);
                    if (product) {
                        this.addToCart(product);
                        this.showAddToCartFeedback(e.target);
                    }
                }
            }
        });

        // Atualizar quantidade
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quantity-btn')) {
                const itemId = e.target.dataset.id;
                const item = this.cart.find(item => item.id === itemId);
                
                if (item) {
                    const newQuantity = e.target.classList.contains('minus') ? 
                        Math.max(1, item.quantity - 1) : item.quantity + 1;
                    this.updateQuantity(itemId, newQuantity);
                }
            }
        });

        // Remover item
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-item-remove')) {
                this.removeFromCart(e.target.dataset.id);
            }
        });

        // Finalizar compra
        const checkoutBtn = document.querySelector('.btn-checkout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }
    }

    getProductData(productCard) {
        try {
            return {
                id: this.generateProductId(productCard.querySelector('h3').textContent),
                title: productCard.querySelector('h3').textContent.trim(),
                price: this.parsePrice(productCard.querySelector('.price').textContent),
                image: this.extractImageUrl(productCard.querySelector('.product-img')),
                rating: productCard.querySelector('.rating')?.textContent || '★★★★☆'
            };
        } catch (error) {
            console.error('Erro ao obter dados do produto:', error);
            return null;
        }
    }

    generateProductId(productName) {
        return productName.trim().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    }

    parsePrice(priceString) {
        try {
            const numericValue = priceString.replace('R$ ', '')
                                          .replace(/\./g, '')
                                          .replace(',', '.');
            const price = parseFloat(numericValue);
            return isNaN(price) ? 0 : price;
        } catch (error) {
            console.error('Erro ao converter preço:', error);
            return 0;
        }
    }

    extractImageUrl(imgElement) {
        try {
            const bgImage = imgElement.style.backgroundImage;
            const matches = bgImage.match(/url\(["']?([^"']*)["']?\)/);
            return matches ? matches[1] : '';
        } catch (error) {
            console.error('Erro ao extrair URL da imagem:', error);
            return '';
        }
    }

    addToCart(product) {
        if (!product || !product.id) return;

        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            product.quantity = 1;
            this.cart.push(product);
        }
        
        this.saveCart();
        this.updateCartUI();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
    }

    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartUI();
        }
    }

    clearCart() {
        this.cart = [];
        localStorage.removeItem('shoppingCart');
        this.updateCartUI();
    }

    saveCart() {
        try {
            localStorage.setItem('shoppingCart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('Erro ao salvar carrinho:', error);
        }
    }

    updateCartUI() {
        this.updateCartCount();
        
        if (window.location.pathname.includes('carrinho.html')) {
            this.loadCartPage();
        }
    }

    updateCartCount() {
        const count = this.getTotalItems();
        if (this.cartCountElement) {
            this.cartCountElement.textContent = count;
        }
        // Atualiza todos os contadores na página
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    loadCartPage() {
        const cartItemsContainer = document.querySelector('.cart-items');
        if (!cartItemsContainer) return;

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <p>Seu carrinho está vazio</p>
                    <a href="index.html" class="btn">Continuar Comprando</a>
                </div>
            `;
            this.updateTotals(0);
            return;
        }
        
        let subtotal = 0;
        cartItemsContainer.innerHTML = '';
        
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                    <div>
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-remove" data-id="${item.id}">Remover</div>
                    </div>
                </div>
                <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
                <div class="cart-item-total">R$ ${itemTotal.toFixed(2).replace('.', ',')}</div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        this.updateTotals(subtotal);
    }

    updateTotals(subtotal) {
        const subtotalElement = document.querySelector('.subtotal');
        const totalElement = document.querySelector('.total-price');
        
        if (subtotalElement) {
            subtotalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        }
        
        if (totalElement) {
            totalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        }
    }

    showAddToCartFeedback(button) {
        if (!button) return;
        
        const originalText = button.textContent;
        const originalBgColor = button.style.backgroundColor;
        
        button.textContent = '✔ Adicionado';
        button.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = originalBgColor || '#e83e8c';
        }, 2000);
    }

    checkout() {
        if (this.cart.length === 0) {
            this.showAlert('Seu carrinho está vazio!', 'error');
            return;
        }
        
        const authSystem = new AuthSystem();
        if (!authSystem.currentUser) {
            authSystem.showAlert('Você precisa estar logado para finalizar a compra!', 'error');
            return;
        }
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Adiciona a compra ao histórico do usuário
        const order = {
            id: Date.now(),
            date: new Date().toISOString(),
            items: [...this.cart],
            total,
            status: 'completed'
        };
        
        authSystem.currentUser.orders.push(order);
        
        // Atualiza o usuário no localStorage
        const userIndex = authSystem.users.findIndex(u => u.id === authSystem.currentUser.id);
        if (userIndex !== -1) {
            authSystem.users[userIndex] = authSystem.currentUser;
            localStorage.setItem('users', JSON.stringify(authSystem.users));
            localStorage.setItem('currentUser', JSON.stringify(authSystem.currentUser));
        }
        
        this.showAlert(`Compra finalizada com sucesso! Total: R$ ${total.toFixed(2).replace('.', ',')}`, 'success');
        
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        
        // Redireciona para a página inicial após 2 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }

    showAlert(message, type = 'success') {
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alert = document.createElement('div');
        alert.className = `custom-alert ${type}`;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 3000);
    }
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona estilos dinâmicos para os alertas
    const style = document.createElement('style');
    style.textContent = `
        .custom-alert {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(120%);
            transition: transform 0.3s ease-out;
            z-index: 10000;
        }
        
        .custom-alert.show {
            transform: translateX(0);
        }
        
        .custom-alert.success {
            background-color: #28a745;
        }
        
        .custom-alert.error {
            background-color: #dc3545;
        }
    `;
    document.head.appendChild(style);

    // Inicializa os sistemas
    const authSystem = new AuthSystem();
    const shoppingCart = new ShoppingCart();
});