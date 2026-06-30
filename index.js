const express = require('express');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'EAAsvpr33mdkBRyD1rWmy8BdqZCj7ZBggKJHquwYceGPJUpvVexF29HxPTeYNCfZADHSFmZBHjBS61SjMXk2ImQnPxgMondby03W8SoDAPpaX0Ife2ZC9nOQqwZBUSHfUIPzZCNfRg1UUOVXWV9g7B68BwSxEXEUza3OaBZAln3i2rBcgxCmHAluUOl2zXEHpmnzPth2hPB7zyFIPT4ThMFIDVDev8kVXTHvzJPTAoIC3A00ltR7RxtktRMTzl2siOYmNYgcxG1mQxhe1hRJidURg';

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
