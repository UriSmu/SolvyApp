# Magic Link Authentication - Guía de Implementación

## 📋 Resumen

Se ha implementado un flujo completo de autenticación mediante **magic links** (enlaces mágicos) utilizando Supabase. Este flujo permite a los usuarios acceder a la aplicación sin necesidad de ingresar una contraseña, recibiendo un enlace seguro por correo electrónico.

## 🎯 Características Implementadas

### ✅ Funcionalidades Principales

1. **Solicitud de Magic Link**
   - Pantalla de "Olvidé mi contraseña" actualizada para enviar magic links
   - Validación de formato de email
   - Mensajes claros de éxito y error
   - Indicaciones para revisar spam

2. **Verificación de Magic Link**
   - Pantalla dedicada para verificar el enlace
   - Manejo automático de deep links
   - Verificación segura del token con Supabase
   - Mensajes de error descriptivos para enlaces expirados o inválidos

3. **Seguridad**
   - Tokens de un solo uso
   - Expiración de 60 minutos
   - Tokens firmados criptográficamente por Supabase
   - No revela información sobre existencia de usuarios

## 🏗️ Arquitectura

### Componentes Modificados/Creados

1. **`source/Login/OlvideMiContrasenia.js`**
   - Actualizado para usar `signInWithOtp` de Supabase
   - Interfaz de usuario mejorada con dos estados:
     - Estado inicial: formulario de email
     - Estado de éxito: instrucciones post-envío

2. **`source/Login/VerificarMagicLink.js`** (NUEVO)
   - Componente para verificar magic links
   - Maneja tres estados:
     - Verificando: spinner de carga
     - Error: mensaje de error con opción de reintentar
     - Éxito: confirmación y redirección

3. **`App.js`**
   - Añadido `VerificarMagicLink` al stack de navegación
   - Configurado deep linking con expo-linking
   - Definidas rutas para magic link

4. **`app.json`**
   - Actualizado intentFilters de Android
   - Añadida ruta `magic-link` al esquema

### Flujo de Datos

```
1. Usuario ingresa email en OlvideMiContrasenia
       ↓
2. App llama a supabase.auth.signInWithOtp()
       ↓
3. Supabase genera token seguro y envía email
       ↓
4. Usuario hace clic en el enlace del email
       ↓
5. Sistema operativo abre app con solvy://magic-link?access_token=...
       ↓
6. VerificarMagicLink extrae y verifica el token
       ↓
7. Si es válido: redirección a IniciarSesion
   Si es inválido: mensaje de error
```

## 🔧 Configuración Técnica

### Dependencias Instaladas

```json
{
  "expo-linking": "latest"
}
```

### URLs y Esquemas

- **Esquema de la app**: `solvy://`
- **Ruta de magic link**: `solvy://magic-link`
- **Ruta de forgot password**: `solvy://forgot-password`

### Configuración de Supabase

El código utiliza la siguiente configuración en `signInWithOtp`:

```javascript
{
  email: emailLower,
  options: {
    emailRedirectTo: 'solvy://magic-link',
    shouldCreateUser: false  // No crear usuario si no existe
  }
}
```

## 📧 Configuración de Email en Supabase

### Plantilla de Email Requerida

Para que los magic links funcionen correctamente, asegúrate de que la plantilla de email de Supabase incluya el enlace correcto:

1. Ve a **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Selecciona la plantilla **"Magic Link"**
3. Asegúrate de que contenga: `{{ .ConfirmationURL }}`

Ejemplo de plantilla:

```html
<h2>Magic Link Login</h2>
<p>Click the link below to log in to your account:</p>
<p><a href="{{ .ConfirmationURL }}">Log In</a></p>
<p>This link expires in 60 minutes.</p>
```

### Remitente del Email

- **Remitente predeterminado**: `noreply@mail.app.supabase.io`
- **Asunto**: "Magic Link" o personalizado en Supabase
- **Importante**: Avisa a los usuarios revisar la carpeta de SPAM

## 🚀 Uso del Sistema

### Para Usuarios

1. **Solicitar Magic Link**:
   - Ir a pantalla de Login
   - Hacer clic en "Olvidé Mi Contraseña"
   - Ingresar email
   - Hacer clic en "Enviar enlace mágico"

2. **Recibir y Usar el Link**:
   - Revisar email (y carpeta SPAM)
   - Hacer clic en el enlace recibido
   - La app se abrirá automáticamente
   - Verificación automática del enlace

3. **Resultado**:
   - Si el enlace es válido: redirigido a Login
   - Si el enlace es inválido/expirado: mensaje de error con opción de reintentar

### Mensajes de Usuario

#### Email Enviado Exitosamente
```
¡Revisa tu correo!

Te hemos enviado un enlace de acceso. Haz clic en él para 
iniciar sesión automáticamente.

Instrucciones:
✉️ Revisa tu bandeja de entrada en [email]
⚠️ Si no lo ves, revisa la carpeta de SPAM
⏱️ El enlace es válido por 60 minutos
🔒 El enlace es de un solo uso y seguro
```

#### Verificación Exitosa
```
¡Verificación exitosa!

Tu identidad ha sido verificada correctamente mediante el enlace mágico.
Ahora puedes iniciar sesión con tus credenciales normales.
```

#### Error de Verificación
```
Error de verificación

[Mensaje de error específico]

Puedes solicitar un nuevo enlace desde la pantalla de inicio de sesión.
```

## 🔒 Seguridad

### Características de Seguridad Implementadas

1. **Tokens de Un Solo Uso**
   - Cada token solo puede usarse una vez
   - Supabase invalida el token después de su uso

2. **Expiración Temporal**
   - Los tokens expiran en 60 minutos
   - Tokens expirados rechazan automáticamente

3. **No Enumeración de Usuarios**
   - No se revela si un email existe o no en el sistema
   - Respuesta genérica para emails no existentes

4. **Firma Criptográfica**
   - Tokens firmados por Supabase
   - Imposible de falsificar o modificar

5. **HTTPS Obligatorio**
   - Los enlaces en producción usan HTTPS
   - Protección contra man-in-the-middle

### Consideraciones de Seguridad

⚠️ **Importante**: El sistema actual verifica la identidad del usuario mediante Supabase, pero luego requiere login tradicional porque la app usa un sistema de autenticación separado (`https://solvy-app-api.vercel.app`).

Para una integración completa, se recomienda:
- Sincronizar el sistema de autenticación con Supabase
- O implementar un endpoint en el API que acepte tokens de Supabase

## 🧪 Testing

### Flujo de Prueba Manual

1. **Solicitud Exitosa**:
   ```
   1. Abrir app
   2. Navegar a "Olvidé mi contraseña"
   3. Ingresar email válido registrado
   4. Verificar mensaje de éxito
   5. Revisar email (inbox y spam)
   ```

2. **Verificación Exitosa**:
   ```
   1. Hacer clic en el enlace del email
   2. Verificar que la app se abre
   3. Verificar pantalla de verificación
   4. Verificar mensaje de éxito
   5. Verificar redirección a login
   ```

3. **Casos de Error**:
   - Email inválido (formato incorrecto)
   - Email no registrado
   - Enlace expirado (esperar >60 min)
   - Enlace ya usado (hacer clic dos veces)
   - Enlace modificado manualmente

### Logs de Debugging

El sistema incluye logging extensivo en consola:

```javascript
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 ENVIANDO MAGIC LINK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: user@example.com
⏰ Hora: 10:30:45
...
```

## 📱 Compatibilidad

### Plataformas Soportadas

- ✅ Android (con deep links configurados)
- ✅ iOS (requiere configuración adicional de associated domains)
- ✅ Web (funciona con redirección HTTP)

### Requisitos

- Expo SDK 54+
- React Navigation 7+
- Supabase JS 2.56+
- expo-linking instalado

## 🔄 Integración con Sistema Existente

### Estado Actual

El magic link verifica la identidad del usuario, pero la app usa un sistema de autenticación separado. Por lo tanto:

1. Usuario solicita magic link
2. Usuario hace clic en el enlace
3. Supabase verifica su identidad
4. **Usuario es redirigido a pantalla de login tradicional**
5. Usuario debe ingresar credenciales normales

### Integración Futura Recomendada

Para una experiencia sin fricción:

1. **Opción A**: Migrar completamente a Supabase Auth
   - Actualizar AuthContext para usar Supabase
   - Migrar usuarios existentes
   - Actualizar todas las pantallas de login

2. **Opción B**: Crear endpoint de sincronización
   - Crear endpoint en API: `POST /auth/verify-supabase-token`
   - Aceptar token de Supabase
   - Retornar sesión del sistema existente
   - Actualizar VerificarMagicLink para llamar este endpoint

## 📝 Archivos Modificados

```
├── App.js                                    (modificado)
├── app.json                                  (modificado)
├── package.json                              (modificado)
├── package-lock.json                         (modificado)
├── source/
│   └── Login/
│       ├── OlvideMiContrasenia.js           (modificado)
│       └── VerificarMagicLink.js            (nuevo)
└── MAGIC_LINK_IMPLEMENTATION.md             (nuevo - este archivo)
```

## 🐛 Troubleshooting

### Problema: No recibo el email

**Soluciones**:
1. Revisar carpeta de SPAM
2. Verificar configuración SMTP de Supabase
3. Verificar que el email esté registrado
4. Verificar logs en Supabase Dashboard

### Problema: El enlace no abre la app

**Soluciones**:
1. Verificar que app.json tenga `"scheme": "solvy"`
2. En Android: reinstalar la app después de cambiar app.json
3. Verificar que expo-linking esté instalado
4. Probar con `npx expo start --tunnel`

### Problema: Error "Invalid token"

**Causas**:
- Token ya usado anteriormente
- Token expirado (>60 minutos)
- Token modificado manualmente
- Problema de sincronización de hora del dispositivo

**Soluciones**:
- Solicitar nuevo magic link
- Verificar hora del dispositivo
- No modificar el enlace del email

### Problema: La app se abre pero no verifica

**Soluciones**:
1. Revisar logs en consola de Expo
2. Verificar que la ruta esté en linking config
3. Verificar que VerificarMagicLink esté en LoginStack
4. Verificar parámetros de URL en logs

## 📚 Recursos Adicionales

### Documentación de Supabase
- [Supabase Auth - Magic Links](https://supabase.com/docs/guides/auth/auth-magic-link)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

### Documentación de Expo
- [Expo Linking](https://docs.expo.dev/guides/linking/)
- [Deep Linking](https://reactnavigation.org/docs/deep-linking/)

## ✅ Checklist de Implementación Completada

- [x] Componente de solicitud de magic link
- [x] Componente de verificación de magic link
- [x] Configuración de deep linking
- [x] Manejo de errores y estados
- [x] Validación de email
- [x] Mensajes de usuario claros
- [x] Logging para debugging
- [x] Configuración de app.json
- [x] Instalación de dependencias
- [x] Documentación completa

---

**Implementado por**: GitHub Copilot Agent
**Fecha**: Octubre 2025
**Versión**: 1.0.0
