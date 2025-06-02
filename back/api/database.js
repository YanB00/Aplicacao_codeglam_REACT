const mongoose = require('mongoose');
const URI = ;

mongoose.connect(URI).then(()=>console.log('DB conectado'))
.catch(()=>console.log(err));