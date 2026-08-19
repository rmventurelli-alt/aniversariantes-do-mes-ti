# Installation

Documento de instalacao e operacao da aplicacao **Aniversariantes do Mes** em VM corporativa com Node.js e SQLite.

## Pre-requisitos

- VM Windows ou Linux com acesso administrativo para instalacao.
- Node.js instalado.
- NPM instalado junto com o Node.js.
- SQLite disponivel para verificacao e backup do banco.
- Acesso de escrita na pasta da aplicacao.
- Porta liberada no firewall conforme configuracao, por padrao `3000`.

Nao ha dependencia obrigatoria de Docker.

## Instalacao do Node.js

Instale uma versao LTS do Node.js compativel com Next.js e Prisma. Recomendado:

- Node.js 20 LTS ou superior.

Validar instalacao:

```bash
node -v
npm -v
```

Em Windows, prefira instalar a aplicacao em caminho sem espacos, por exemplo:

```txt
C:\apps\aniversariantes
```

Isso evita problemas de interpretacao de caminho pelo SQLite/Prisma.

## Instalacao das Dependencias

Na pasta raiz da aplicacao, execute:

```bash
npm install
```

O arquivo `package-lock.json` deve ser mantido junto com `package.json` para garantir instalacao reprodutivel.

## Criacao do Arquivo .env

Crie um arquivo `.env` na raiz do projeto, usando `.env.example` como base:

```bash
cp .env.example .env
```

Conteudo recomendado:

```env
DATABASE_URL="file:./app.db"
PORT=3000
JOB_SECRET=troque-este-segredo
WHATSAPP_TOKEN=token-da-meta
WHATSAPP_PHONE_NUMBER_ID=id-do-numero
WHATSAPP_API_VERSION=v20.0
```

Com `DATABASE_URL="file:./app.db"`, o banco SQLite fica em:

```txt
prisma/app.db
```

Em Windows, se a aplicacao estiver em um caminho com espacos, use caminho absoluto sem espacos ou caminho curto:

```env
DATABASE_URL="file:C:/apps/aniversariantes/prisma/app.db"
```

## Comandos Prisma

Gerar Prisma Client:

```bash
npm run prisma:generate
```

Aplicar migrations em producao:

```bash
npm run prisma:deploy
```

Comando de desenvolvimento, caso necessario em ambiente nao produtivo:

```bash
npm run prisma:migrate
```

Abrir Prisma Studio para inspecao tecnica:

```bash
npm run prisma:studio
```

## Build

Execute:

```bash
npm run build
```

Esse comando executa `prisma generate` e depois gera o build do Next.js.

Importante: pare a aplicacao antes do build para evitar bloqueio de arquivos do Prisma em Windows.

## Inicializacao da Aplicacao

Linux:

```bash
PORT=3000 npm run start
```

Windows PowerShell:

```powershell
$env:PORT="3000"; npm run start
```

Tambem e possivel configurar a porta pelo arquivo `.env`:

```env
PORT=3000
```

Recomendacao para producao: executar via gerenciador de processo corporativo, servico do Windows, systemd, PM2 ou ferramenta padrao adotada pelo TI.

## Estrutura de Pastas Uploads

A aplicacao salva arquivos fisicos em disco:

```txt
uploads/
+-- fotos/
+-- templates/
+-- whatsapp-templates/
+-- whatsapp-generated/
```

Fotos dos aniversariantes:

```txt
uploads/fotos/
```

Templates:

```txt
uploads/templates/
```

Templates de arte WhatsApp:

```txt
uploads/whatsapp-templates/
```

Imagens personalizadas geradas para envio WhatsApp:

```txt
uploads/whatsapp-generated/
```

O banco nao armazena imagens. Ele armazena apenas metadados, nome do arquivo e caminho publico, por exemplo:

```txt
/uploads/fotos/foto-uuid.jpg
/uploads/templates/template-uuid.png
```

## Localizacao do Banco SQLite

Com a configuracao padrao:

```env
DATABASE_URL="file:./app.db"
```

O arquivo do banco fica em:

```txt
prisma/app.db
```

Arquivos auxiliares do SQLite tambem podem aparecer durante uso normal:

```txt
prisma/app.db-shm
prisma/app.db-wal
```

Esses arquivos devem ser considerados no backup quando existirem.

## Portas Utilizadas

Porta padrao da aplicacao:

```txt
3000
```

Para alterar:

```env
PORT=8080
```

Ou no start:

```bash
PORT=8080 npm run start
```

A porta escolhida deve estar liberada no firewall da VM e em eventuais proxies/reverses proxies corporativos.

## WhatsApp Business Cloud API

A funcionalidade de envio de aniversarios usa a WhatsApp Business Cloud API diretamente pela aplicacao.

O envio do WhatsApp usa dois itens independentes:

- Template de arte WhatsApp: imagem base cadastrada em `/whatsapp`.
- Mensagem WhatsApp: texto enviado separado da imagem, com suporte a `{{nome}}`.

Durante o job, a aplicacao gera uma imagem personalizada em `uploads/whatsapp-generated/`, envia essa imagem e depois envia a mensagem de texto.

Variaveis obrigatorias para envio real:

```env
JOB_SECRET=troque-este-segredo
WHATSAPP_TOKEN=token-da-meta
WHATSAPP_PHONE_NUMBER_ID=id-do-numero
WHATSAPP_API_VERSION=v20.0
```

O token fica apenas no `.env`; ele nao deve ser salvo no banco nem exposto no frontend.

O endpoint protegido do job e:

```txt
http://localhost:3000/api/jobs/send-birthday-whatsapp?secret=SEU_JOB_SECRET
```

Para agendar diariamente as 08:00 no Windows:

```powershell
powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'http://localhost:3000/api/jobs/send-birthday-whatsapp?secret=SEU_JOB_SECRET' -UseBasicParsing"
```

Se a porta for diferente, use a porta configurada no `.env`.

## Procedimento de Atualizacao da Aplicacao

1. Agendar janela de manutencao.
2. Fazer backup de `prisma/app.db` e da pasta `uploads/`.
3. Parar a aplicacao.
4. Substituir os arquivos da aplicacao pelos novos arquivos entregues.
5. Preservar o arquivo `.env` existente.
6. Preservar `prisma/app.db`.
7. Preservar a pasta `uploads/`.
8. Executar:

```bash
npm install
npm run prisma:deploy
npm run build
```

9. Iniciar a aplicacao:

```bash
npm run start
```

10. Validar no navegador:

```txt
http://SERVIDOR:PORTA
```

## Procedimento de Backup Recomendado

Itens obrigatorios no backup:

```txt
prisma/app.db
uploads/fotos/
uploads/templates/
```

Se existirem, incluir tambem:

```txt
prisma/app.db-shm
prisma/app.db-wal
```

Backup recomendado com SQLite:

```bash
sqlite3 prisma/app.db ".backup 'backup/app.db'"
```

Depois copiar a pasta:

```txt
uploads/
```

Recomendacoes:

- Fazer backup com a aplicacao parada ou em janela de baixa utilizacao.
- Manter banco e uploads no mesmo ponto de restauracao.
- Validar periodicamente a restauracao em ambiente separado.

## Arquivos e Pastas para Entregar ao TI

Enviar estes arquivos e pastas:

```txt
src/
prisma/schema.prisma
prisma/migrations/
uploads/fotos/.gitkeep
uploads/templates/.gitkeep
.env.example
.gitignore
INSTALLATION.md
README_DEPLOY.md
next-env.d.ts
next.config.mjs
package.json
package-lock.json
postcss.config.mjs
tailwind.config.ts
tsconfig.json
```

Tambem pode enviar a pasta `uploads/` vazia contendo apenas os `.gitkeep`, para garantir que a estrutura exista.

## Arquivos e Pastas que Nao Precisam Ser Enviados

Nao enviar:

```txt
node_modules/
.next/
.env
tsconfig.tsbuildinfo
prisma/app.db
prisma/app.db-shm
prisma/app.db-wal
```

Observacao: `prisma/app.db` e `uploads/` com arquivos reais so devem ser enviados se a entrega incluir dados ja cadastrados. Para uma instalacao nova em producao, o TI deve gerar o banco pelas migrations e a pasta `uploads/` comecara vazia.
