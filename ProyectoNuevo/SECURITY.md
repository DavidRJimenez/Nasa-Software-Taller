# SECURITY.md

## Desarrollo Seguro en Miwa

Este documento resume las prácticas y hallazgos de seguridad aplicados al desarrollo de la aplicación Miwa, incluyendo backend (Python/FastAPI) y frontend (Next.js/React).

---

### 1. Buenas Prácticas Implementadas

- **Inyección de dependencias:**  
  Uso de FastAPI `Depends` para servicios y autenticación.
- **Sanitización y validación de datos:**  
  Validación con Pydantic en backend y validación de formularios en frontend.
- **Gestión de secretos:**  
  Uso de variables de entorno para credenciales y secretos.
- **Hashing seguro de contraseñas:**  
  Implementado en backend.
- **Actualización y auditoría de dependencias:**  
  Revisión periódica con SCA (Safety, npm audit).

---

### 2. Análisis Estático de Código (SAST)

- **Bandit (backend):**
  - Se ejecutó `bandit -r miwa-backend/`.
  - Hallazgos:
    - Posible binding a todas las interfaces (`host="0.0.0.0"`).  
      *Recomendación:* Usar `127.0.0.1` en desarrollo y proteger el puerto en producción.
    - Uso de `requests.post` sin parámetro `timeout`.  
      *Recomendación:* Agregar `timeout` para evitar bloqueos.
  - No se encontraron vulnerabilidades críticas adicionales.

- **Semgrep (backend y frontend):**
  - Se ejecutó `semgrep --config=auto` en ambos proyectos.
  - No se detectaron vulnerabilidades ni malas prácticas relevantes.

---

### 3. Auditoría de Dependencias (SCA)

- **Safety (backend):**
  - Se ejecutó `safety check -r backend/requirements.txt`.
  - No se detectaron vulnerabilidades activas en las versiones instaladas.
  - *Observación:* Muchas dependencias están sin versión fija (unpinned).  
    *Recomendación:* Fijar versiones en `requirements.txt` para evitar instalar versiones vulnerables.

- **npm audit (frontend):**
  - Se ejecutó `npm audit` y `npm audit fix`.
  - Vulnerabilidades detectadas principalmente en dependencias internas de herramientas (npx, npm).
  - Se corrigieron vulnerabilidades donde fue posible.
  - *Observación:* Mantener dependencias actualizadas y revisar periódicamente.

---

### 4. Recomendaciones Generales

- Fijar versiones de dependencias en backend y frontend.
- Mantener dependencias actualizadas.
- Ejecutar SAST y SCA regularmente, preferentemente en el pipeline CI/CD.
- Documentar y corregir hallazgos de seguridad.
- Usar AWS Secrets Manager en producción para gestión de secretos.
- Proteger puertos y endpoints expuestos en producción.

---

**Última revisión:** 2025-09-04

