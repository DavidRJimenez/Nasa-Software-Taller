# 🚀 Arquitectura de Software - Taller de APIs Web

Este repositorio contiene la implementación de dos proyectos web que demuestran el uso de diversas APIs modernas del navegador y servicios externos.

## 📁 Estructura del Proyecto

```
Arquitectura_Sof/
├── 3er Punto/           # Búsqueda Dinámica con Historial
│   ├── Index.html
│   ├── styles.css
│   └── script.js
└── 4to Punto/           # NASA API Explorer
    ├── index.html
    ├── styles.css
    ├── config.js
    ├── apod.js
    ├── wms.js
    ├── mars.js
    ├── tech.js
    └── app.js
```

---

## 🔍 **PUNTO 3: Búsqueda Dinámica con Historial**

### 📋 Descripción
Aplicación web que implementa una barra de búsqueda dinámica con gestión de historial utilizando la History API del navegador y consumo de datos externos mediante Fetch API.

### ✨ Funcionalidades Implementadas

#### 🔍 **Búsqueda Dinámica**
- **Barra de búsqueda**: Input con autocompletado deshabilitado
- **Búsqueda en tiempo real**: Filtrado mientras escribes
- **Búsqueda por Enter**: Activación con tecla Enter
- **Búsqueda por botón**: Botón de búsqueda con ícono

#### 📚 **Gestión de Historial**
- **History API**: Cada búsqueda se registra con `history.pushState()`
- **Navegación hacia atrás**: Botón "← Atrás" funcional
- **Browser back**: Compatible con botón atrás del navegador
- **Estado de URL**: URLs actualizadas con parámetros de búsqueda
- **Restauración**: Manejo de `popstate` para restaurar búsquedas

#### 🌐 **Consumo de API Externa**
- **Fetch API**: Peticiones asíncronas a JSONPlaceholder
- **URL**: `https://jsonplaceholder.typicode.com/posts`
- **Filtrado inteligente**: Búsqueda en título, contenido e ID
- **Manejo de errores**: Respuestas HTTP y errores de red

#### 🎨 **Interfaz de Usuario**
- **Diseño responsivo**: Adaptable a móviles y tablets
- **Gradientes modernos**: Colores azul y púrpura
- **Animaciones suaves**: Transiciones y efectos hover
- **Cards atractivas**: Diseño de tarjetas para cada post
- **Resaltado de términos**: Highlighting de palabras buscadas
- **Contador de resultados**: Muestra cantidad encontrada

### 🔧 **APIs Utilizadas**

#### 1. **History API**
```javascript
// Registrar búsqueda en historial
history.pushState(state, title, url);

// Manejar navegación
window.addEventListener('popstate', (event) => {
    // Restaurar estado anterior
});
```

#### 2. **Fetch API**
```javascript
// Obtener datos externos
const response = await fetch('https://jsonplaceholder.typicode.com/posts');
const posts = await response.json();
```

### 🎯 **Palabras Clave de Prueba**
- `"qui"` - Múltiples resultados
- `"sunt"` - Varios posts
- `"1"` - Posts con ID #1, #10, #100
- `"dolor"` - Término común en Lorem Ipsum
- `"javascript"` - Sin resultados (para probar manejo)

### 🚀 **Cómo Usar**
1. Abre `3er Punto/Index.html` en tu navegador
2. Escribe una palabra clave en la barra de búsqueda
3. Presiona Enter o haz clic en 🔍
4. Navega entre búsquedas con "← Atrás"
5. Usa "Limpiar" para resetear

---

## 🛸 **PUNTO 4: NASA API Explorer**

### 📋 Descripción
Aplicación web completa que integra múltiples APIs oficiales de la NASA para consultar y visualizar imágenes espaciales, datos satelitales, fotografías de Marte y patentes tecnológicas.

### 🌟 **Módulos Implementados**

#### 🌌 **1. APOD (Astronomy Picture of the Day)**
- **API**: `https://api.nasa.gov/planetary/apod`
- **Funcionalidades**:
  - Consulta imágenes astronómicas por fecha específica
  - Filtrado automático (solo imágenes, excluye videos)
  - Explicaciones científicas completas
  - Modal con zoom y alta resolución
  - Fechas aleatorias desde 1995-06-16
  - Información de copyright cuando disponible

#### 🛰️ **2. WMS (Web Map Service) - Capas Satelitales**
- **API**: `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi`
- **Capas Disponibles**:
  - **Color Real**: Vista natural de la Tierra
  - **Temperatura de Superficie**: Mapas térmicos terrestres
  - **Aerosoles**: Partículas en suspensión atmosférica
  - **Cobertura de Nubes**: Fracción de nubes diarias
- **Funcionalidades**:
  - Construcción manual de URLs WMS
  - Parámetros técnicos configurables
  - Descarga de imágenes HD
  - Información técnica detallada

#### 🔴 **3. Mars Rover Photos**
- **API**: `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos`
- **Funcionalidades**:
  - Fotos del rover Curiosity por sol (día marciano)
  - 7 tipos de cámaras diferentes:
    - FHAZ (Front Hazard Avoidance)
    - RHAZ (Rear Hazard Avoidance)
    - MAST (Mast Camera)
    - CHEMCAM (Chemistry Camera)
    - MAHLI (Mars Hand Lens Imager)
    - MARDI (Mars Descent Imager)
    - NAVCAM (Navigation Camera)
  - Grid organizado con información detallada
  - Modal con navegación entre fotos
  - Filtros por cámara
  - Información de misión completa

#### 🔬 **4. Tech Transfer (Patentes Tecnológicas)**
- **API**: `https://api.nasa.gov/techtransfer/patent`
- **Funcionalidades**:
  - Búsqueda de patentes por palabras clave
  - Limpieza automática de contenido HTML
  - Descripción funcional procesada
  - Enlaces a patentes completas
  - Búsquedas sugeridas (solar, satellite, robotics, etc.)
  - Modal con información técnica detallada

### 🔑 **Configuración de API Key**

#### **Método 1: Archivo de Configuración**
En `config.js` línea 9:
```javascript
this.DEFAULT_API_KEY = 'TU_API_KEY_AQUI'; // Reemplaza DEMO_KEY
```

#### **Método 2: Interfaz Web**
1. Campo de texto en la parte superior de la aplicación
2. Botón "Guardar Key" para almacenar permanentemente
3. Botón "Usar Demo Key" (limitado a 30 requests/hora)

#### **Obtener API Key Gratuita**
1. Visita: https://api.nasa.gov/
2. Completa el formulario de registro
3. Recibirás tu key por email
4. Límite: 1000 requests/hora con key propia

### 🎨 **Características de Diseño**

#### **Tema Espacial**
- Gradientes cósmicos (azul espacial, púrpura, cian)
- Animaciones de estrellas titilantes
- Efectos de brillo y resplandor
- Tipografía futurista (Orbitron + Roboto)

#### **Interactividad**
- Modales full-screen para imágenes
- Navegación por teclado (Alt + 1-4)
- Efectos hover y transiciones suaves
- Sistema de notificaciones elegante
- Descarga de imágenes HD
- Compartir con Web Share API

#### **Responsive Design**
- Adaptable a móviles y tablets
- Grid flexible para fotos
- Menús colapsables en móvil
- Touch-friendly en dispositivos táctiles

### 🛠️ **APIs y Tecnologías Utilizadas**

#### **APIs del Navegador**
- **Fetch API**: Peticiones asíncronas
- **Web Share API**: Compartir contenido nativo
- **LocalStorage API**: Persistencia de configuración
- **Clipboard API**: Copiar URLs y texto

#### **APIs Externas**
- **NASA APOD API**: Imágenes astronómicas
- **NASA GIBS WMS**: Capas satelitales
- **NASA Mars Rover API**: Fotos de Marte
- **NASA TechTransfer API**: Patentes tecnológicas

#### **Tecnologías Frontend**
- **HTML5**: Estructura semántica
- **CSS3**: Gradientes, Grid, Flexbox, Animaciones
- **JavaScript ES6+**: Clases, Modules, Async/Await
- **Google Fonts**: Tipografías web

### 🚀 **Cómo Usar**

#### **Configuración Inicial**
1. Obtén tu NASA API Key en https://api.nasa.gov/
2. Colócala en `config.js` o usa la interfaz web
3. Abre `4to Punto/index.html` en tu navegador

#### **Navegación**
- **Pestañas superiores**: Cambia entre módulos
- **Alt + 1-4**: Atajos de teclado para módulos
- **Controles específicos**: Cada módulo tiene sus propios controles

#### **Módulo APOD**
1. Selecciona una fecha o usa "Imagen Aleatoria"
2. Haz clic en "Obtener Imagen"
3. Clic en la imagen para zoom completo

#### **Módulo WMS**
1. Selecciona tipo de capa satelital
2. Elige una fecha (máximo ayer)
3. Haz clic en "Obtener Imagen"

#### **Módulo Mars Rover**
1. Ingresa un sol (día marciano) entre 1-4000
2. Opcionalmente selecciona una cámara específica
3. Navega por las fotos en el modal

#### **Módulo Tech Transfer**
1. Busca tecnologías con palabras clave
2. Usa búsquedas sugeridas o propias
3. Explora patentes en el modal detallado

---

## 🔧 **Instalación y Ejecución**

### **Requisitos**
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet para APIs
- API Key de NASA (opcional, incluye DEMO_KEY)

### **Instalación Local**
```bash
# Clonar repositorio
git clone https://github.com/DavidRJimenez/Nasa-Software-Taller.git

# Navegar al directorio
cd Nasa-Software-Taller/Arquitectura_Sof

# Abrir con Live Server (VS Code) o cualquier servidor local
```

### **Deployment**
Compatible con:
- **GitHub Pages**
- **Netlify**
- **Vercel**
- **Firebase Hosting**
- Cualquier hosting estático

---

## 📖 **Documentación Técnica**

### **Punto 3 - Arquitectura**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Interface     │    │   History API    │    │  Fetch API      │
│   (HTML/CSS)    │◄──►│   Management     │◄──►│  (JSONPlaceholder)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                        ▲                       ▲
         │                        │                       │
         ▼                        ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Search Logic  │    │   URL State      │    │   Data Filter   │
│   (script.js)   │    │   Management     │    │   & Display     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Punto 4 - Arquitectura**
```
┌─────────────────┐
│   Main App      │
│   (app.js)      │
└─────────────────┘
         │
         ├─► ┌─────────────────┐
         │   │   Config        │
         │   │   (config.js)   │
         │   └─────────────────┘
         │
         ├─► ┌─────────────────┐    ┌──────────────────┐
         │   │   APOD Module   │◄──►│   NASA APOD API  │
         │   │   (apod.js)     │    └──────────────────┘
         │   └─────────────────┘
         │
         ├─► ┌─────────────────┐    ┌──────────────────┐
         │   │   WMS Module    │◄──►│   NASA GIBS WMS  │
         │   │   (wms.js)      │    └──────────────────┘
         │   └─────────────────┘
         │
         ├─► ┌─────────────────┐    ┌──────────────────┐
         │   │   Mars Module   │◄──►│   Mars Rover API │
         │   │   (mars.js)     │    └──────────────────┘
         │   └─────────────────┘
         │
         └─► ┌─────────────────┐    ┌──────────────────┐
             │   Tech Module   │◄──►│   TechTransfer   │
             │   (tech.js)     │    │   API            │
             └─────────────────┘    └──────────────────┘
```

---

## 🎯 **Objetivos Cumplidos**

### **Punto 3**
✅ Implementación de barra de búsqueda dinámica  
✅ Registro de búsquedas con `history.pushState()`  
✅ Navegación hacia atrás con `history.back()`  
✅ Consumo de API externa con Fetch  
✅ Filtrado de resultados por término de búsqueda  
✅ Interfaz dinámica y responsive  
✅ Manejo completo de errores  

### **Punto 4**
✅ 4 módulos NASA completamente funcionales  
✅ Fetch API para todas las peticiones asíncronas  
✅ Procesamiento de respuestas JSON  
✅ Construcción dinámica del DOM  
✅ Filtrado de elementos (solo imágenes en APOD)  
✅ Limpieza de contenido HTML (Tech Transfer)  
✅ URLs WMS construidas manualmente  
✅ Experiencia web estructurada e informativa  

---

## 🐛 **Solución de Problemas**

### **Errores Comunes**

#### **API Key Inválida**
- Verifica que la key esté correctamente copiada
- Asegúrate de que no tenga espacios adicionales
- Usa DEMO_KEY para pruebas (limitada)

#### **Límite de Peticiones**
- DEMO_KEY: 30 requests/hora
- API Key personal: 1000 requests/hora
- Espera 1 hora para resetear el límite

#### **Imágenes no Cargan**
- Verifica conexión a internet
- Algunas fechas pueden no tener datos
- Intenta con fechas diferentes

#### **CORS Errors**
- Las APIs NASA tienen CORS habilitado
- Si usas archivo local, algunos navegadores pueden bloquear
- Usa Live Server o servidor web local

---

## 👨‍💻 **Autor**

**David Jiménez**  
Universidad - 7mo Semestre  
Arquitectura de Software  

---

## 📄 **Licencia**

Este proyecto es de uso educativo. Las APIs utilizadas pertenecen a NASA y JSONPlaceholder respectivamente.

---

## 🙏 **Agradecimientos**

- **NASA** por proporcionar APIs públicas increíbles
- **JSONPlaceholder** por la API de prueba
- **Google Fonts** por las tipografías
- **GitHub Copilot** por la asistencia en desarrollo

---

**¡Explora el cosmos! 🚀✨**
