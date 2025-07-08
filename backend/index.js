require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importar rutas
const asistenciaRoutes = require('./routes/asistenciaRoutes');
const aulaRoutes = require('./routes/aulaRoutes');
const beneficiarioRoutes = require('./routes/beneficiarioRoutes');
const claseRoutes = require('./routes/claseRoutes');
const cursoHasNumeroDeClasesRoutes = require('./routes/cursoHasNumeroDeClasesRoutes');
const cursoRoutes = require('./routes/cursoRoutes');
const especialidadProfesorRoutes = require('./routes/especialidadProfesorRoutes');
const grupoRoutes = require('./routes/grupoRoutes'); // Corregido
const matriculaRoutes = require('./routes/matriculaRoutes'); // Corregido
const numeroDeClasesRoutes = require('./routes/numeroDeClasesRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const permisoRoutes = require('./routes/permisoRoutes');
const privilegioRoutes = require('./routes/privilegioRoutes');
const profesorRoutes = require('./routes/profesorRoutes');
const rolPermisoPrivilegioRoutes = require('./routes/rolPermisoPrivilegioRoutes');
const rolRoutes = require('./routes/rolRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const usuarioHasRolRoutes = require('./routes/usuarioHasRolRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const programacionClaseRoutes = require('./routes/programacionClaseRoutes');
const programacionProfesorRoutes = require('./routes/programacionProfesorRoutes');
const profesorHasCursoRoutes = require('./routes/profesorHasCursoRoutes');
const contadorRoutes = require('./routes/contadorRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://raul321:pass123@cluster0.xjeaj.mongodb.net/MGA';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MGA API' });
});

// Usar rutas
app.use('/api/asistencias', asistenciaRoutes);
app.use('/api/aulas', aulaRoutes);
app.use('/api/beneficiarios', beneficiarioRoutes);
app.use('/api/clases', claseRoutes);
app.use('/api/curso_has_numero_de_clases', cursoHasNumeroDeClasesRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/especialidades_de_profesores', especialidadProfesorRoutes);
app.use('/api/grupos', grupoRoutes);
app.use('/api/matriculas', matriculaRoutes);
app.use('/api/numero_de_clases', numeroDeClasesRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/permisos', permisoRoutes);
app.use('/api/privilegios', privilegioRoutes);
app.use('/api/profesores', profesorRoutes);
app.use('/api/roles', rolRoutes); // Agregado punto y coma
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/rol_permiso_privilegio', rolPermisoPrivilegioRoutes);
app.use('/api/usuarios_has_rol', usuarioHasRolRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/programacion_de_clases', programacionClaseRoutes);
app.use('/api/programacion_de_profesores', programacionProfesorRoutes);
app.use('/api/profesor_has_curso', profesorHasCursoRoutes);
app.use('/api/contador', contadorRoutes);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});