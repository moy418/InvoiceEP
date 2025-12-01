# El Paso Furniture & Style - Invoice Generator

Sistema completo para generar facturas profesionales con generación de PDFs, respaldo de facturas, y cálculo automático de impuestos de Texas.

---

## 🚀 Migración a Nueva PC (Instrucciones Completas)

### Requisitos Previos en la Nueva PC

1. **Git** instalado
   - Descarga: https://git-scm.com/downloads
   - Verifica con: `git --version`

2. **Node.js** (versión 18+)
   - Descarga: https://nodejs.org/
   - Verifica con: `node --version`

3. **Docker Desktop** (recomendado para producción)
   - Descarga: https://www.docker.com/products/docker-desktop
   - Opcional si solo usarás el desarrollo local

4. **Google Antigravity** instalado
   - Verifica que tienes acceso a la carpeta `.gemini`

### Pasos de Migración

#### 1️⃣ Clonar el Repositorio

Abre **PowerShell** o **Command Prompt** y ejecuta:

```bash
# Navega al directorio de Antigravity scratch
cd C:\Users\TU_USUARIO\.gemini\antigravity\scratch

# Clona el repositorio
git clone https://github.com/moy418/InvoiceEP.git

# Entra al directorio
cd InvoiceEP
```

> **Nota:** Reemplaza `TU_USUARIO` con tu nombre de usuario de Windows en la nueva PC.

#### 2️⃣ Instalar Dependencias

```bash
# Instalar dependencias de Node.js
npm install
```

#### 3️⃣ Configurar Tailscale (para acceso remoto)

Si deseas acceder desde otras computadoras en la red:

```bash
# Revisa las instrucciones en:
# DOCKER_TAILSCALE_SETUP.md
```

#### 4️⃣ Iniciar la Aplicación

**Opción A: Producción con Docker (Recomendado)**

```bash
# Iniciar contenedores
docker-compose up -d

# La aplicación estará disponible en:
# http://localhost:3000
```

**Opción B: Desarrollo Local**

```bash
# Método 1: Usar el archivo .bat (Windows)
START_INVOICE_GENERATOR.bat

# Método 2: Comando manual
node server.js

# La aplicación estará disponible en:
# http://localhost:3000
```

---

## 📋 Características

- ✅ **Generación de facturas profesionales**
- ✅ **Descarga de PDFs** con logo y diseño profesional
- ✅ **Historial de facturas** guardado localmente
- ✅ **Edición de facturas** existentes
- ✅ **Cálculo automático de impuestos** (8.25% Texas)
- ✅ **Múltiples métodos de pago**
- ✅ **Opciones de financiamiento**
- ✅ **Modo Docker** para producción
- ✅ **Acceso remoto** vía Tailscale

---

## 🏢 Información del Negocio (Pre-configurada)

- **Nombre:** El Paso Furniture & Style
- **Dirección:** 402 S El Paso St, El Paso, TX 79901
- **Teléfono:** (915) 730-0160
- **Lema:** Your Comfort, Our Priority

---

## 📁 Estructura del Proyecto

```
InvoiceEP/
├── index.html                    # Aplicación principal
├── styles.css                    # Diseño y estilos
├── server.js                     # Servidor Node.js
├── package.json                  # Dependencias
├── Dockerfile                    # Configuración Docker
├── docker-compose.yml            # Orquestación de contenedores
├── nginx.conf                    # Configuración Nginx
├── START_INVOICE_GENERATOR.bat   # Lanzador Windows
├── DOCKER_TAILSCALE_SETUP.md     # Guía de Tailscale
├── public/
│   └── script.js                 # Lógica de la aplicación
└── assets/
    └── logo.png                  # Logo del negocio
```

---

## 🛠️ Comandos Útiles

### Desarrollo Local

```bash
# Iniciar servidor de desarrollo
node server.js

# O usar Python (alternativa)
python -m http.server 8080
```

### Docker

```bash
# Iniciar contenedores
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener contenedores
docker-compose down

# Reconstruir imágenes
docker-compose up -d --build
```

### Git (para actualizaciones futuras)

```bash
# Ver cambios
git status

# Descargar últimos cambios
git pull

# Subir cambios (si haces modificaciones)
git add .
git commit -m "Descripción de cambios"
git push
```

---

## 🐛 Solución de Problemas

### ❌ PDF no se descarga
**Solución:** Asegúrate de acceder vía `http://localhost:3000` (no abriendo el archivo HTML directamente)

### ❌ "Python not found"
**Solución:** Instala Python desde [python.org](https://python.org) o usa Node.js con `node server.js`

### ❌ Puerto 3000 en uso
**Solución:** 
```bash
# Windows: Encuentra el proceso usando el puerto
netstat -ano | findstr :3000

# Mata el proceso (reemplaza PID)
taskkill /PID <PID> /F
```

### ❌ Error "Module not found"
**Solución:**
```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### ❌ Docker no inicia
**Solución:** Verifica que Docker Desktop esté ejecutándose

---

## 🔐 Datos y Privacidad

- **Sin cuotas mensuales**
- **Sin almacenamiento en la nube**
- **Tus datos permanecen en tu computadora**
- **100% Gratis para siempre**

---

## 📞 Soporte

Para problemas o preguntas:
- Revisa la sección de "Solución de Problemas"
- Consulta `DOCKER_TAILSCALE_SETUP.md` para acceso remoto
- Repositorio: https://github.com/moy418/InvoiceEP

---

## 📝 Notas Adicionales para la Migración

1. **Facturas guardadas:** Las facturas se guardan en `localStorage` del navegador. Si deseas migrar facturas existentes, exporta los datos desde la PC original usando las herramientas de desarrollador del navegador.

2. **Configuración de Antigravity:** El proyecto debe estar en `C:\Users\TU_USUARIO\.gemini\antigravity\scratch\InvoiceEP` para mantener consistencia con el workspace de Antigravity.

3. **Actualización del logo:** Si necesitas cambiar el logo, reemplaza `assets/logo.png` con tu imagen.

4. **Acceso desde otra PC en la red:** Usa la configuración de Tailscale documentada en `DOCKER_TAILSCALE_SETUP.md`.

---

**¡Listo para usar! 🎉**
