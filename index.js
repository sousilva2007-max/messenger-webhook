const express = require('express');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'EAAsvpr33mdkBR6ZBRtyOG2t3HLzhHaqfg6erNHv4Rkd7db93ZA9Q40nUyU995boMTFJaUQwsamYm5DjrcKiuXH8FBXRqKsnJbAKWDM4dASDP5xktZADZCbFqivKXlksUoJERzehuOB5GtzezG2IdcvLGVxZAnPUjsbqZCjC23eLS6IH93gSVahAvNqDzKG6kjfrwyypLuc6wcQi61UFxm2rzpkzsgkzbu3tReTLchfmulWSJDghtTLflcsVtW5k9ORxrYwSMmkc6uPodDo9FDlsgZDZD';
const PAGE_ACCESS_TOKEN = 'EAAMmYzdHBsUBR3oFvBHnpt6EfQrP53TMuPfOESNDc5ZBlke69LjdJfy85y8QIZCZA4ZArhOXicxYHs5Q9CJwPCkuZA0zZB7FXbcZAlgNEdHmxI6nn40G1IYGTnyT7XjtAjPoVqiuoeQYlnp4ZAYTNh0ewK8yjsavGmo3MzjJYvVovVXCH7XWw7IZBP6OalZCpIy1vQgKK83gZDZD';

const produtos = {
  'phc go': { nome: 'PHC GO', descricao: 'Software de gestão em cloud para pequenas empresas.', link: 'https://www.middlesense.pt/site/' },
  'phc cs': { nome: 'PHC CS', descricao: 'ERP completo para empresas.', link: 'https://www.middlesense.pt/site/' },
  'portateis': { nome: 'Portáteis', descricao: 'Vasta gama de portáteis para uso pessoal e profissional.', link: 'https://maisinformatica.pt/shop' },
  'pc': { nome: 'Computadores Desktop', descricao: 'PCs para escritório e uso profissional.', link: 'https://maisinformatica.pt/shop' },
  'impressoras': { nome: 'Impressoras', descricao: 'Impressoras e multifunções para escritório.', link: 'https://maisinformatica.pt/shop' },
  'servidores': { nome: 'Servidores', descricao: 'Soluções de servidores para empresas.', link: 'https://maisinformatica.pt/shop' },
  'antivirus': { nome: 'Antivírus ESET', descricao: 'Proteção completa para o teu negócio.', link: 'https://www.middlesense.pt/site/servicos/' },
  'vigilancia': { nome: 'Sistemas de Vigilância', descricao: 'Câmeras e sistemas de segurança Ajax.', link: 'https://www.middlesense.pt/site/servicos/' }
};

async function sendMessage(recipientId, text) {
  await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient: { id: recipientId }, message: { text } })
  });
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
      const message = event.message?.text?.toLowerCase();
      if (message) {
        const produtoEncontrado = Object.keys(produtos).find(key => message.includes(key));
        if (produtoEncontrado) {
          const p = produtos[produtoEncontrado];
          await sendMessage(senderId, `🛍️ ${p.nome}\n\n${p.descricao}\n\n🔗 Mais info: ${p.link}`);
        } else if (message.includes('olá') || message.includes('ola') || message.includes('oi') || message.includes('bom dia') || message.includes('boa tarde') || message.includes('hello')) {
          await sendMessage(senderId, `Olá! 👋 Bem-vindo à Mais Informática!\n\nPosso ajudá-lo com informações sobre:\n• PHC GO / PHC CS\n• Portáteis e PCs\n• Impressoras\n• Servidores\n• Antivírus\n• Sistemas de Vigilância\n\nEscreva o nome do produto que procura! 😊`);
        } else {
          await sendMessage(senderId, `Não encontrei esse produto. Temos disponível:\n• PHC GO / PHC CS\n• Portáteis e PCs\n• Impressoras\n• Servidores\n• Antivírus\n• Sistemas de Vigilância\n\n📞 +351 256 044 402\n📧 info@maisinformatica.pt`);
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
