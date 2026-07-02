const express = require('express');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'EAAOnAA33cxEBR1vUe47wsS5F0jxCsSniF4l1DyrTZC4fXfrjPI78MP2rRavK9OEaGSMVMwpDY8vadEKOIpDuOe3BlPlblQ5Hz0RIbwlQoC0ZAarTCEBtvsn6XZB7Y4Jol8iVaWtezToRNZB9giNLIcR37NrEE6V266chK5RRi6DoL0ch57oK3sRMbzPZA9gIBaTZCxxrVzCYwKUZC4kIwulB45vG6RXek27ncZBNRntMjsNIC4na8EgPaNmDNZAr9iu7vkm9ZBG8vXy8zBso5sxqbH';
const PAGE_ACCESS_TOKEN = 'EAAMmYzdHBsUBRzIYQp4vySV9WuA4TphKb10YMpezoB80CQ5ddcayjEsWl6daNdc6o6qT3dYyuZA0eDf29Vo059DDPEqzG8N7VdeftQ0KHdIFvh6B3CX0f4aztbmim5fcdyhqSVUmmgKICMdpIgDS748zF0eWOZBZAP4cXKUR1pxi4ZABc1gGr7ZA6oZApWZALVw3ZBx8AQZDZD';
const GROQ_API_KEY = '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';

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

async function askGroq(userMessage) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ]
    })
  });
  const data = await response.json();
  console.log('RESPOSTA GROQ:', JSON.stringify(data));
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
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
          const resposta = await askGroq(message);
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
