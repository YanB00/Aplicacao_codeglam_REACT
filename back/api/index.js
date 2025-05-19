const express = require('express');
const app = express();
const morgan = require('morgan');
require('./database');

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }))

app.use(morgan('dev'));

app.set ('port', 8000);

app.use(require('./routes/registro.routes'));
app.use(require('./routes/servicos.routes'));
app.use(require('./routes/cliente.routes'));
app.use(require('./routes/funcionario.routes'));
app.use(require('./routes/login.routes'));
app.use(require('./routes/agendamento.routes'));

app.listen(app.get('port'), ()=>{
    console.log(`Servidor iniciado na porta ${app.get('port')} `);
})