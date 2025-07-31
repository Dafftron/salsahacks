# 👥 USUARIOS DE PRUEBA - SalsaHacks

## 📋 **Información de Usuarios de Prueba**

### **Usuario #1: Super Administrador**
- **Email:** superadmin@salsahacks.com
- **Contraseña:** superadmin123
- **Nombre:** Super Administrador SalsaHacks
- **Rol:** super_admin
- **Propósito:** Control total del sistema (solo tú)

### **Usuario #2: Maese**
- **Email:** maese@salsahacks.com
- **Contraseña:** maese123
- **Nombre:** Maese María González
- **Rol:** maese
- **Propósito:** Crear contenido y gestionar usuarios

### **Usuario #3: Usuario**
- **Email:** usuario@salsahacks.com
- **Contraseña:** usuario123
- **Nombre:** Carlos Rodríguez
- **Rol:** user
- **Propósito:** Acceso completo a contenido

### **Usuario #4: Pollito**
- **Email:** pollito@salsahacks.com
- **Contraseña:** pollito123
- **Nombre:** Ana Martínez
- **Rol:** pollito
- **Propósito:** Acceso limitado (invitado)

---

## 🚀 **Pasos para Crear Usuarios:**

1. **Ir a:** `http://localhost:3000`
2. **Hacer clic en:** "Iniciar Sesión"
3. **Cambiar a:** "Crear cuenta"
4. **Llenar formulario** con los datos de arriba
5. **Crear cuenta** y verificar que funciona

---

## ✅ **Funcionalidades a Probar:**

- [x] Registro con email/contraseña
- [x] Login con email/contraseña
- [ ] Login con Google
- [x] Ver perfil de usuario
- [x] Cerrar sesión
- [x] Persistencia de datos
- [x] Diferentes roles de usuario
- [x] Sistema de permisos
- [x] Gestión de roles
- [x] Acceso controlado por roles

---

## 📊 **Estado de Creación:**

| Usuario | Estado | Fecha | Notas |
|---------|--------|-------|-------|
| Super Admin | ✅ Creado | 2025-01-27 | Usuario super administrador funcional |
| Maese | ⏳ Pendiente | - | - |
| Usuario | ⏳ Pendiente | - | - |
| Pollito | ⏳ Pendiente | - | - |

---

## 🔐 **Sistema de Roles Implementado:**

### **Roles Disponibles:**
- **👑 Super Administrador:** Control total del sistema (solo tú)
- **🔴 Maese:** Crear contenido y gestionar usuarios
- **🟢 Usuario:** Acceso completo a contenido
- **🟡 Pollito:** Acceso limitado (invitado)

### **Permisos por Rol:**
- **Super Administrador:** Todos los permisos del sistema
- **Maese:** Crear contenido, gestionar eventos, subir videos, ver usuarios
- **Usuario:** Acceso completo, comentar, calificar, subir imágenes
- **Pollito:** Solo contenido público, sin comentarios

### **Funcionalidades de Seguridad:**
- ✅ Verificación de permisos por página
- ✅ Control de acceso basado en roles
- ✅ Gestión de roles desde panel admin
- ✅ Perfiles de usuario con información de permisos

---

*Documento actualizado automáticamente durante el proceso de creación* 