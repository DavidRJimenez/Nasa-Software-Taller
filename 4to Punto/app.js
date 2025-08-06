/**
 * NASA API Explorer - Main Application
 * Coordina todos los módulos y maneja la navegación principal
 */

class NASAApiExplorer {
    constructor() {
        this.currentModule = 'apod';
        this.initializeApp();
    }

    initializeApp() {
        this.setupNavigation();
        this.setupApiKeyManagement();
        this.setupEventListeners();
        this.loadInitialModule();
        this.showWelcomeMessage();
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const modules = document.querySelectorAll('.module');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const moduleId = btn.getAttribute('data-module');
                this.switchModule(moduleId);
            });
        });
    }

    switchModule(moduleId) {
        // Ocultar todos los módulos
        document.querySelectorAll('.module').forEach(module => {
            module.classList.remove('active');
        });

        // Mostrar módulo seleccionado
        const targetModule = document.getElementById(`${moduleId}-module`);
        if (targetModule) {
            targetModule.classList.add('active');
        }

        // Actualizar navegación
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`[data-module="${moduleId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.currentModule = moduleId;

        // Limpiar resultados del módulo anterior y cargar contenido inicial si es necesario
        this.handleModuleSwitch(moduleId);

        // Guardar preferencia del usuario
        localStorage.setItem('nasa_current_module', moduleId);
    }

    handleModuleSwitch(moduleId) {
        switch (moduleId) {
            case 'apod':
                // Cargar APOD del día si no hay contenido
                if (window.apodModule && !document.getElementById('apodResults').innerHTML) {
                    // Solo cargar automáticamente si no hay API key configurada
                    if (window.nasaConfig.getApiKey() === 'DEMO_KEY') {
                        window.apodModule.loadTodaysAPOD();
                    }
                }
                break;
            
            case 'wms':
                // WMS no necesita API key, puede cargar contenido inicial
                if (window.wmsModule && !document.getElementById('wmsResults').innerHTML) {
                    // Auto-cargar una imagen WMS del día anterior
                    setTimeout(() => {
                        if (document.getElementById('wmsDate').value) {
                            window.wmsModule.getWMSImage();
                        }
                    }, 500);
                }
                break;
            
            case 'mars':
                // Limpiar solo si hay contenido muy antiguo
                break;
            
            case 'tech':
                // Tech transfer ya carga contenido inicial automáticamente
                break;
        }
    }

    setupApiKeyManagement() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const saveApiKeyBtn = document.getElementById('saveApiKey');
        const useDemoKeyBtn = document.getElementById('useDemoKey');

        saveApiKeyBtn.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                window.nasaConfig.setApiKey(apiKey);
                this.validateApiKey(apiKey);
            } else {
                window.nasaConfig.showNotification('Por favor ingresa una API Key válida', 'error');
            }
        });

        useDemoKeyBtn.addEventListener('click', () => {
            window.nasaConfig.useDemoKey();
            apiKeyInput.value = 'DEMO_KEY';
        });

        // Enter key en el input de API key
        apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveApiKeyBtn.click();
            }
        });
    }

    async validateApiKey(apiKey) {
        try {
            // Probar la API key con una petición simple a APOD
            const testUrl = window.nasaConfig.buildUrl(window.nasaConfig.BASE_URLS.APOD, {
                count: 1
            });

            const response = await fetch(testUrl);
            
            if (response.ok) {
                window.nasaConfig.showNotification('API Key válida y funcionando correctamente', 'success');
                
                // Si estamos en el módulo APOD, cargar contenido
                if (this.currentModule === 'apod' && window.apodModule) {
                    window.apodModule.loadTodaysAPOD();
                }
            } else if (response.status === 403) {
                window.nasaConfig.showNotification('API Key inválida. Verifica que sea correcta.', 'error');
            } else if (response.status === 429) {
                window.nasaConfig.showNotification('API Key válida pero límite de peticiones excedido', 'warning');
            } else {
                window.nasaConfig.showNotification('No se pudo validar la API Key', 'warning');
            }
        } catch (error) {
            window.nasaConfig.showNotification('Error al validar API Key: ' + error.message, 'error');
        }
    }

    setupEventListeners() {
        // Manejar errores globales
        window.addEventListener('error', (e) => {
            console.error('Error global:', e.error);
        });

        // Manejar errores de fetch no capturados
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promise rejection no manejada:', e.reason);
        });

        // Cerrar modal de error
        const closeErrorBtn = document.getElementById('closeError');
        if (closeErrorBtn) {
            closeErrorBtn.addEventListener('click', () => {
                document.getElementById('errorModal').classList.add('hidden');
            });
        }

        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            // Alt + 1-4 para cambiar entre módulos
            if (e.altKey && !e.ctrlKey && !e.shiftKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchModule('apod');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchModule('wms');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchModule('mars');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchModule('tech');
                        break;
                }
            }
        });
    }

    loadInitialModule() {
        // Cargar módulo guardado o APOD por defecto
        const savedModule = localStorage.getItem('nasa_current_module') || 'apod';
        this.switchModule(savedModule);
    }

    showWelcomeMessage() {
        const hasSeenWelcome = localStorage.getItem('nasa_welcome_seen');
        
        if (!hasSeenWelcome) {
            setTimeout(() => {
                window.nasaConfig.showNotification(
                    '🚀 ¡Bienvenido al NASA API Explorer! Configura tu API Key para comenzar.', 
                    'info'
                );
                localStorage.setItem('nasa_welcome_seen', 'true');
            }, 1500);
        }
    }

    // Métodos de utilidad públicos
    showGlobalError(message) {
        const errorModal = document.getElementById('errorModal');
        const errorMessage = document.getElementById('errorMessage');
        
        if (errorModal && errorMessage) {
            errorMessage.textContent = message;
            errorModal.classList.remove('hidden');
        } else {
            window.nasaConfig.showNotification(message, 'error');
        }
    }

    getCurrentModule() {
        return this.currentModule;
    }

    refreshCurrentModule() {
        const moduleId = this.currentModule;
        
        switch (moduleId) {
            case 'apod':
                if (window.apodModule) {
                    window.apodModule.clearResults();
                    window.apodModule.loadTodaysAPOD();
                }
                break;
            case 'wms':
                if (window.wmsModule) {
                    window.wmsModule.clearResults();
                    window.wmsModule.getWMSImage();
                }
                break;
            case 'mars':
                if (window.marsModule) {
                    window.marsModule.clearResults();
                    window.marsModule.getMarsPhotos();
                }
                break;
            case 'tech':
                if (window.techModule) {
                    window.techModule.clearResults();
                    window.techModule.loadPopularTechnologies();
                }
                break;
        }
    }

    // Método para exportar configuración
    exportConfig() {
        const config = {
            apiKey: window.nasaConfig.getApiKey(),
            currentModule: this.currentModule,
            version: '1.0.0',
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nasa-api-explorer-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        window.nasaConfig.showNotification('Configuración exportada', 'success');
    }

    // Método para importar configuración
    importConfig(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                
                if (config.apiKey) {
                    window.nasaConfig.setApiKey(config.apiKey);
                    document.getElementById('apiKeyInput').value = config.apiKey;
                }
                
                if (config.currentModule) {
                    this.switchModule(config.currentModule);
                }

                window.nasaConfig.showNotification('Configuración importada correctamente', 'success');
            } catch (error) {
                window.nasaConfig.showNotification('Error al importar configuración', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Inicializar la aplicación cuando todo esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que todos los módulos estén cargados
    const checkModules = () => {
        if (window.nasaConfig && 
            window.apodModule && 
            window.wmsModule && 
            window.marsModule && 
            window.techModule) {
            
            // Inicializar aplicación principal
            window.nasaApp = new NASAApiExplorer();
            
            console.log(`
🚀 NASA API Explorer iniciado correctamente!

Módulos cargados:
✅ Config
✅ APOD (Astronomy Picture of the Day)
✅ WMS (Web Map Service)
✅ Mars Rover Photos
✅ Tech Transfer

Atajos de teclado:
• Alt + 1: APOD
• Alt + 2: WMS
• Alt + 3: Mars Rover
• Alt + 4: Tech Transfer

¡Listo para explorar el cosmos! 🌌
            `);
            
        } else {
            // Reintenta en 100ms si no todos los módulos están listos
            setTimeout(checkModules, 100);
        }
    };
    
    checkModules();
});

// Manejar carga de archivos de configuración
document.addEventListener('change', (e) => {
    if (e.target.type === 'file' && e.target.accept === '.json') {
        const file = e.target.files[0];
        if (file && window.nasaApp) {
            window.nasaApp.importConfig(file);
        }
    }
});

// Información para desarrolladores
console.log(`
🛠️  NASA API Explorer - Development Info

Objetos globales disponibles:
• window.nasaApp - Aplicación principal
• window.nasaConfig - Configuración y utilidades
• window.apodModule - Módulo APOD
• window.wmsModule - Módulo WMS
• window.marsModule - Módulo Mars Rover
• window.techModule - Módulo Tech Transfer

Para obtener tu API Key:
https://api.nasa.gov/

Repositorio del proyecto:
https://github.com/nasa/api-docs
`);
