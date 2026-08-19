# Deploy e Agendamento

## Variaveis de Ambiente

Configure no `.env` da VM:

```env
DATABASE_URL="file:./app.db"
PORT=3000
JOB_SECRET=troque-este-segredo
WHATSAPP_TOKEN=token-da-meta
WHATSAPP_PHONE_NUMBER_ID=id-do-numero
WHATSAPP_API_VERSION=v20.0
```

Nunca coloque `WHATSAPP_TOKEN` no frontend ou no banco.

## Migration

Antes de iniciar a aplicacao atualizada:

```bash
npm install
npm run prisma:deploy
npm run build
```

Em Windows, pare a aplicacao antes do build para evitar bloqueio dos arquivos do Prisma.

## Job Diario no Windows

Executar diariamente as 08:00 pelo Agendador de Tarefas do Windows:

```powershell
powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'http://localhost:3000/api/jobs/send-birthday-whatsapp?secret=SEU_JOB_SECRET' -UseBasicParsing"
```

Se a porta for diferente, use a porta configurada no `.env`.

## Teste Manual

1. Cadastre uma arte WhatsApp em `/whatsapp`.
2. Marque uma arte WhatsApp como ativa.
3. Cadastre uma mensagem WhatsApp com `{{nome}}`.
4. Marque uma mensagem como ativa.
5. Cadastre um aniversariante com a data de hoje e WhatsApp controlado.
6. Execute o envio pela tela `/whatsapp`.
7. Confira a imagem gerada em `uploads/whatsapp-generated/` e os status exibidos na tela.

Para testar sem envio real em massa, deixe `WHATSAPP_TOKEN` vazio ou use apenas um numero de teste autorizado na Meta.
