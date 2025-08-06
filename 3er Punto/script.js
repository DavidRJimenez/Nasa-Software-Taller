class DynamicSearch {
    constructor() {
        this.posts = [];
        this.searchHistory = [];
        this.currentSearchIndex = -1;
        this.initializeElements();
        this.attachEventListeners();
        this.handlePopState();
        this.loadInitialData();
    }

    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        this.backButton = document.getElementById('backButton');
        this.clearButton = document.getElementById('clearButton');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.searchInfo = document.getElementById('searchInfo');
        this.currentSearchSpan = document.getElementById('currentSearch');
        this.resultCountSpan = document.getElementById('resultCount');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.noResults = document.getElementById('noResults');
    }

    attachEventListeners() {
        // Búsqueda al hacer clic en el botón
        this.searchButton.addEventListener('click', () => this.performSearch());
        
        // Búsqueda al presionar Enter
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Botón de atrás
        this.backButton.addEventListener('click', () => {
            history.back();
        });

        // Botón de limpiar
        this.clearButton.addEventListener('click', () => {
            this.clearSearch();
        });

        // Búsqueda en tiempo real (opcional)
        this.searchInput.addEventListener('input', () => {
            const query = this.searchInput.value.trim();
            if (query.length === 0) {
                this.showAllPosts();
            }
        });
    }

    handlePopState() {
        // Manejar navegación del historial del navegador
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.search !== undefined) {
                this.searchInput.value = event.state.search;
                this.filterAndDisplayPosts(event.state.search, false);
                this.updateBackButton();
            } else {
                // Estado inicial
                this.searchInput.value = '';
                this.showAllPosts();
                this.updateBackButton();
            }
        });
    }

    async loadInitialData() {
        this.showLoading(true);
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.posts = await response.json();
            this.showLoading(false);
            this.showAllPosts();
        } catch (error) {
            console.error('Error al cargar los posts:', error);
            this.showError('Error al cargar los datos. Por favor, intenta nuevamente.');
            this.showLoading(false);
        }
    }

    performSearch() {
        const query = this.searchInput.value.trim();
        if (query === '') {
            this.showAllPosts();
            return;
        }

        // Registrar en el historial usando history.pushState
        const state = { search: query };
        const url = `?search=${encodeURIComponent(query)}`;
        history.pushState(state, `Búsqueda: ${query}`, url);

        // Agregar al historial interno
        this.addToSearchHistory(query);

        // Realizar la búsqueda
        this.filterAndDisplayPosts(query, true);
        this.updateBackButton();
    }

    addToSearchHistory(query) {
        // Evitar duplicados consecutivos
        if (this.searchHistory[this.searchHistory.length - 1] !== query) {
            this.searchHistory.push(query);
            this.currentSearchIndex = this.searchHistory.length - 1;
        }
    }

    filterAndDisplayPosts(query, updateInfo = true) {
        if (!query || query === '') {
            this.showAllPosts();
            return;
        }

        const filteredPosts = this.posts.filter(post => {
            const searchTerm = query.toLowerCase();
            return post.title.toLowerCase().includes(searchTerm) ||
                   post.body.toLowerCase().includes(searchTerm) ||
                   post.id.toString().includes(searchTerm);
        });

        this.displayPosts(filteredPosts, query, updateInfo);
    }

    showAllPosts() {
        this.displayPosts(this.posts, '', false);
    }

    displayPosts(posts, searchQuery = '', updateInfo = true) {
        this.hideAllSections();

        if (updateInfo && searchQuery) {
            this.showSearchInfo(searchQuery, posts.length);
        }

        if (posts.length === 0 && searchQuery) {
            this.noResults.classList.remove('hidden');
            return;
        }

        this.resultsContainer.innerHTML = '';
        
        posts.forEach((post, index) => {
            const postElement = this.createPostElement(post, searchQuery);
            postElement.style.animationDelay = `${index * 0.1}s`;
            this.resultsContainer.appendChild(postElement);
        });

        this.resultsContainer.style.display = 'block';
    }

    createPostElement(post, searchQuery = '') {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card';

        let title = post.title;
        let body = post.body;

        // Resaltar términos de búsqueda
        if (searchQuery) {
            const regex = new RegExp(`(${this.escapeRegex(searchQuery)})`, 'gi');
            title = title.replace(regex, '<span class="highlight">$1</span>');
            body = body.replace(regex, '<span class="highlight">$1</span>');
        }

        postDiv.innerHTML = `
            <div class="post-id">Post #${post.id}</div>
            <h3 class="post-title">${title}</h3>
            <p class="post-body">${body}</p>
        `;

        return postDiv;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    showSearchInfo(query, count) {
        this.currentSearchSpan.textContent = query;
        this.resultCountSpan.textContent = count;
        this.searchInfo.classList.remove('hidden');
    }

    showLoading(show) {
        if (show) {
            this.hideAllSections();
            this.loadingIndicator.classList.remove('hidden');
        } else {
            this.loadingIndicator.classList.add('hidden');
        }
    }

    showError(message) {
        this.hideAllSections();
        this.resultsContainer.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 40px; color: #e74c3c;">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Reintentar
                </button>
            </div>
        `;
        this.resultsContainer.style.display = 'block';
    }

    hideAllSections() {
        this.loadingIndicator.classList.add('hidden');
        this.searchInfo.classList.add('hidden');
        this.noResults.classList.add('hidden');
        this.resultsContainer.style.display = 'none';
    }

    clearSearch() {
        this.searchInput.value = '';
        this.hideAllSections();
        this.showAllPosts();
        
        // Limpiar el historial de URL
        history.pushState(null, 'Búsqueda Dinámica de Posts', window.location.pathname);
        this.updateBackButton();
    }

    updateBackButton() {
        // Habilitar/deshabilitar botón de atrás basado en el historial
        const hasHistory = window.history.length > 1 && window.location.search !== '';
        this.backButton.disabled = !hasHistory;
    }

    // Método público para realizar búsquedas programáticamente
    search(query) {
        this.searchInput.value = query;
        this.performSearch();
    }

    // Método público para obtener el historial de búsquedas
    getSearchHistory() {
        return [...this.searchHistory];
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dynamicSearch = new DynamicSearch();
});

// Función de utilidad para manejar parámetros de URL al cargar la página
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    
    if (searchParam) {
        // Si hay un parámetro de búsqueda en la URL, realizar la búsqueda
        setTimeout(() => {
            if (window.dynamicSearch) {
                window.dynamicSearch.search(searchParam);
            }
        }, 100);
    }
});

// Exportar para uso en otros archivos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicSearch;
}
