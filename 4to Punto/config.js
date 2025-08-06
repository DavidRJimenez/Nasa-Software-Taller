/**
 * Configuración de NASA API Explorer
 * Aquí puedes configurar tu API Key de la NASA
 */

class NASAConfig {
    constructor() {
        // 🔑 COLOCA TU NASA API KEY AQUÍ
        this.DEFAULT_API_KEY = 'ZU8ao0WdvEWElFEdS90VR6haD0WRHpddhywpxBsh'; // Tu NASA API Key
        
        // URLs base de las APIs
        this.BASE_URLS = {
            APOD: 'https://api.nasa.gov/planetary/apod',
            MARS_ROVER: 'https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos',
            TECH_TRANSFER: 'https://images-api.nasa.gov/search',
            WMS_BASE: 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi'
        };

        // Configuraciones por defecto
        this.DEFAULTS = {
            MAX_MARS_PHOTOS: 50,
            MAX_TECH_RESULTS: 20,
            DEFAULT_SOL: 1000,
            WMS_IMAGE_FORMAT: 'image/jpeg',
            WMS_WIDTH: 1024,
            WMS_HEIGHT: 512
        };

        // Capas WMS disponibles con sus descripciones
        this.WMS_LAYERS = {
            'MODIS_Terra_CorrectedReflectance_TrueColor': {
                name: 'Color Real de la Tierra',
                description: 'Imagen satelital en color verdadero mostrando la superficie terrestre tal como la vería el ojo humano desde el espacio.'
            },
            'MODIS_Terra_Land_Surface_Temp_Day': {
                name: 'Temperatura de Superficie Terrestre',
                description: 'Mapa de temperatura de la superficie durante el día, útil para estudios climáticos y ambientales.'
            },
            'MODIS_Terra_Aerosol': {
                name: 'Aerosoles Atmosféricos',
                description: 'Concentración de partículas en suspensión en la atmósfera, incluyendo polvo, humo y contaminación.'
            },
            'MODIS_Terra_Cloud_Fraction_Day': {
                name: 'Cobertura de Nubes',
                description: 'Fracción de nubes presente en la atmósfera durante las horas del día.'
            }
        };

        // Información de cámaras del Mars Rover
        this.MARS_CAMERAS = {
            'FHAZ': 'Front Hazard Avoidance Camera',
            'RHAZ': 'Rear Hazard Avoidance Camera',
            'MAST': 'Mast Camera',
            'CHEMCAM': 'Chemistry and Camera Complex',
            'MAHLI': 'Mars Hand Lens Imager',
            'MARDI': 'Mars Descent Imager',
            'NAVCAM': 'Navigation Camera'
        };

        this.loadApiKey();
    }

    /**
     * Obtiene la API Key actual
     * @returns {string} API Key
     */
    getApiKey() {
        return localStorage.getItem('nasa_api_key') || this.DEFAULT_API_KEY;
    }

    /**
     * Guarda la API Key en localStorage
     * @param {string} apiKey - La API Key a guardar
     */
    setApiKey(apiKey) {
        if (apiKey && apiKey.trim() !== '') {
            localStorage.setItem('nasa_api_key', apiKey.trim());
            this.showNotification('API Key guardada correctamente', 'success');
        } else {
            this.showNotification('Por favor ingresa una API Key válida', 'error');
        }
    }

    /**
     * Carga la API Key guardada al inicializar
     */
    loadApiKey() {
        const savedKey = localStorage.getItem('nasa_api_key');
        if (savedKey) {
            const apiKeyInput = document.getElementById('apiKeyInput');
            if (apiKeyInput) {
                apiKeyInput.value = savedKey;
            }
        }
    }

    /**
     * Usa la DEMO_KEY por defecto
     */
    useDemoKey() {
        localStorage.setItem('nasa_api_key', 'DEMO_KEY');
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput) {
            apiKeyInput.value = 'DEMO_KEY';
        }
        this.showNotification('Usando DEMO_KEY (limitada a 30 requests por hora)', 'warning');
    }

    /**
     * Construye URL con parámetros
     * @param {string} baseUrl - URL base
     * @param {object} params - Parámetros a agregar
     * @returns {string} URL completa
     */
    buildUrl(baseUrl, params = {}) {
        const url = new URL(baseUrl);
        
        // Agregar API key automáticamente
        params.api_key = this.getApiKey();
        
        // Agregar parámetros
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                url.searchParams.append(key, params[key]);
            }
        });

        return url.toString();
    }

    /**
     * Construye URL para WMS (no necesita API key)
     * @param {string} layer - Capa a solicitar
     * @param {string} date - Fecha en formato YYYY-MM-DD
     * @param {object} options - Opciones adicionales
     * @returns {string} URL WMS completa
     */
    buildWmsUrl(layer, date, options = {}) {
        const params = {
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetMap',
            FORMAT: options.format || this.DEFAULTS.WMS_IMAGE_FORMAT,
            TRANSPARENT: 'true',
            LAYERS: layer,
            CRS: 'EPSG:4326',
            STYLES: '',
            WIDTH: options.width || this.DEFAULTS.WMS_WIDTH,
            HEIGHT: options.height || this.DEFAULTS.WMS_HEIGHT,
            BBOX: options.bbox || '-180,-90,180,90',
            TIME: date
        };

        const url = new URL(this.BASE_URLS.WMS_BASE);
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

        return url.toString();
    }

    /**
     * Verifica si la API Key es válida
     * @returns {boolean} True si es válida
     */
    isValidApiKey() {
        const key = this.getApiKey();
        return key && key !== '' && key.length > 10;
    }

    /**
     * Muestra notificaciones al usuario
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo: success, error, warning, info
     */
    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        // Agregar al body
        document.body.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Formatea fecha para las APIs
     * @param {Date} date - Fecha a formatear
     * @returns {string} Fecha en formato YYYY-MM-DD
     */
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    /**
     * Obtiene fecha aleatoria para APOD (desde 1995-06-16)
     * @returns {string} Fecha aleatoria en formato YYYY-MM-DD
     */
    getRandomApodDate() {
        const start = new Date('1995-06-16'); // Primera fecha APOD
        const end = new Date();
        const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
        return this.formatDate(new Date(randomTime));
    }

    /**
     * Obtiene sol aleatorio para Mars Rover
     * @returns {number} Número de sol aleatorio
     */
    getRandomSol() {
        return Math.floor(Math.random() * 3000) + 1; // Soles 1-3000
    }

    /**
     * Limpia HTML de texto
     * @param {string} html - Texto con HTML
     * @returns {string} Texto limpio
     */
    cleanHtml(html) {
        if (!html) return '';
        
        // Crear elemento temporal para limpiar HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Obtener solo el texto
        return temp.textContent || temp.innerText || '';
    }

    /**
     * Trunca texto a longitud específica
     * @param {string} text - Texto a truncar
     * @param {number} length - Longitud máxima
     * @returns {string} Texto truncado
     */
    truncateText(text, length = 200) {
        if (!text || text.length <= length) return text;
        return text.substring(0, length) + '...';
    }
}

// Inicializar configuración global
window.nasaConfig = new NASAConfig();

// Instrucciones para obtener API Key
console.log(`
🚀 NASA API Explorer - Configuración

Para obtener tu API Key gratuita:
1. Visita: https://api.nasa.gov/
2. Completa el formulario de registro
3. Copia tu API Key
4. Pégala en el campo correspondiente o modifica config.js

Nota: La DEMO_KEY tiene límite de 30 requests por hora.
Con tu propia key tendrás 1000 requests por hora.
`);
