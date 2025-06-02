const express = require('express');
const cors = require('cors')
const app = express();
const morgan = require('morgan');
require('./database');

const funcionarioRoutes = require('./routes/funcionario.routes');
const clienteRoutes = require('./routes/cliente.routes');
const servicosRoutes = require('./routes/servicos.routes');
const agendamentosRoutes = require('./routes/agendamento.routes');

app.use(cors())
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }))


app.use(morgan('dev'));

app.use('/uploads', express.static('uploads'));
app.set ('port', 3000);
app.use('/funcionarios', funcionarioRoutes);

app.use(require('./routes/registro.routes'));
app.use(require('./routes/login.routes'));

app.use('/clientes', clienteRoutes);
app.use ('/servicos', servicosRoutes);
app.use('/agendamentos', agendamentosRoutes);


app.listen(app.get('port'), ()=>{
    console.log(`Servidor iniciado na porta ${app.get('port')} `);
})