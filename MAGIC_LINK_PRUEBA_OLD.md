
# 📧 RECUPERAR CONTRASEÑA CON CÓDIGO OTP - GUÍA PASO A PASO

## ✅ IMPLEMENTACIÓN COMPLETADA (Método que funciona sin configuración)

### Archivos modificados:
1. ✅ `source/Login/OlvideMiContrasenia.js` - Sistema de código OTP de 6 dígitos usando `resetPasswordForEmail`
2. ✅ `App.js` - Sin cambios necesarios

### ¿Cómo funciona ahora?
1. Usuario ingresa su email
2. Supabase envía un **código de 6 dígitos** al correo usando el método de recuperación
3. Usuario ingresa el código + nueva contraseña
4. Contraseña actualizada ✅

**✨ VENTAJA: Usa `resetPasswordForEmail` que NO requiere habilitar "Email Signup" en Supabase**

---

## 🔧 PASO 1: Verificar template en Supabase (IMPORTANTE)

### 1. Ve a Supabase Dashboard
```
https://app.supabase.com/project/pcehdqzgprhhutqunmab/auth/templates
```

### 2. Selecciona la pestaña "Reset Password"

### 3. Asegúrate que el template contenga `{{ .Token }}`

Debe tener algo como:
```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>Your verification code is: {{ .Token }}</p>
```

### 4. Guarda cambios si hiciste modificaciones

**No necesitas configurar URLs, deep links, ni templates. ¡Todo funciona automáticamente!**

---

## 📱 PASO 2: Iniciar la App

### 2.1 Abrir terminal y ejecutar:
```bash
cd c:\Users\devandroid\Solvy\SolvyApp
npm start
```

### 2.2 Escanear código QR
- **Android**: Abre Expo Go y escanea el código
- **iOS**: Usa la cámara del iPhone

---

## 🧪 PASO 3: PROBAR LA RECUPERACIÓN DE CONTRASEÑA

### 3.1 Navegar a "Olvidé mi contraseña"
1. En la pantalla de login
2. Busca y toca "Olvidé mi contraseña" o similar
3. Se abrirá la pantalla de recuperación

### 3.2 Ingresar tu email
1. Escribe un email que esté registrado en la app
2. Ejemplo: `tumail@gmail.com`
3. Presiona **"Enviar código"** 📧

### 3.3 Revisar tu correo
1. Abre tu bandeja de entrada (Gmail, Outlook, etc.)
2. Busca un correo de **Supabase Auth**
3. **⚠️ REVISA SPAM** si no aparece en la bandeja principal
4. Verás un código de **6 dígitos** como: `123456`

### 3.4 Ingresar el código y nueva contraseña
1. En la app, verás nuevos campos
2. Ingresa el código de 6 dígitos que recibiste
3. Ingresa tu nueva contraseña (mínimo 6 caracteres)
4. Presiona **"Cambiar contraseña"**

### 3.5 ¡Listo!
- Verás un mensaje de éxito ✅
- Serás redirigido a Iniciar Sesión
- Ahora puedes loguearte con tu nueva contraseña

---

## 🔍 PASO 4: Verificar que funciona

### ✅ Checklist de éxito:

- [ ] Email enviado correctamente (aparece alert "¡Código enviado!")
- [ ] Código de 6 dígitos recibido en el email
- [ ] Pantalla cambia para ingresar código y nueva contraseña
- [ ] Al ingresar código correcto, muestra "¡Éxito!"
- [ ] Redirige a pantalla de Iniciar Sesión
- [ ] Puedes loguearte con la nueva contraseña

### 📊 Lo que verás en el email de Supabase:

```
Asunto: Confirm your signup
Cuerpo: Your verification code is: 123456
Válido por: 60 minutos
```

---

## ❌ PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "No recibo el email"
**Soluciones:**
- ✅ Revisa la carpeta de SPAM
- ✅ Verifica que el email esté bien escrito
- ✅ Confirma que el usuario existe en Supabase
- ✅ Espera 1-2 minutos (a veces hay delay)

### Problema 2: "El enlace no abre la app"
**Soluciones:**
- ✅ Asegúrate de usar Expo Go (no un navegador)
- ✅ Verifica que `app.json` tenga `"scheme": "solvy"`
- ✅ Reinicia la app Expo Go
- ✅ Usa `--tunnel` al iniciar Expo

### Problema 3: "La app se abre pero no me loguea"
**Soluciones:**
- ✅ Revisa los logs en la consola de Expo
- ✅ Verifica que la URL de redirección en Supabase sea correcta: `solvy://login`
- ✅ Confirma que el token no haya expirado (válido por 60 min)

### Problema 4: "Error al enviar el enlace"
**Soluciones:**
- ✅ Verifica la conexión a internet
- ✅ Confirma las credenciales de Supabase en `supabaseClient.js`
- ✅ Revisa que el email tenga formato válido

---

## 🎯 PRUEBA RÁPIDA (DEBUG)

Si quieres probar sin esperar el email:

### En el código (temporal):
```javascript
// En OlvideMiContrasenia.js, después del await supabase.auth.signInWithOtp
console.log('✅ Magic Link enviado a:', email);
console.log('🔗 Deberías recibir un correo en:', email);
```

### Verificar en Supabase Dashboard:
1. Ve a: **Authentication** → **Users**
2. Busca tu usuario
3. Verifica la última actividad

---

## 📝 NOTAS IMPORTANTES

### Seguridad:
- ✅ Los tokens expiran en 60 minutos
- ✅ Cada enlace es de un solo uso
- ✅ El email debe estar verificado en Supabase

### Producción:
- 🚀 En producción, configura tu propio dominio
- 🚀 Personaliza el template del email en Supabase
- 🚀 Configura un servicio de email profesional (SendGrid, AWS SES, etc.)

### Deep Links:
- 📱 `solvy://login` abre la app en login
- 📱 Puedes crear más: `solvy://home`, `solvy://perfil`, etc.

---

## 🎉 ¿FUNCIONÓ?

Si todo salió bien, deberías poder:
1. ✅ Ingresar tu email
2. ✅ Recibir el correo
3. ✅ Hacer clic en el enlace
4. ✅ Iniciar sesión automáticamente
5. ✅ **SIN NECESIDAD DE CONTRASEÑA** 🚀

---

## 📞 SOPORTE

Si algo no funciona:
1. Revisa los logs en la consola de Expo
2. Verifica la configuración de Supabase
3. Confirma que el scheme esté en `app.json`
4. Prueba con otro email

---

**¡Listo para probar! 🚀**
