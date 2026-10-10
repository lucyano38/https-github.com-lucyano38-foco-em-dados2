# 📌 Guia de Ambiente e Comandos - Foco em Dados

## 1. Acesso ao Ambiente no Termux
- Entrar no container Alpine:
  proot-distro login alpine

## 2. Inicialização do Projeto
- Entrar na pasta e rodar o servidor:
  cd foco-em-dados
  npm run dev

## 3. Configuração do Túnel (Cloudflare)
- Para expor a porta 8080 do servidor local:
  npx cloudflared tunnel --url http://127.0.0.1:8080

## 4. Regras das Nossas Conversas
- Sempre guardar os códigos que funcionam.
- Começar a conversa no dia seguinte com um resumo do que fizemos no dia anterior.
- Sempre ao final do envio de cada código, enviar os comandos para publicar no site.
- Guardar todas as atualizações que iremos executar.
