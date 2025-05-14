const mongoose = require('mongoose');
const URI = 'mongodb+srv://ybarbosa648:jTIXaS5acgrd70id@codeglam.dahu6fa.mongodb.net/?retryWrites=true&w=majority&appName=Codeglam';

mongoose.connect(URI).then(()=>console.log('DB conectado'))
.catch(()=>console.log(err));