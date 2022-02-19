const isValidEmail = (request, response, next) => {
  const { email } = request.body;

  if (!email) { return response.status(400).json({ message: 'O campo "email" é obrigatório' }); }

  if (!email.includes('@') || !email.includes('.com')) {
    return response
      .status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' }); 
  }

  next();
};

const isValidPassword = (request, response, next) => {
  const { password } = request.body;

  // const passwordRegex = /^[0-9]*$/;

  if (!password) {
    return response.status(400).json({ message: 'O campo "password" é obrigatório' });
  }

  if (password.length < 6) {
    return response.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }

  next();
};

module.exports = { isValidEmail, isValidPassword };