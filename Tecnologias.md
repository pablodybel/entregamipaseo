Intentamos realizar una plataforma web que conecta dueños de mascotas con paseadores de perros, permitiendo encontrar cuidadores confiables según barrio, disponibilidad y reputación.  

Dependencia -"concurrently"- ejecutar varios comandos al mismo tiempo en la misma terminal.

Para el front: 

"axios": Cliente HTTP para peticiones al servidor GET, POST, PUT, DELETE mas facil y parsea json automaticamente
"lucide-react": Librería de iconos para React ej shield eye etc
"react": Librería base de React, componenete y estados
"react-dom": renderizado 
"react-hook-form": Manejo de formularios en React validación, manejo de errores, registro de campos
"react-hot-toast": mensajes de éxito/error que aparecen notificaciones
"react-router-dom": Enrutamiento para React



Para el Back 

"bcryptjs": Encriptación de contraseñas  
"cors": Permite que el cliente React (puerto 5173) se comunique con el servidor (puerto 4000)
"dotenv": 
"express": Framework principal que maneja todas las rutas HTTP (GET, POST, PATCH, DELETE)
"helmet": Protege contra vulnerabilidades comunes
"jsonwebtoken": Genera tokens de acceso (15 minutos) y refresh (30 días) Verifica tokens en el middleware de autenticación
"mongoose": Conecta con la base de datos MongoDB Define esquemas y modelos (User, Pet, WalkRequest, Review)
- Maneja validaciones, índices y relaciones entre documentos
"multer": Configurado con límite de 5MB por archivo
- Valida tipos de archivo (solo imágenes: jpeg, jpg, png, webp)
- Guarda archivos en la carpeta `uploads/`
"zod":  Valida todos los datos de entrada (registro, login, creación de mascotas, solicitudes de paseo, reseñas)
- Middleware `validate()` y `validateQuery()` para validar body y query params
- Esquemas definidos: `registerSchema`, `loginSchema`, `createPetSchema`, `createWalkRequestSchema`, `createReviewSchema`, etc.


