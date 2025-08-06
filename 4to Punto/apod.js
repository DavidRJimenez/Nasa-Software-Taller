/**
 * NASA APOD (Astronomy Picture of the Day) Module
 * Maneja la consulta y visualización de imágenes astronómicas
 */

class APODModule {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.setMaxDate();
    }

    initializeElements() {
        this.dateInput = document.getElementById('apodDate');
        this.getApodBtn = document.getElementById('getApodBtn');
        this.getRandomBtn = document.getElementById('getRandomApodBtn');
        this.loadingIndicator = document.getElementById('apodLoading');
        this.resultsContainer = document.getElementById('apodResults');
    }

    attachEventListeners() {
        this.getApodBtn.addEventListener('click', () => this.getAPOD());
        this.getRandomBtn.addEventListener('click', () => this.getRandomAPOD());
        
        // Enter key en el input de fecha
        this.dateInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.getAPOD();
            }
        });

        // Cargar APOD del día actual al cargar el módulo
        this.dateInput.addEventListener('change', () => {
            if (this.dateInput.value) {
                this.getAPOD();
            }
        });
    }

    setMaxDate() {
        // Establecer fecha máxima como hoy
        const today = new Date().toISOString().split('T')[0];
        this.dateInput.max = today;
        this.dateInput.value = today; // Establecer fecha de hoy por defecto
    }

    async getAPOD(date = null) {
        try {
            this.showLoading(true);
            
            const selectedDate = date || this.dateInput.value;
            if (!selectedDate) {
                throw new Error('Por favor selecciona una fecha');
            }

            // Validar que la fecha no sea futura
            const selected = new Date(selectedDate);
            const today = new Date();
            if (selected > today) {
                throw new Error('No se puede seleccionar una fecha futura');
            }

            // Validar que la fecha no sea anterior al inicio de APOD
            const firstAPOD = new Date('1995-06-16');
            if (selected < firstAPOD) {
                throw new Error('APOD comenzó el 16 de junio de 1995');
            }

            const url = window.nasaConfig.buildUrl(window.nasaConfig.BASE_URLS.APOD, {
                date: selectedDate,
                hd: true
            });

            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Límite de peticiones excedido. Espera un momento e intenta nuevamente.');
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Filtrar solo imágenes (no videos)
            if (data.media_type !== 'image') {
                throw new Error('Este día no tiene una imagen disponible, solo video. Intenta otra fecha.');
            }

            this.displayAPOD(data);
            
        } catch (error) {
            console.error('Error fetching APOD:', error);
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async getRandomAPOD() {
        const randomDate = window.nasaConfig.getRandomApodDate();
        this.dateInput.value = randomDate;
        await this.getAPOD(randomDate);
    }

    displayAPOD(data) {
        this.resultsContainer.innerHTML = '';

        const apodCard = document.createElement('div');
        apodCard.className = 'result-card';
        apodCard.innerHTML = `
            <div class="apod-content">
                <h2 class="result-title">${data.title}</h2>
                <div class="result-meta">
                    <span class="meta-item">📅 ${this.formatDate(data.date)}</span>
                    <span class="meta-item">📸 ${data.media_type === 'image' ? 'Imagen' : 'Video'}</span>
                    ${data.copyright ? `<span class="meta-item">©️ ${data.copyright}</span>` : ''}
                </div>
                <img src="${data.url}" alt="${data.title}" class="result-image apod-image" loading="lazy">
                <div class="apod-explanation">
                    <h3>Explicación Científica:</h3>
                    <p class="result-description">${data.explanation}</p>
                </div>
                ${data.hdurl ? `
                    <div class="apod-actions">
                        <a href="${data.hdurl}" target="_blank" class="hd-link">
                            🔍 Ver en Alta Resolución
                        </a>
                    </div>
                ` : ''}
            </div>
        `;

        // Agregar event listener para zoom de imagen
        const img = apodCard.querySelector('.apod-image');
        img.addEventListener('click', () => this.openImageModal(data));

        this.resultsContainer.appendChild(apodCard);

        // Scroll suave hacia los resultados
        apodCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    openImageModal(data) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <button class="close-modal">&times;</button>
                <img src="${data.hdurl || data.url}" alt="${data.title}" class="modal-image">
                <div class="modal-info">
                    <h3>${data.title}</h3>
                    <p><strong>Fecha:</strong> ${this.formatDate(data.date)}</p>
                    ${data.copyright ? `<p><strong>Copyright:</strong> ${data.copyright}</p>` : ''}
                </div>
            </div>
        `;

        // Estilos para el modal
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
        `;

        const modalContent = modal.querySelector('.image-modal-content');
        modalContent.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
            display: flex;
            flex-direction: column;
            align-items: center;
        `;

        const modalImage = modal.querySelector('.modal-image');
        modalImage.style.cssText = `
            max-width: 100%;
            max-height: 70vh;
            object-fit: contain;
            border-radius: 10px;
        `;

        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.style.cssText = `
            position: absolute;
            top: -40px;
            right: -10px;
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

        const modalInfo = modal.querySelector('.modal-info');
        modalInfo.style.cssText = `
            color: white;
            text-align: center;
            margin-top: 20px;
            max-width: 600px;
        `;

        // Event listeners para cerrar modal
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

        document.body.appendChild(modal);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                <button onclick="window.apodModule.getRandomAPOD()" style="margin-top: 15px;">
                    🎲 Intentar con fecha aleatoria
                </button>
            </div>
        `;
    }

    // Método público para cargar APOD del día
    loadTodaysAPOD() {
        const today = new Date().toISOString().split('T')[0];
        this.dateInput.value = today;
        this.getAPOD(today);
    }

    // Método público para limpiar resultados
    clearResults() {
        this.resultsContainer.innerHTML = '';
        this.dateInput.value = '';
    }
}

// Inicializar módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.apodModule = new APODModule();
    
    // Agregar estilos CSS adicionales para el modal
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
        .apod-explanation h3 {
            color: var(--galaxy-cyan);
            margin: 25px 0 15px 0;
            font-family: 'Orbitron', monospace;
        }
        
        .apod-actions {
            margin-top: 25px;
            text-align: center;
        }
        
        .hd-link {
            display: inline-block;
            padding: 12px 25px;
            background: linear-gradient(135deg, var(--cosmic-purple), var(--nebula-pink));
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .hd-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(107, 70, 193, 0.4);
        }
        
        .apod-image {
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        .apod-image:hover {
            transform: scale(1.02);
        }
        
        .error-card {
            text-align: center;
            border-color: var(--nasa-red);
        }
        
        @media (max-width: 768px) {
            .image-modal-content {
                max-width: 95% !important;
                max-height: 95% !important;
            }
            
            .modal-image {
                max-height: 60vh !important;
            }
        }
    `;
    
    document.head.appendChild(modalStyles);
});

console.log('🌌 APOD Module loaded successfully');
