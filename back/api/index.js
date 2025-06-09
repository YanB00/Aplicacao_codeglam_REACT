// index.js (TEMPORARY DEBUGGING CODE)
const express = require('express');
const cors = require('cors')
const app = express();
const morgan = require('morgan');
require('./database');

// Import routes
const funcionarioRoutes = require('./routes/funcionario.routes');
const clienteRoutes = require('./routes/cliente.routes');
const servicosRoutes = require('./routes/servicos.routes');
const agendamentosRoutes = require('./routes/agendamento.routes');
const registroRoutes = require('./routes/registro.routes');
const loginRoutes = require('./routes/login.routes');

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use(morgan('dev')); 

app.use('/uploads', express.static('uploads'));

app.set ('port', 3000);


app.use('/funcionarios', funcionarioRoutes);
app.use('/register', registroRoutes);
app.use('/login', loginRoutes);
app.use('/clientes', clienteRoutes);
app.use('/servicos', servicosRoutes);
app.use('/agendamentos', agendamentosRoutes);

app.use((req, res, next) => {
  console.warn(`--- DEBUG: 404 Not Found for ${req.method} ${req.originalUrl}`);
  res.status(404).json({ errorStatus: true, mensageStatus: 'Recurso não encontrado no servidor.' });
});


app.listen(app.get('port'), ()=>{
    console.log(`Servidor iniciado na porta ${app.get('port')} `);
})