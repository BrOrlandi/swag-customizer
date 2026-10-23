# Segurança

Aplicação demonstrativa aberta, sem login. Projetos, conversas e chaves pessoais de IA ficam no localStorage do navegador. As chaves podem ser removidas no painel de configuração e não são incluídas nos backups de projetos. Dados enviados para IA são processados pelos provedores selecionados.

- Nunca gravar ou registrar chaves pessoais, headers de IA, conteúdo de `.env` ou corpos de requisições no backend/proxy.
- Chaves enviadas em headers só podem seguir para endpoints fixos dos provedores. Não aceitar URLs de API arbitrárias.
- Não ativar fallback de chaves do proprietário em produção.
- Arquivos públicos por URL aleatória são temporários; não fazer upload de material confidencial.
- Uploads são decodificados e normalizados para PNG; SVG/HTML não são aceitos.
- Ferramentas do agente só podem consultar o catálogo, o snapshot do pedido e arquivos conhecidos. Nunca acessar caminhos ou URLs arbitrários.
- Configurar origens CORS explicitamente. CORS não equivale a autenticação ou proteção contra clientes HTTP externos.
- Preservar limites de upload, espaço em disco e processamento. Os limites em memória pressupõem uma única instância.
- O envio de e-mail é opcional. Habilitá-lo em uma aplicação aberta exige acompanhar quotas e uso do remetente.

Para reportar um problema, use o contato do perfil https://github.com/BrOrlandi e não publique credenciais em issues.
