const express = require('express');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'EAAsvpr33mdkBR6ZBRtyOG2t3HLzhHaqfg6erNHv4Rkd7db93ZA9Q40nUyU995boMTFJaUQwsamYm5DjrcKiuXH8FBXRqKsnJbAKWDM4dASDP5xktZADZCbFqivKXlksUoJERzehuOB5GtzezG2IdcvLGVxZAnPUjsbqZCjC23eLS6IH93gSVahAvNqDzKG6kjfrwyypLuc6wcQi61UFxm2rzpkzsgkzbu3tReTLchfmulWSJDghtTLflcsVtW5k9ORxrYwSMmkc6uPodDo9FDlsgZDZD';
const PAGE_ACCESS_TOKEN = 'EAAMmYzdHBsUBR3oFvBHnpt6EfQrP53TMuPfOESNDc5ZBlke69LjdJfy85y8QIZCZA4ZArhOXicxYHs5Q9CJwPCkuZA0zZB7FXbcZAlgNEdHmxI6nn40G1IYGTnyT7XjtAjPoVqiuoeQYlnp4ZAYTNh0ewK8yjsavGmo3MzjJYvVovVXCH7XWw7IZBP6OalZCpIy1vQgKK83gZDZD';
const ANTHROPIC_API_KEY = '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';

const SYSTEM_PROMPT = `És um assistente virtual da Mais Informática, uma empresa portuguesa de tecnologia e informática.
A empresa vende e suporta os seguintes produtos e serviços:
- PHC GO: Software de gestão em cloud para pequenas empresas
- PHC CS: ERP completo para empresas maiores
- Portáteis e PCs para uso pessoal e profissional
- Impressoras e multifunções para escritório
- Servidores para empresas
- Antivírus ESET para proteção de negócios
- Sistemas de vigilância Ajax
- Website: https://www.middlesense.pt/site/
- Loja online: https://maisinformatica.pt/shop
- Telefone: +351 256 044 402
- Email: info@maisinformatica.pt

Responde sempre em português europeu de forma simpática, profissional e concisa.
Se não souberes a resposta, sugere que o cliente contacte a empresa diretamente.`;

async function sendMessage(recipientId, text) {
  await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient: { id: recipientId }, message: { text } })
  });
}

async function askClaude(userMessage) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }]
    })
  });
  const data = await response.json();
  return data.content[0].text;
}

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object === 'page') {
    for (const entry of body.entry) {
      const event = entry.messaging[0];
      const senderId = event.sender.id;
      const message = event.message?.text;
      if (message) {
        try {
          const resposta = await askClaude(message);
          await sendMessage(senderId, resposta);
        } catch (err) {
          console.error('Erro:', err);
          await sendMessage(senderId, 'Desculpe, ocorreu um erro. Por favor contacte-nos pelo +351 256 044 402.');
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor a correr na porta ${PORT}`));
