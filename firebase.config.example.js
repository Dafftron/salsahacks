// Ejemplo de configuración de Firebase
// Copia este archivo como firebase.config.js y reemplaza con tus credenciales

export const firebaseConfig = {
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Pasos para configurar Firebase:
// 1. Ve a https://console.firebase.google.com/
// 2. Crea un nuevo proyecto o selecciona uno existente
// 3. Ve a Configuración del proyecto > General
// 4. En "Tus apps", haz clic en el ícono de web (</>)
// 5. Registra tu app con un nombre
// 6. Copia la configuración que aparece
// 7. Reemplaza la configuración en src/services/firebase/config.js
// 8. Habilita Authentication en la consola de Firebase
// 9. Habilita Firestore Database en la consola de Firebase
// 10. Habilita Storage en la consola de Firebase 