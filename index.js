const express = require('express');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'EAAsvpr33mdkBR6ZBRtyOG2t3HLzhHaqfg6erNHv4Rkd7db93ZA9Q40nUyU995boMTFJaUQwsamYm5DjrcKiuXH8FBXRqKsnJbAKWDM4dASDP5xktZADZCbFqivKXlksUoJERzehuOB5GtzezG2IdcvLGVxZAnPUjsbqZCjC23eLS6IH93gSVahAvNqDzKG6kjfrwyypLuc6wcQi61UFxm2rzpkzsgkzbu3tReTLchfmulWSJDghtTLflcsVtW5k9ORxrYwSMmkc6uPodDo9FDlsgZDZD';

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
