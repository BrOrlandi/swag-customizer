# Demonstrações do Swag Customizer

A [galeria publicada](https://swag-customizer.vercel.app/) reúne dois vídeos de uso e uma apresentação com motion graphics. Os arquivos estão em `public/media` e são servidos pelo frontend, sem depender do prazo de expiração do storage temporário da API.

## Fluxos gravados

1. **Kit Swag Customizer:** uso da versão monocromática transparente do logo (`public/images/swag-logo-white.svg`/`.png`) para manter o símbolo legível nas impressões branca e preta, criação de projeto, seleção de Mochila Voyage, Garrafa Térmica Fresh e Capa para Notebook Slim, upload do logo, posicionamento no editor, geração da composição com Gemini e resumo do kit.
2. **Kit conversacional, exemplo Nubank:** pedido de sugestões para dez pessoas, cards do catálogo, escolha de mochila e garrafa, pergunta sobre conservação de temperatura, upload do logo, aprovação dos mockups, prévia e botão de proposta.
3. **Apresentação:** seis cenas com títulos animados, transições, movimento de painéis e capturas reais dos dois fluxos. A trilha ambiente foi sintetizada localmente para este vídeo, sem amostras de músicas de terceiros.

Os nomes e contatos são demonstrativos. Nenhuma compra ou solicitação comercial foi enviada. Nubank é uma referência visual independente, sem vínculo com a plataforma. As imagens de IA são ilustrações e podem apresentar diferenças em relação aos produtos e à arte original.

## Como as capturas foram feitas

- Frontend de produção, em Chromium remoto pelo browser-proxy, viewport de 1920 × 1080.
- Agente real com API compatível com OpenAI, e geração de imagens via chave Google Gemini separada.
- Chaves configuradas antes de iniciar qualquer gravação. Nenhuma imagem do formulário de credenciais foi capturada.
- Screencast do navegador via CDP, codificado como H.264 a 12 fps. Os vídeos de fluxo têm cortes nas esperas da IA; a interface, as respostas e as imagens exibidas são reais.
- O vídeo conversacional mostra digitação visível e percorre a resposta, os cards de produtos, o resumo e as imagens. O GIF no topo do README foi gravado separadamente com João da Silva, do RH da empresa ACME, e o contato demonstrativo `joao@acme.com`. Mostra digitação, resposta real e sugestões de produtos, com cortes apenas na espera da IA.
- Dados preexistentes no navegador foram preservados e restaurados ao final. As capturas não incluem cookies, headers de autenticação ou logs de rede.
- PNGs preservam as capturas; WebPs são as versões usadas na galeria e no README.

## Renderizar a apresentação novamente

Requer Node.js, dependências do projeto e FFmpeg no PATH:

```bash
npm ci
node scripts/media/render-presentation.mjs
```

O script usa os screenshots versionados, sem consultar IA nem exigir credenciais. Produz um MP4 de 36 segundos, 1920 × 1080, H.264, 24 fps. A renderização também sintetiza a trilha ambiente original e inclui o áudio AAC no MP4, sem downloads de música.

A identidade usa o azul `#045CAB`, o logo Swag Customizer e tipografia do sistema. O vídeo combina capturas da aplicação com motion graphics; não é uma simulação do comportamento do produto.
