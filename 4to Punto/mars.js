/**
 * NASA Mars Rover Photos Module
 * Maneja la obtención y visualización de fotografías del rover Curiosity
 */

class MarsRoverModule {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.currentPhotos = [];
    }

    initializeElements() {
        this.solInput = document.getElementById('solInput');
        this.cameraSelect = document.getElementById('cameraSelect');
        this.getMarsBtn = document.getElementById('getMarsBtn');
        this.getRandomSolBtn = document.getElementById('getRandomSolBtn');
        this.loadingIndicator = document.getElementById('marsLoading');
        this.resultsContainer = document.getElementById('marsResults');
    }

    attachEventListeners() {
        this.getMarsBtn.addEventListener('click', () => this.getMarsPhotos());
        this.getRandomSolBtn.addEventListener('click', () => this.getRandomSolPhotos());
        
        // Enter key en el input de sol
        this.solInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.getMarsPhotos();
            }
        });

        // Auto-actualizar cuando cambie la cámara
        this.cameraSelect.addEventListener('change', () => {
            if (this.solInput.value) {
                this.getMarsPhotos();
            }
        });
    }

    async getMarsPhotos(sol = null) {
        try {
            this.showLoading(true);
            
            const selectedSol = sol || this.solInput.value;
            const selectedCamera = this.cameraSelect.value;
            
            if (!selectedSol || selectedSol < 1) {
                throw new Error('Por favor ingresa un sol válido (día marciano)');
            }

            if (selectedSol > 4000) {
                throw new Error('El sol no puede ser mayor a 4000');
            }

            // Construir parámetros para la API
            const params = {
                sol: selectedSol,
                page: 1
            };

            // Agregar cámara si está seleccionada
            if (selectedCamera) {
                params.camera = selectedCamera;
            }

            const url = window.nasaConfig.buildUrl(window.nasaConfig.BASE_URLS.MARS_ROVER, params);

            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Límite de peticiones excedido. Espera un momento e intenta nuevamente.');
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.photos || data.photos.length === 0) {
                throw new Error(`No se encontraron fotos para el sol ${selectedSol}${selectedCamera ? ` con la cámara ${selectedCamera}` : ''}. Intenta con otro sol o cámara.`);
            }

            // Limitar número de fotos para mejor rendimiento
            const maxPhotos = window.nasaConfig.DEFAULTS.MAX_MARS_PHOTOS;
            this.currentPhotos = data.photos.slice(0, maxPhotos);
            
            this.displayMarsPhotos(this.currentPhotos, selectedSol);
            
        } catch (error) {
            console.error('Error fetching Mars photos:', error);
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async getRandomSolPhotos() {
        const randomSol = window.nasaConfig.getRandomSol();
        this.solInput.value = randomSol;
        await this.getMarsPhotos(randomSol);
    }

    displayMarsPhotos(photos, sol) {
        this.resultsContainer.innerHTML = '';

        // Header con información del sol
        const headerCard = document.createElement('div');
        headerCard.className = 'result-card mars-header';
        headerCard.innerHTML = `
            <div class="mars-sol-info">
                <h2 class="result-title">🔴 Fotos de Marte - Sol ${sol}</h2>
                <div class="result-meta">
                    <span class="meta-item">📅 Sol: ${sol} (Día marciano)</span>
                    <span class="meta-item">🚗 Rover: ${photos[0].rover.name}</span>
                    <span class="meta-item">📷 ${photos.length} fotos encontradas</span>
                    <span class="meta-item">🎯 Estado: ${photos[0].rover.status}</span>
                </div>
                <div class="rover-mission-info">
                    <h3>Información de la Misión:</h3>
                    <div class="mission-details">
                        <div class="mission-stat">
                            <strong>Fecha de aterrizaje:</strong> ${this.formatDate(photos[0].rover.landing_date)}
                        </div>
                        <div class="mission-stat">
                            <strong>Fecha de lanzamiento:</strong> ${this.formatDate(photos[0].rover.launch_date)}
                        </div>
                        <div class="mission-stat">
                            <strong>Sol máximo:</strong> ${photos[0].rover.max_sol}
                        </div>
                        <div class="mission-stat">
                            <strong>Última foto:</strong> ${this.formatDate(photos[0].rover.max_date)}
                        </div>
                    </div>
                </div>
                <div class="mars-actions">
                    <button onclick="window.marsModule.filterByCamera('MAST')" class="filter-btn">📸 Mast Camera</button>
                    <button onclick="window.marsModule.filterByCamera('FHAZ')" class="filter-btn">⚠️ Front Hazard</button>
                    <button onclick="window.marsModule.filterByCamera('NAVCAM')" class="filter-btn">🧭 Navigation</button>
                    <button onclick="window.marsModule.showAllPhotos()" class="filter-btn">🌟 Todas</button>
                </div>
            </div>
        `;

        this.resultsContainer.appendChild(headerCard);

        // Grid de fotos
        const photosGrid = document.createElement('div');
        photosGrid.className = 'mars-grid';
        photosGrid.id = 'marsPhotosGrid';

        photos.forEach((photo, index) => {
            const photoCard = this.createPhotoCard(photo, index);
            photosGrid.appendChild(photoCard);
        });

        this.resultsContainer.appendChild(photosGrid);

        // Scroll suave hacia los resultados
        headerCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    createPhotoCard(photo, index) {
        const photoDiv = document.createElement('div');
        photoDiv.className = 'mars-photo';
        photoDiv.setAttribute('data-camera', photo.camera.name);
        
        photoDiv.innerHTML = `
            <img src="${photo.img_src}" alt="Mars photo ${photo.id}" loading="lazy" 
                 onclick="window.marsModule.openPhotoModal(${index})">
            <div class="mars-photo-info">
                <h4>📷 ${photo.camera.full_name}</h4>
                <div class="photo-details">
                    <p><strong>ID:</strong> ${photo.id}</p>
                    <p><strong>Cámara:</strong> ${photo.camera.name}</p>
                    <p><strong>Fecha terrestre:</strong> ${this.formatDate(photo.earth_date)}</p>
                    <p><strong>Sol:</strong> ${photo.sol}</p>
                </div>
                <div class="photo-actions">
                    <button onclick="window.marsModule.downloadPhoto('${photo.img_src}', 'mars_${photo.rover.name}_sol${photo.sol}_${photo.id}')" 
                            class="download-photo-btn">💾 Descargar</button>
                    <button onclick="window.marsModule.sharePhoto('${photo.img_src}', '${photo.camera.full_name}')" 
                            class="share-photo-btn">📤 Compartir</button>
                </div>
            </div>
        `;

        // Efecto de aparición escalonada
        photoDiv.style.animationDelay = `${index * 0.1}s`;

        return photoDiv;
    }

    openPhotoModal(photoIndex) {
        const photo = this.currentPhotos[photoIndex];
        if (!photo) return;

        const modal = document.createElement('div');
        modal.className = 'image-modal mars-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <button class="close-modal">&times;</button>
                <div class="modal-navigation">
                    <button class="nav-btn prev-btn" onclick="window.marsModule.navigatePhoto(${photoIndex - 1})"
                            ${photoIndex === 0 ? 'disabled' : ''}>‹ Anterior</button>
                    <span class="photo-counter">${photoIndex + 1} de ${this.currentPhotos.length}</span>
                    <button class="nav-btn next-btn" onclick="window.marsModule.navigatePhoto(${photoIndex + 1})"
                            ${photoIndex === this.currentPhotos.length - 1 ? 'disabled' : ''}>Siguiente ›</button>
                </div>
                <img src="${photo.img_src}" alt="Mars photo ${photo.id}" class="modal-image">
                <div class="modal-info mars-modal-info">
                    <h3>📷 ${photo.camera.full_name}</h3>
                    <div class="modal-details">
                        <p><strong>ID de foto:</strong> ${photo.id}</p>
                        <p><strong>Rover:</strong> ${photo.rover.name}</p>
                        <p><strong>Sol (día marciano):</strong> ${photo.sol}</p>
                        <p><strong>Fecha en la Tierra:</strong> ${this.formatDate(photo.earth_date)}</p>
                        <p><strong>Cámara:</strong> ${photo.camera.name} - ${photo.camera.full_name}</p>
                        <p><strong>Estado del rover:</strong> ${photo.rover.status}</p>
                    </div>
                    <div class="modal-actions">
                        <button onclick="window.marsModule.downloadPhoto('${photo.img_src}', 'mars_${photo.rover.name}_sol${photo.sol}_${photo.id}')" 
                                class="modal-action-btn">💾 Descargar HD</button>
                        <button onclick="window.marsModule.sharePhoto('${photo.img_src}', '${photo.camera.full_name}')" 
                                class="modal-action-btn">📤 Compartir</button>
                    </div>
                </div>
            </div>
        `;

        this.applyMarsModalStyles(modal);
        this.attachModalEvents(modal);
        document.body.appendChild(modal);
    }

    navigatePhoto(newIndex) {
        if (newIndex >= 0 && newIndex < this.currentPhotos.length) {
            // Cerrar modal actual
            const currentModal = document.querySelector('.mars-modal');
            if (currentModal) {
                document.body.removeChild(currentModal);
            }
            // Abrir nueva foto
            this.openPhotoModal(newIndex);
        }
    }

    applyMarsModalStyles(modal) {
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
            max-width: 95%;
            max-height: 95%;
            display: flex;
            flex-direction: column;
            align-items: center;
        `;

        const modalImage = modal.querySelector('.modal-image');
        modalImage.style.cssText = `
            max-width: 100%;
            max-height: 60vh;
            object-fit: contain;
            border-radius: 10px;
        `;

        // Estilos adicionales específicos de Mars
        const marsModalStyles = document.createElement('style');
        marsModalStyles.textContent = `
            .modal-navigation {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 20px;
                color: white;
            }
            
            .nav-btn {
                background: var(--mars-orange);
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            }
            
            .nav-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .photo-counter {
                font-weight: bold;
                font-size: 1.1rem;
            }
            
            .mars-modal-info {
                color: white;
                text-align: center;
                margin-top: 20px;
                max-width: 600px;
            }
            
            .modal-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 10px;
                margin: 20px 0;
                text-align: left;
            }
            
            .modal-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 20px;
            }
            
            .modal-action-btn {
                background: linear-gradient(135deg, var(--mars-orange), var(--nasa-red));
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
            }
        `;

        document.head.appendChild(marsModalStyles);
    }

    attachModalEvents(modal) {
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
            if (e.key === 'ArrowLeft') {
                const prevBtn = modal.querySelector('.prev-btn');
                if (prevBtn && !prevBtn.disabled) prevBtn.click();
            }
            if (e.key === 'ArrowRight') {
                const nextBtn = modal.querySelector('.next-btn');
                if (nextBtn && !nextBtn.disabled) nextBtn.click();
            }
        });
    }

    filterByCamera(cameraName) {
        const grid = document.getElementById('marsPhotosGrid');
        if (!grid) return;

        const photos = grid.querySelectorAll('.mars-photo');
        photos.forEach(photo => {
            if (cameraName === 'ALL' || photo.getAttribute('data-camera') === cameraName) {
                photo.style.display = 'block';
            } else {
                photo.style.display = 'none';
            }
        });

        // Actualizar selector
        this.cameraSelect.value = cameraName === 'ALL' ? '' : cameraName;
    }

    showAllPhotos() {
        this.filterByCamera('ALL');
    }

    downloadPhoto(imageUrl, filename) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${filename}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.nasaConfig.showNotification('Descarga de foto iniciada', 'success');
    }

    sharePhoto(imageUrl, cameraName) {
        if (navigator.share) {
            navigator.share({
                title: `Foto de Marte - ${cameraName}`,
                text: `Foto capturada por el rover Curiosity en Marte usando ${cameraName}`,
                url: imageUrl
            });
        } else {
            navigator.clipboard.writeText(imageUrl).then(() => {
                window.nasaConfig.showNotification('URL de la foto copiada al portapapeles', 'success');
            }).catch(() => {
                window.nasaConfig.showNotification('No se pudo copiar la URL', 'error');
            });
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
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
                <div class="error-actions">
                    <button onclick="window.marsModule.getRandomSolPhotos()" style="margin-top: 15px; margin-right: 10px;">
                        🎲 Sol Aleatorio
                    </button>
                    <button onclick="window.marsModule.solInput.value = '1000'; window.marsModule.getMarsPhotos()" style="margin-top: 15px;">
                        🔄 Sol 1000
                    </button>
                </div>
            </div>
        `;
    }

    // Método público para limpiar resultados
    clearResults() {
        this.resultsContainer.innerHTML = '';
        this.currentPhotos = [];
    }
}

// Inicializar módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.marsModule = new MarsRoverModule();
    
    // Agregar estilos CSS adicionales específicos para Mars
    const marsStyles = document.createElement('style');
    marsStyles.textContent = `
        .mars-header {
            border-left: 4px solid var(--mars-orange);
        }
        
        .rover-mission-info h3 {
            color: var(--mars-orange);
            font-family: 'Orbitron', monospace;
            margin: 25px 0 15px 0;
        }
        
        .mission-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .mission-stat {
            background: rgba(255, 107, 53, 0.1);
            padding: 15px;
            border-radius: 8px;
            border-left: 3px solid var(--mars-orange);
        }
        
        .mars-actions {
            margin-top: 25px;
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            background: linear-gradient(135deg, var(--mars-orange), var(--nasa-red));
            padding: 8px 16px;
            font-size: 0.9rem;
        }
        
        .mars-grid {
            animation: fadeInUp 0.6s ease-out;
        }
        
        .mars-photo {
            animation: photoAppear 0.5s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
        }
        
        @keyframes photoAppear {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .mars-photo img {
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        .mars-photo img:hover {
            transform: scale(1.05);
        }
        
        .mars-photo-info h4 {
            color: var(--mars-orange);
            font-size: 1rem;
            margin-bottom: 10px;
        }
        
        .photo-details p {
            margin: 5px 0;
            font-size: 0.9rem;
        }
        
        .photo-actions {
            display: flex;
            gap: 8px;
            margin-top: 15px;
        }
        
        .download-photo-btn,
        .share-photo-btn {
            background: rgba(255, 107, 53, 0.8);
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.8rem;
            flex: 1;
        }
        
        .download-photo-btn:hover,
        .share-photo-btn:hover {
            background: var(--mars-orange);
        }
        
        @media (max-width: 768px) {
            .mars-actions {
                flex-direction: column;
                align-items: center;
            }
            
            .filter-btn {
                width: 200px;
            }
            
            .mission-details {
                grid-template-columns: 1fr;
            }
            
            .modal-details {
                grid-template-columns: 1fr;
            }
            
            .modal-actions {
                flex-direction: column;
                align-items: center;
            }
            
            .modal-action-btn {
                width: 200px;
            }
        }
    `;
    
    document.head.appendChild(marsStyles);
});

console.log('🔴 Mars Rover Module loaded successfully');
