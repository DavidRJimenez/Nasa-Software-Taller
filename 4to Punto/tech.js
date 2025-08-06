/**
 * NASA Tech Transfer Module
 * Maneja la consulta y visualización de patentes tecnológicas de la NASA
 */

class TechTransferModule {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.currentTech = [];
    }

    initializeElements() {
        this.searchInput = document.getElementById('techSearchInput');
        this.limitSelect = document.getElementById('techLimit');
        this.searchBtn = document.getElementById('searchTechBtn');
        this.loadingIndicator = document.getElementById('techLoading');
        this.resultsContainer = document.getElementById('techResults');
    }

    attachEventListeners() {
        this.searchBtn.addEventListener('click', () => this.searchTechnologies());
        
        // Enter key en el input de búsqueda
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchTechnologies();
            }
        });

        // Auto-búsqueda al cambiar límite
        this.limitSelect.addEventListener('change', () => {
            if (this.searchInput.value.trim()) {
                this.searchTechnologies();
            }
        });

        // Búsqueda inicial con término por defecto
        this.loadPopularTechnologies();
    }

    async loadPopularTechnologies() {
        // Cargar algunas tecnologías populares al inicio
        this.searchInput.value = 'space';
        await this.searchTechnologies();
    }

    async searchTechnologies(query = null, limit = null) {
        try {
            this.showLoading(true);
            
            const searchQuery = query || this.searchInput.value.trim();
            const searchLimit = limit || this.limitSelect.value;
            
            if (!searchQuery) {
                throw new Error('Por favor ingresa un término de búsqueda');
            }

            // La NASA Images API no requiere API key
            const params = new URLSearchParams({
                q: searchQuery,
                media_type: 'image',
                page_size: searchLimit
            });

            const url = `${window.nasaConfig.BASE_URLS.TECH_TRANSFER}?${params.toString()}`;

            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Límite de peticiones excedido. Espera un momento e intenta nuevamente.');
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.collection || !data.collection.items || data.collection.items.length === 0) {
                throw new Error(`No se encontraron contenidos para "${searchQuery}". Intenta con otros términos como: space, rocket, satellite, technology.`);
            }

            // Filtrar solo elementos que tengan imágenes y descripciones
            const validTech = data.collection.items.filter(item => 
                item.links && item.links.length > 0 && 
                item.data && item.data[0] && item.data[0].description
            );

            if (validTech.length === 0) {
                throw new Error('No se encontraron contenidos con imágenes disponibles. Intenta con otros términos.');
            }

            this.currentTech = validTech;
            this.displayTechnologies(validTech, searchQuery);
            
        } catch (error) {
            console.error('Error fetching NASA content:', error);
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    displayTechnologies(technologies, searchQuery) {
        this.resultsContainer.innerHTML = '';

        // Header con información de búsqueda
        const headerCard = document.createElement('div');
        headerCard.className = 'result-card tech-header';
        headerCard.innerHTML = `
            <div class="tech-search-info">
                <h2 class="result-title">🔬 Tecnologías NASA</h2>
                <div class="result-meta">
                    <span class="meta-item">🔍 Búsqueda: "${searchQuery}"</span>
                    <span class="meta-item">📊 ${technologies.length} resultados</span>
                    <span class="meta-item">🏛️ Patentes oficiales</span>
                </div>
                <div class="search-suggestions">
                    <h3>Búsquedas populares:</h3>
                    <div class="suggestion-buttons">
                        <button onclick="window.techModule.quickSearch('solar')" class="suggestion-btn">☀️ Solar</button>
                        <button onclick="window.techModule.quickSearch('satellite')" class="suggestion-btn">🛰️ Satellite</button>
                        <button onclick="window.techModule.quickSearch('robotics')" class="suggestion-btn">🤖 Robotics</button>
                        <button onclick="window.techModule.quickSearch('aerospace')" class="suggestion-btn">✈️ Aerospace</button>
                        <button onclick="window.techModule.quickSearch('materials')" class="suggestion-btn">🧪 Materials</button>
                        <button onclick="window.techModule.quickSearch('propulsion')" class="suggestion-btn">🚀 Propulsion</button>
                    </div>
                </div>
            </div>
        `;

        this.resultsContainer.appendChild(headerCard);

        // Grid de tecnologías
        technologies.forEach((tech, index) => {
            const techCard = this.createTechCard(tech, index);
            this.resultsContainer.appendChild(techCard);
        });

        // Scroll suave hacia los resultados
        headerCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    createTechCard(item, index) {
        const techDiv = document.createElement('div');
        techDiv.className = 'result-card tech-card';
        
        // Extraer datos del item de la NASA Images API
        const itemData = item.data[0];
        const title = itemData.title || 'Contenido NASA';
        const description = itemData.description || 'Descripción no disponible';
        const center = itemData.center || 'NASA';
        const dateCreated = itemData.date_created || '';
        const keywords = itemData.keywords || [];
        
        // Limpiar y truncar descripción
        const cleanDescription = this.cleanAndTruncateDescription(description);
        
        // Obtener imagen principal
        const mainImage = this.getBestImage(item.links);
        
        // Obtener enlace a la imagen original
        const imageLink = item.href || '';

        techDiv.innerHTML = `
            <div class="tech-content">
                <div class="tech-image-container">
                    ${mainImage ? 
                        `<img src="${mainImage}" alt="${title}" class="tech-image" loading="lazy" 
                             onclick="window.techModule.openTechModal(${index})" onerror="this.style.display='none'">` : 
                        `<div class="no-image-placeholder">
                            <span>�</span>
                            <p>Sin imagen disponible</p>
                         </div>`
                    }
                </div>
                <div class="tech-info">
                    <h3 class="tech-title">${title}</h3>
                    <div class="result-meta">
                        <span class="meta-item">�️ ${center}</span>
                        <span class="meta-item">� ${this.formatDate(dateCreated)}</span>
                        <span class="meta-item">🖼️ Imagen NASA</span>
                    </div>
                    <div class="tech-description">
                        <p>${cleanDescription}</p>
                    </div>
                    ${keywords.length > 0 ? `
                        <div class="tech-keywords">
                            <strong>Palabras clave:</strong> ${keywords.slice(0, 5).join(', ')}
                        </div>
                    ` : ''}
                    <div class="tech-actions">
                        ${imageLink ? 
                            `<a href="${imageLink}" target="_blank" class="tech-link">📄 Ver Contenido Completo</a>` : 
                            ''
                        }
                        <button onclick="window.techModule.openTechModal(${index})" class="view-details-btn">
                            🔍 Ver Detalles
                        </button>
                        <button onclick="window.techModule.shareTech('${title}', '${imageLink}')" class="share-tech-btn">
                            📤 Compartir
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Efecto de aparición escalonada
        techDiv.style.animationDelay = `${index * 0.1}s`;

        return techDiv;
    }

    openTechModal(techIndex) {
        const item = this.currentTech[techIndex];
        if (!item) return;

        const itemData = item.data[0];
        const title = itemData.title || 'Contenido NASA';
        const description = itemData.description || 'Descripción no disponible';
        const center = itemData.center || 'NASA';
        const dateCreated = itemData.date_created || '';
        const keywords = itemData.keywords || [];
        const photographer = itemData.photographer || '';
        const location = itemData.location || '';
        
        const cleanDescription = this.cleanDescription(description);
        const mainImage = this.getBestImage(item.links);
        const imageLink = item.href || '';

        const modal = document.createElement('div');
        modal.className = 'image-modal tech-modal';
        modal.innerHTML = `
            <div class="image-modal-content tech-modal-content">
                <button class="close-modal">&times;</button>
                <div class="tech-modal-body">
                    ${mainImage ? 
                        `<div class="tech-modal-image">
                            <img src="${mainImage}" alt="${title}" class="modal-image">
                         </div>` : 
                        `<div class="tech-modal-placeholder">
                            <span>�</span>
                            <p>Sin imagen disponible</p>
                         </div>`
                    }
                    <div class="tech-modal-info">
                        <h2>${title}</h2>
                        <div class="tech-modal-meta">
                            <div class="meta-row">
                                <strong>Centro NASA:</strong> ${center}
                            </div>
                            <div class="meta-row">
                                <strong>Fecha:</strong> ${this.formatDate(dateCreated)}
                            </div>
                            ${photographer ? 
                                `<div class="meta-row">
                                    <strong>Fotógrafo:</strong> ${photographer}
                                 </div>` : ''
                            }
                            ${location ? 
                                `<div class="meta-row">
                                    <strong>Ubicación:</strong> ${location}
                                 </div>` : ''
                            }
                            <div class="meta-row">
                                <strong>Tipo:</strong> Contenido NASA
                            </div>
                        </div>
                        <div class="tech-modal-description">
                            <h3>Descripción:</h3>
                            <div class="description-content">${cleanDescription}</div>
                        </div>
                        ${keywords.length > 0 ? 
                            `<div class="tech-modal-keywords">
                                <h3>Palabras Clave:</h3>
                                <div class="keywords-list">
                                    ${keywords.map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                                </div>
                             </div>` : ''
                        }
                        ${imageLink ? 
                            `<div class="tech-modal-links">
                                <h3>Enlaces:</h3>
                                <div class="links-grid">
                                    <a href="${imageLink}" target="_blank" class="tech-modal-link">
                                        🔗 Ver contenido original
                                    </a>
                                </div>
                             </div>` : ''
                        }
                    </div>
                </div>
            </div>
        `;

        this.applyTechModalStyles(modal);
        this.attachTechModalEvents(modal);
        document.body.appendChild(modal);
    }

    quickSearch(term) {
        this.searchInput.value = term;
        this.searchTechnologies(term);
    }

    cleanAndTruncateDescription(description) {
        if (!description) return 'Descripción no disponible.';
        
        const cleaned = window.nasaConfig.cleanHtml(description);
        return window.nasaConfig.truncateText(cleaned, 300);
    }

    cleanDescription(description) {
        if (!description) return 'Descripción no disponible.';
        
        // Limpiar HTML pero mantener saltos de línea básicos
        let cleaned = description.replace(/<[^>]*>/g, '');
        cleaned = cleaned.replace(/&nbsp;/g, ' ');
        cleaned = cleaned.replace(/&amp;/g, '&');
        cleaned = cleaned.replace(/&lt;/g, '<');
        cleaned = cleaned.replace(/&gt;/g, '>');
        cleaned = cleaned.replace(/\s+/g, ' ');
        cleaned = cleaned.trim();
        
        return cleaned || 'Descripción no disponible.';
    }

    getBestImage(links) {
        if (!links || !Array.isArray(links)) return null;
        
        // Buscar imagen en tamaño preferido
        const preferredSizes = ['~medium', '~small', '~large', '~thumb'];
        
        for (const size of preferredSizes) {
            const image = links.find(link => 
                link.href && 
                link.href.includes(size) &&
                (link.href.endsWith('.jpg') || link.href.endsWith('.jpeg') || link.href.endsWith('.png'))
            );
            if (image) return image.href;
        }
        
        // Si no encuentra por tamaño, buscar cualquier imagen
        const anyImage = links.find(link => 
            link.href && 
            (link.href.endsWith('.jpg') || link.href.endsWith('.jpeg') || link.href.endsWith('.png'))
        );
        
        return anyImage ? anyImage.href : null;
    }

    getMainLink(links) {
        if (!links || !Array.isArray(links) || links.length === 0) return null;
        
        // Buscar enlace principal (patente completa)
        const mainLink = links.find(link => 
            link.href && (
                link.href.includes('patent') || 
                link.href.includes('technology') ||
                link.href.includes('nasa.gov')
            )
        );
        
        return mainLink ? mainLink.href : links[0].href;
    }

    getAllLinks(links) {
        if (!links || !Array.isArray(links)) return [];
        
        return links.filter(link => link.href && link.href.startsWith('http'))
                   .slice(0, 5); // Limitar a 5 enlaces
    }

    getLinkIcon(href) {
        if (href.includes('patent')) return '📄';
        if (href.includes('pdf')) return '📋';
        if (href.includes('nasa.gov')) return '🚀';
        if (href.includes('image') || href.includes('photo')) return '🖼️';
        return '🔗';
    }

    applyTechModalStyles(modal) {
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            padding: 20px;
            overflow-y: auto;
        `;

        // Estilos adicionales específicos
        const techModalStyles = document.createElement('style');
        techModalStyles.textContent = `
            .tech-modal-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
                background: var(--deep-space);
                border-radius: 15px;
                padding: 30px;
                overflow-y: auto;
            }
            
            .tech-modal-body {
                display: grid;
                grid-template-columns: 300px 1fr;
                gap: 30px;
                align-items: start;
            }
            
            .tech-modal-image img {
                width: 100%;
                border-radius: 10px;
            }
            
            .tech-modal-placeholder {
                text-align: center;
                padding: 60px 20px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                color: var(--galaxy-cyan);
            }
            
            .tech-modal-placeholder span {
                font-size: 3rem;
                display: block;
                margin-bottom: 15px;
            }
            
            .tech-modal-info h2 {
                color: var(--galaxy-cyan);
                margin-bottom: 20px;
                font-family: 'Orbitron', monospace;
            }
            
            .tech-modal-meta {
                background: rgba(107, 70, 193, 0.1);
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 25px;
            }
            
            .meta-row {
                margin: 10px 0;
                color: white;
            }
            
            .meta-row strong {
                color: var(--cosmic-purple);
            }
            
            .tech-modal-description h3 {
                color: var(--nebula-pink);
                margin-bottom: 15px;
                font-family: 'Orbitron', monospace;
            }
            
            .description-content {
                background: rgba(255, 255, 255, 0.05);
                padding: 20px;
                border-radius: 10px;
                line-height: 1.7;
                margin-bottom: 25px;
                color: rgba(255, 255, 255, 0.9);
            }
            
            .tech-modal-links h3 {
                color: var(--galaxy-cyan);
                margin-bottom: 15px;
                font-family: 'Orbitron', monospace;
            }
            
            .links-grid {
                display: grid;
                gap: 10px;
            }
            
            .tech-modal-link {
                display: block;
                padding: 12px 20px;
                background: linear-gradient(135deg, var(--cosmic-purple), var(--nebula-pink));
                color: white;
                text-decoration: none;
                border-radius: 8px;
                transition: all 0.3s ease;
            }
            
            .tech-modal-link:hover {
                transform: translateX(5px);
                box-shadow: 0 5px 15px rgba(107, 70, 193, 0.4);
            }
            
            @media (max-width: 768px) {
                .tech-modal-body {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                
                .tech-modal-content {
                    max-width: 95%;
                    padding: 20px;
                }
            }
        `;

        document.head.appendChild(techModalStyles);
    }

    attachTechModalEvents(modal) {
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: var(--nasa-red);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            z-index: 2001;
        `;

        closeBtn.addEventListener('click', () => document.body.removeChild(modal));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    shareTech(title, url) {
        const shareData = {
            title: `NASA Tech Transfer - ${title}`,
            text: `Descubre esta tecnología de la NASA: ${title}`,
            url: url || window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else {
            const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                window.nasaConfig.showNotification('Información copiada al portapapeles', 'success');
            }).catch(() => {
                window.nasaConfig.showNotification('No se pudo copiar la información', 'error');
            });
        }
    }

    showLoading(show) {
        if (show) {
            this.loadingIndicator.classList.remove('hidden');
            this.resultsContainer.innerHTML = '';
        } else {
            this.loadingIndicator.classList.add('hidden');
        }
    }

    showError(message) {
        this.resultsContainer.innerHTML = `
            <div class="result-card error-card">
                <h3 style="color: var(--nasa-red); margin-bottom: 15px;">⚠️ Error</h3>
                <p>${message}</p>
                <div class="error-suggestions">
                    <p><strong>Términos sugeridos:</strong></p>
                    <div class="suggestion-buttons">
                        <button onclick="window.techModule.quickSearch('solar')" style="margin: 5px;">☀️ Solar</button>
                        <button onclick="window.techModule.quickSearch('satellite')" style="margin: 5px;">🛰️ Satellite</button>
                        <button onclick="window.techModule.quickSearch('robotics')" style="margin: 5px;">🤖 Robotics</button>
                        <button onclick="window.techModule.quickSearch('aerospace')" style="margin: 5px;">✈️ Aerospace</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Método público para limpiar resultados
    clearResults() {
        this.resultsContainer.innerHTML = '';
        this.currentTech = [];
        this.searchInput.value = '';
    }

    // Métodos auxiliares para procesar datos de la nueva API
    cleanDescription(description) {
        if (!description) return 'Descripción no disponible';
        
        // Limpiar y formatear la descripción
        return description
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }

    formatDate(dateString) {
        if (!dateString) return 'Fecha no disponible';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    getLinkIcon(url) {
        if (url.includes('patent')) return '📄';
        if (url.includes('image') || url.includes('photo')) return '🖼️';
        if (url.includes('video')) return '🎥';
        if (url.includes('audio')) return '🎵';
        return '🔗';
    }
}

// Inicializar módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.techModule = new TechTransferModule();
    
    // Agregar estilos CSS adicionales específicos para Tech Transfer
    const techStyles = document.createElement('style');
    techStyles.textContent = `
        .tech-header {
            border-left: 4px solid var(--cosmic-purple);
        }
        
        .search-suggestions h3 {
            color: var(--cosmic-purple);
            font-family: 'Orbitron', monospace;
            margin: 25px 0 15px 0;
        }
        
        .suggestion-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .suggestion-btn {
            background: linear-gradient(135deg, var(--cosmic-purple), var(--nebula-pink));
            padding: 8px 16px;
            font-size: 0.9rem;
            border-radius: 20px;
        }
        
        .tech-content {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 25px;
            align-items: start;
        }
        
        .tech-image-container {
            position: relative;
        }
        
        .tech-image {
            width: 100%;
            height: 150px;
            object-fit: cover;
            border-radius: 10px;
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        .tech-image:hover {
            transform: scale(1.05);
        }
        
        .no-image-placeholder {
            width: 100%;
            height: 150px;
            background: rgba(107, 70, 193, 0.2);
            border: 2px dashed var(--cosmic-purple);
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--cosmic-purple);
        }
        
        .no-image-placeholder span {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .tech-title {
            color: var(--cosmic-purple);
            margin-bottom: 15px;
            font-family: 'Orbitron', monospace;
            font-size: 1.3rem;
        }
        
        .tech-description {
            margin: 20px 0;
            line-height: 1.6;
        }
        
        .tech-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        
        .tech-link {
            background: linear-gradient(135deg, var(--cosmic-purple), var(--nebula-pink));
            color: white;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 5px;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }
        
        .tech-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(107, 70, 193, 0.4);
        }
        
        .view-details-btn,
        .share-tech-btn {
            background: rgba(107, 70, 193, 0.8);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }
        
        .view-details-btn:hover,
        .share-tech-btn:hover {
            background: var(--cosmic-purple);
            transform: translateY(-1px);
        }
        
        .error-suggestions {
            margin-top: 20px;
            text-align: center;
        }
        
        @media (max-width: 768px) {
            .tech-content {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .tech-actions {
                flex-direction: column;
                align-items: center;
            }
            
            .tech-link,
            .view-details-btn,
            .share-tech-btn {
                width: 100%;
                text-align: center;
            }
            
            .suggestion-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .suggestion-btn {
                width: 200px;
            }
        }
    `;
    
    document.head.appendChild(techStyles);
});

console.log('🔬 Tech Transfer Module loaded successfully');
