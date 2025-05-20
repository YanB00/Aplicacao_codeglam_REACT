const express = require('express');
const cors = require('cors')
const app = express();
const morgan = require('morgan');
require('./database');

const funcionarioRoutes = require('./routes/funcionario.routes')

app.use(cors())
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }))


app.use(morgan('dev'));


app.set ('port', 3000);
app.use('/funcionarios', funcionarioRoutes);
app.use(require('./routes/registro.routes'));
app.use(require('./routes/login.routes'));


// app.use(require('./routes/servicos.routes'));
// app.use(require('./routes/agendamento.routes'));
// app.use(require('./routes/cliente.routes'));


app.listen(app.get('port'), ()=>{
    console.log(`Servidor iniciado na porta ${app.get('port')} `);
})