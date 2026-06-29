const express = require('express');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'EAAsvpr33mdkBR4w2DZBMoZC6IHeccoUiwZALk9eveh1IMzFmiXPYnBcws0oLTFt5eYWLLeuUu2gngpIOlkCZA9Sie2ZBxpEx8rVZCFhLbjU3nJgjchmFQMhEPpj0WCSWTrx2z7THkZCHvQepmxhZAZBz8j09I0nzqQkHUQRGwpB7cMjfKKYZB1tZATjZBZCM9rmRS9GjdQcyfGx8IsWih04xF5RiCrO9LRaqYJhRVNvb0dXudGEW13IgJ8XDlfdL2ZA4oZCNKx66FxiZBulhlOFMp6wz6PYg';

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  const body = req.body;
  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const event = entry.messaging[0];
      const senderId = event.sender.id;
      const message = event.message?.text;
      console.log(`Mensagem de ${senderId}: ${message}`);
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor a correr na porta ${PORT}`));
