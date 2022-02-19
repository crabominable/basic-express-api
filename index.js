const express = require('express');
const rescue = require('express-rescue');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const { isValidEmail, isValidPassword } = require('./middlewares/loginValidation');
const { isValidToken,
  isValidName,
  isValidAge,
  isValidTalk,
  isValidWatchedAt,
  isValidRate,
  isValidRateRange } = require('./middlewares/createTalkerValidation');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';
const pathTalkers = 'talker.json';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => response.status(HTTP_OK_STATUS).send());
//

// REQUISITO 1
app.get('/talker', rescue(async (_request, response) => {
  const file = await fs
    .readFile(path.join(__dirname, pathTalkers), 'utf8').then((content) => JSON.parse(content));

  if (!file) { return response.status(HTTP_OK_STATUS).json([]); }

  return response.status(HTTP_OK_STATUS).json(file);
}));
//

// REQUISITO 7
app.get('/talker/search', isValidToken, async (request, response) => {
  const { q } = request.query;
  
  const talkers = await fs.readFile('./talker.json', 'utf-8')
  .then((content) => JSON.parse(content));
  if (!q) return response.status(200).json(talkers);
  
  const filteredTalker = talkers.filter((t) => t.name.includes(q));
  
  return response.status(200).json(filteredTalker);
});
//

// REQUISITO 2
app.get('/talker/:id', rescue(async (request, response) => {
  const { id } = request.params;

  const file = await fs
    .readFile(path.join(__dirname, pathTalkers), 'utf8').then((content) => JSON.parse(content));

  const result = file.find((i) => Number(i.id) === Number(id));

  if (!result || result.length === 0) {
  return response
    .status(404).json({ message: 'Pessoa palestrante não encontrada' }); 
  }

  return response.status(HTTP_OK_STATUS).json(result);
}));
//

// REQUISITO 3
app.post('/login', isValidEmail, isValidPassword, (_request, response) => {
  const token = crypto.randomBytes(8).toString('hex');
  
  return response.status(HTTP_OK_STATUS).json({ token: `${token}` });
});
// 

// REQUISITO 4
app.post('/talker',
  isValidToken,
  isValidName,
  isValidAge,
  isValidTalk,
  isValidWatchedAt,
  isValidRate,
  isValidRateRange, rescue(async (request, response) => {
    const { name, age, talk: { watchedAt, rate } } = request.body;

    const file = await fs
    .readFile(path.join(__dirname, pathTalkers), 'utf8').then((content) => JSON.parse(content));

    const newTalker = {
      id: file.length + 1,
      name,
      age,
      talk: {
        watchedAt,
        rate,
      },
    };

    file.push(newTalker);
    await fs.writeFile('./talker.json', JSON.stringify(file));
    return response.status(201).json(newTalker);
}));
//

// REQUISITO 5
app.put('/talker/:id',
  isValidToken,
  isValidName,
  isValidAge,
  isValidTalk,
  isValidWatchedAt,
  isValidRate,
  isValidRateRange, rescue(async (request, response) => {
    const { name, age, talk } = request.body;
    const { id } = request.params;
    const file = await fs
      .readFile(path.join(__dirname, pathTalkers), 'utf8').then((content) => JSON.parse(content));
    const result = file.filter((i) => Number(i.id) !== Number(id));
    const editedTalker = {
      id: Number(id),
      name,
      age,
      talk,
    };
    result.push(editedTalker);
    await fs.writeFile('./talker.json', JSON.stringify(result));
    return response.status(HTTP_OK_STATUS).json(editedTalker);
}));
//

// REQUISITO 6
app.delete('/talker/:id', isValidToken, rescue(async (request, response) => {
  const { id } = request.params;
  const file = await fs
    .readFile(path.join(__dirname, pathTalkers), 'utf8').then((content) => JSON.parse(content));
  const result = file.filter((i) => Number(i.id) !== Number(id));
  console.log(result);
  await fs.writeFile('./talker.json', JSON.stringify(result));
  return response.status(204).end();
}));
//

app.use((err, _req, res, _next) => res
  .status(HTTP_OK_STATUS).json({ error: `Erro: ${err.message}` }));

app.listen(PORT, () => {
  console.log('Online in port 3000');
});
