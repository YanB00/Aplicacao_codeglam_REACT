const Registro = require('../models/registro');

const getSalaoIdFromUser = async (req, res, next) => {
  const userId = req.body.userId || req.query.userId || req.params.userId; 
  console.log('>>> MIDDLEWARE: userId recebido (APENAS de req.query):', userId);

  if (!userId) {
    console.warn('>>> MIDDLEWARE: userId não encontrado na requisição.');
    req.salaoId = null; 
    return next();
  }

  try {
    console.log('>>> MIDDLEWARE: Tentando buscar Registro com _id:', userId); 
    const registro = await Registro.findById(userId); 

    if (registro) {
      req.salaoId = registro._id;
      console.log('>>> MIDDLEWARE: Registro encontrado! req.salaoId definido para:', req.salaoId.toString()); 
    } else {
      req.salaoId = null;
      console.warn('>>> MIDDLEWARE: Registro (Salao) NÃO encontrado no BD para o userId:', userId); 
    }
  } catch (error) {
    console.error('>>> MIDDLEWARE: ERRO (CATCH) ao buscar salaoId no banco de dados:', error); 
    req.salaoId = null;
  }
  console.log('>>> MIDDLEWARE: Finalizando, req.salaoId atual antes de next():', req.salaoId ? req.salaoId.toString() : 'null'); 
  next();
};

module.exports = getSalaoIdFromUser;