/**
 * NASA WMS (Web Map Service) Module
 * Maneja la construcción de URLs y visualización de capas satelitales
 */

class WMSModule {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.setMaxDate();
    }

    initializeElements() {
        this.layerSelect = document.getElementById('layerType');
        this.dateInput = document.getElementById('wmsDate');
        this.getWmsBtn = document.getElementById('getWmsBtn');
        this.loadingIndicator = document.getElementById('wmsLoading');
        this.resultsContainer = document.getElementById('wmsResults');
    }

    attachEventListeners() {
        this.getWmsBtn.addEventListener('click', () => this.getWMSImage());
        
        // Auto-actualizar cuando cambie la capa
        this.layerSelect.addEventListener('change', () => {
            if (this.dateInput.value) {
                this.getWMSImage();
            }
        });

        // Enter key en el input de fecha
        this.dateInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.getWMSImage();
            }
        });

        // Auto-actualizar cuando cambie la fecha
        this.dateInput.addEventListener('change', () => {
            if (this.dateInput.value) {
                this.getWMSImage();
            }
        });
    }

    setMaxDate() {
        // Las imágenes WMS pueden tener algunos días de retraso
        const today = new Date();
        today.setDate(today.getDate() - 1); // Ayer para mayor disponibilidad
        const maxDate = today.toISOString().split('T')[0];
        this.dateInput.max = maxDate;
        this.dateInput.value = maxDate;
    }

    async getWMSImage() {
        try {
            this.showLoading(true);
            
            const selectedLayer = this.layerSelect.value;
            const selectedDate = this.dateInput.value;
            
            if (!selectedDate) {
                throw new Error('Por favor selecciona una fecha');
            }

            // Validar fecha
            const selected = new Date(selectedDate);
            const today = new Date();
            if (selected > today) {
                throw new Error('No se puede seleccionar una fecha futura');
            }

            // Construir URL WMS manualmente
            const wmsUrl = this.buildWMSUrl(selectedLayer, selectedDate);
            
            // Verificar que la imagen se puede cargar
            await this.validateImageUrl(wmsUrl);
            
            const layerInfo = window.nasaConfig.WMS_LAYERS[selectedLayer];
            
            this.displayWMSImage({
                url: wmsUrl,
                layer: selectedLayer,
                layerName: layerInfo.name,
                description: layerInfo.description,
                date: selectedDate
            });
            
        } catch (error) {
            console.error('Error fetching WMS image:', error);
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    buildWMSUrl(layer, date) {
        // Construcción manual de URL WMS según especificaciones
        const baseUrl = window.nasaConfig.BASE_URLS.WMS_BASE;
        const params = new URLSearchParams({
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetMap',
            FORMAT: 'image/jpeg',
            TRANSPARENT: 'false',
            LAYERS: layer,
            CRS: 'EPSG:4326',
            STYLES: '',
            WIDTH: '1024',
            HEIGHT: '512',
            BBOX: '-90,-180,90,180', // Mundo completo
            TIME: date
        });

        return `${baseUrl}?${params.toString()}`;
    }

    async validateImageUrl(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                // Verificar que no sea una imagen de error (muy pequeña)
                if (img.width < 100 || img.height < 100) {
                    reject(new Error('No hay datos disponibles para esta fecha y capa'));
                } else {
                    resolve(true);
                }
            };
            
            img.onerror = () => {
                reject(new Error('No se pudo cargar la imagen satelital. Intenta con otra fecha.'));
            };
            
            // Timeout de 15 segundos
            setTimeout(() => {
                reject(new Error('Tiempo de espera agotado. El servidor puede estar ocupado.'));
            }, 15000);
            
            img.src = url;
        });
    }

    displayWMSImage(data) {
        this.resultsContainer.innerHTML = '';

        const wmsCard = document.createElement('div');
        wmsCard.className = 'result-card';
        wmsCard.innerHTML = `
            <div class="wms-content">
                <h2 class="result-title">${data.layerName}</h2>
                <div class="result-meta">
                    <span class="meta-item">📅 ${this.formatDate(data.date)}</span>
                    <span class="meta-item">🛰️ MODIS Terra</span>
                    <span class="meta-item">🌍 Vista Global</span>
                </div>
                <div class="wms-image-container">
                    <img src="${data.url}" alt="${data.layerName}" class="result-image wms-image" loading="lazy">
                    <div class="image-overlay">
                        <button class="zoom-btn" onclick="window.wmsModule.openImageModal('${data.url}', '${data.layerName}', '${data.date}')">
                            🔍 Ampliar
                        </button>
                        <button class="download-btn" onclick="window.wmsModule.downloadImage('${data.url}', '${data.layerName}_${data.date}')">
                            💾 Descargar
                        </button>
                    </div>
                </div>
                <div class="wms-description">
                    <h3>Descripción de la Capa:</h3>
                    <p class="result-description">${data.description}</p>
                </div>
                <div class="wms-technical">
                    <h4>Información Técnica:</h4>
                    <ul>
                        <li><strong>Satélite:</strong> Terra (EOS AM-1)</li>
                        <li><strong>Instrumento:</strong> MODIS (Moderate Resolution Imaging Spectroradiometer)</li>
                        <li><strong>Resolución:</strong> 250m - 1km dependiendo de la banda</li>
                        <li><strong>Cobertura:</strong> Global</li>
                        <li><strong>Proyección:</strong> EPSG:4326 (WGS84)</li>
                        <li><strong>Formato:</strong> JPEG</li>
                    </ul>
                </div>
                <div class="wms-actions">
                    <button onclick="window.wmsModule.getRandomDate()" class="action-btn">
                        🎲 Fecha Aleatoria
                    </button>
                    <button onclick="window.wmsModule.compareWithPreviousDay()" class="action-btn">
                        ⏮️ Día Anterior
                    </button>
                    <button onclick="window.wmsModule.shareImage('${data.url}', '${data.layerName}')" class="action-btn">
                        📤 Compartir
                    </button>
                </div>
            </div>
        `;

        this.resultsContainer.appendChild(wmsCard);

        // Scroll suave hacia los resultados
        wmsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    openImageModal(imageUrl, title, date) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <button class="close-modal">&times;</button>
                <img src="${imageUrl}" alt="${title}" class="modal-image">
                <div class="modal-info">
                    <h3>${title}</h3>
                    <p><strong>Fecha:</strong> ${this.formatDate(date)}</p>
                    <p><strong>Fuente:</strong> NASA GIBS WMS</p>
                </div>
            </div>
        `;

        // Aplicar estilos similares al modal de APOD
        this.applyModalStyles(modal);

        // Event listeners para cerrar modal
        const closeBtn = modal.querySelector('.close-modal');
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

    applyModalStyles(modal) {
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
            max-height: 80vh;
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
    }

    downloadImage(imageUrl, filename) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${filename}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.nasaConfig.showNotification('Descarga iniciada', 'success');
    }

    shareImage(imageUrl, title) {
        if (navigator.share) {
            navigator.share({
                title: `NASA - ${title}`,
                text: `Imagen satelital de la NASA: ${title}`,
                url: imageUrl
            });
        } else {
            // Fallback: copiar URL al clipboard
            navigator.clipboard.writeText(imageUrl).then(() => {
                window.nasaConfig.showNotification('URL copiada al portapapeles', 'success');
            }).catch(() => {
                window.nasaConfig.showNotification('No se pudo copiar la URL', 'error');
            });
        }
    }

    getRandomDate() {
        // Fecha aleatoria en los últimos 30 días
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        const randomTime = thirtyDaysAgo.getTime() + Math.random() * (today.getTime() - thirtyDaysAgo.getTime());
        const randomDate = new Date(randomTime).toISOString().split('T')[0];
        
        this.dateInput.value = randomDate;
        this.getWMSImage();
    }

    compareWithPreviousDay() {
        if (this.dateInput.value) {
            const currentDate = new Date(this.dateInput.value);
            currentDate.setDate(currentDate.getDate() - 1);
            const previousDay = currentDate.toISOString().split('T')[0];
            
            this.dateInput.value = previousDay;
            this.getWMSImage();
        }
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
                <div class="error-actions">
                    <button onclick="window.wmsModule.getRandomDate()" style="margin-top: 15px; margin-right: 10px;">
                        🎲 Fecha Aleatoria
                    </button>
                    <button onclick="window.wmsModule.compareWithPreviousDay()" style="margin-top: 15px;">
                        ⏮️ Día Anterior
                    </button>
                </div>
            </div>
        `;
    }

    // Método público para limpiar resultados
    clearResults() {
        this.resultsContainer.innerHTML = '';
    }
}

// Inicializar módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.wmsModule = new WMSModule();
    
    // Agregar estilos CSS adicionales
    const wmsStyles = document.createElement('style');
    wmsStyles.textContent = `
        .wms-image-container {
            position: relative;
            overflow: hidden;
            border-radius: 10px;
            margin: 20px 0;
        }
        
        .wms-image {
            width: 100%;
            transition: transform 0.3s ease;
        }
        
        .image-overlay {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 10px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .wms-image-container:hover .image-overlay {
            opacity: 1;
        }
        
        .zoom-btn, .download-btn {
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9rem;
        }
        
        .wms-description h3,
        .wms-technical h4 {
            color: var(--galaxy-cyan);
            margin: 25px 0 15px 0;
            font-family: 'Orbitron', monospace;
        }
        
        .wms-technical ul {
            list-style: none;
            padding: 0;
        }
        
        .wms-technical li {
            background: rgba(6, 182, 212, 0.1);
            margin: 8px 0;
            padding: 10px 15px;
            border-radius: 8px;
            border-left: 3px solid var(--galaxy-cyan);
        }
        
        .wms-actions {
            margin-top: 25px;
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .action-btn {
            background: linear-gradient(135deg, var(--cosmic-purple), var(--nebula-pink));
            padding: 10px 20px;
            font-size: 0.9rem;
        }
        
        .error-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        @media (max-width: 768px) {
            .wms-actions {
                flex-direction: column;
                align-items: center;
            }
            
            .action-btn {
                width: 200px;
            }
            
            .image-overlay {
                opacity: 1;
                position: static;
                margin-top: 10px;
                justify-content: center;
            }
        }
    `;
    
    document.head.appendChild(wmsStyles);
});

console.log('🛰️ WMS Module loaded successfully');
