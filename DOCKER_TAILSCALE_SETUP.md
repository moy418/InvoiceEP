# El Paso Furniture & Style - Invoice Generator
## Guía de Despliegue Docker + Tailscale

## 🐋 Despliegue con Docker

### Requisitos Previos
- Docker instalado en tu máquina
- Docker Compose instalado
- Tailscale configurado en tu red

### Inicio Rápido

**Opción 1: Usar Docker Compose (Recomendado)**

```bash
# Construir y ejecutar el contenedor
docker-compose up -d

# Ver los logs
docker-compose logs -f

# Detener el contenedor
docker-compose down
```

**Opción 2: Usar Docker directamente**

```bash
# Construir la imagen
docker build -t elpaso-invoice-generator .

# Ejecutar el contenedor
docker run -d -p 8080:80 --name elpaso-invoice-generator elpaso-invoice-generator

# Ver los logs
docker logs -f elpaso-invoice-generator

# Detener el contenedor
docker stop elpaso-invoice-generator
docker rm elpaso-invoice-generator
```

### Acceso Local

Una vez que el contenedor esté corriendo:
- Accede desde tu computadora: `http://localhost:8080`

## 🌐 Configuración de Tailscale

### Paso 1: Instalar Tailscale
Si aún no tienes Tailscale instalado:
```bash
# Windows: Descarga desde https://tailscale.com/download/windows
# O usa winget:
winget install tailscale.tailscale
```

### Paso 2: Conectar a Tailscale
```bash
# Inicia sesión en Tailscale
tailscale up
```

### Paso 3: Obtener tu IP de Tailscale
```bash
# Ver tu IP de Tailscale
tailscale ip -4
```

Ejemplo de salida: `100.64.1.2`

### Paso 4: Acceso desde Otros Dispositivos

En cualquier dispositivo conectado a tu red Tailscale, accede a:

```
http://[TU-IP-TAILSCALE]:8080
```

Por ejemplo: `http://100.64.1.2:8080`

### Configuración de Hostname Personalizado (Opcional)

Para acceder usando un nombre en lugar de IP:

1. Ve a [Tailscale Admin Console](https://login.tailscale.com/admin/machines)
2. Encuentra tu máquina
3. Haz clic en los tres puntos → "Edit machine"
4. Agrega un "Machine name" personalizado, por ejemplo: `elpaso-invoices`

Ahora puedes acceder usando:
```
http://elpaso-invoices:8080
```

## 📱 Acceso desde Dispositivos Móviles

### iOS/Android
1. Instala la app de Tailscale desde App Store o Google Play
2. Inicia sesión con tu cuenta
3. Abre el navegador en tu móvil
4. Ve a `http://[TU-IP-TAILSCALE]:8080`

## 🔧 Comandos Útiles

### Docker
```bash
# Ver contenedores corriendo
docker ps

# Ver todos los contenedores
docker ps -a

# Reiniciar el contenedor
docker restart elpaso-invoice-generator

# Ver uso de recursos
docker stats elpaso-invoice-generator

# Actualizar después de cambios
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Tailscale
```bash
# Ver estado de Tailscale
tailscale status

# Ver todas tus IPs
tailscale ip

# Desconectar
tailscale down

# Reconectar
tailscale up
```

## 🚀 Inicio Automático (Windows)

Para que el contenedor se inicie automáticamente al arrancar Windows:

1. Configura Docker Desktop para iniciar al arrancar Windows
2. El contenedor se reiniciará automáticamente si usaste `docker-compose.yml` (tiene `restart: unless-stopped`)

## 🔒 Seguridad

- ✅ El generador de facturas solo es accesible dentro de tu red Tailscale (privada y encriptada)
- ✅ No está expuesto a Internet público
- ✅ Todos tus datos permanecen en tu navegador (localStorage)
- ✅ Tailscale usa WireGuard para encriptación end-to-end

## 📋 Estructura del Proyecto

```
el-paso-invoice-generator/
├── Dockerfile                      # Configuración Docker
├── docker-compose.yml              # Orquestación Docker
├── nginx.conf                      # Configuración del servidor web
├── index.html                      # Aplicación principal
├── styles.css                      # Estilos
├── script.js                       # Lógica JavaScript
├── assets/
│   └── logo.png                   # Logo de tu negocio
├── README.md                       # Instrucciones locales
└── DOCKER_TAILSCALE_SETUP.md      # Esta guía
```

## 🎯 Casos de Uso

**Escenario 1: Oficina**
- Ejecuta el contenedor en tu PC de oficina
- Accede desde cualquier dispositivo en la oficina

**Escenario 2: Múltiples Ubicaciones**
- Ejecuta el contenedor en un servidor
- Accede desde oficina, casa, o móvil vía Tailscale
- Todas las ubicaciones en la misma red privada

**Escenario 3: Equipo de Ventas**
- Tu equipo de ventas puede acceder desde sus dispositivos móviles
- Crear facturas en el momento desde cualquier lugar

## ❓ Troubleshooting

### El contenedor no inicia
```bash
# Ver logs del contenedor
docker logs elpaso-invoice-generator

# Verificar que el puerto 8080 no esté en uso
netstat -ano | findstr :8080
```

### No puedo acceder desde otro dispositivo
1. Verifica que Tailscale esté conectado en ambos dispositivos:
   ```bash
   tailscale status
   ```
2. Verifica que el contenedor esté corriendo:
   ```bash
   docker ps
   ```
3. Prueba hacer ping al servidor desde el otro dispositivo:
   ```bash
   ping [TU-IP-TAILSCALE]
   ```

### El PDF no se descarga
- Asegúrate de estar accediendo vía `http://` no `file://`
- Verifica que JavaScript esté habilitado en tu navegador

## 📞 Información de Contacto del Negocio

- **Nombre:** El Paso Furniture & Style
- **Dirección:** 402 S El Paso St, El Paso, TX 79901
- **Teléfono:** (915) 730-0160
- **Lema:** Your Comfort, Our Priority

---

**¡Listo! Tu generador de facturas ahora es accesible desde cualquier dispositivo en tu red Tailscale! 🎉**
