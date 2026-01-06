// Importamos las herramientas principales
const express = require('express'); // Framework para crear el servidor
const cors = require('cors'); // Permite las conexiones entre sistemas
const dotenv = require('dotenv'); // Maneja configuración de variables de entorno

dotenv.config(); // Carga las variables desde el archivo .env

// Creamos una aplicación de Express
const app = express();
app.use(cors()); // Habilita las conexiones exteriores
app.use(express.json()); // Permite recibir y procesar datos en formato JSON

// Ruta principal: Responde cuándo alguien accede al servidor
app.get('/', (req, res) => {
    res.send('¡El backend está funcionando!');
});

// Configuración del puerto (por defecto será el 3001)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});