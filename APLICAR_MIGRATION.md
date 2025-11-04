# 🔧 Aplicar Migration do Onboarding

## 📁 Migration Criada
`prisma/migrations/20251103190000_remove_role_default_for_onboarding/migration.sql`

Esta migration remove o default `CLIENT` da coluna `role`, forçando que novos usuários passem pelo onboarding.

---

## ⚡ Aplicar a Migration

### Opção 1: Usando Prisma CLI
```bash
npx prisma migrate deploy
npx prisma generate
```

### Opção 2: Manualmente no Banco
Se o comando acima não funcionar, execute este SQL no seu PostgreSQL:

```sql
ALTER TABLE "User" ALTER COLUMN "role" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
```

Depois rode:
```bash
npx prisma generate
```

---

## ✅ Testar

1. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Delete seu usuário do banco** (opcional para testar)

3. **Faça logout no navegador:**
   - Limpe cookies ou use aba anônima

4. **Faça login novamente:**
   - Você deve ver a tela de onboarding pedindo para escolher role

---

## 🎯 Como Funciona Agora

```
Novo Usuário faz Login
    ↓
Usuário criado no banco SEM role (NULL)
    ↓
Página Home detecta: sem role → redireciona para /onboarding
    ↓
Onboarding mostra botão: "Login com Google"
    ↓
Após login, mostra: "Sou Cliente" ou "Sou Barbeiro"
    ↓
Escolhe role → role é salva no banco
    ↓
Redirecionado para página apropriada
    ↓
Próximo login → vai direto (não passa pelo onboarding)
```

---

## ⚠️ Importante

- ✅ O schema já foi atualizado: `role UserRole?`
- ✅ O auth.ts já está correto (não força CLIENT)
- ✅ O onboarding já redireciona usuários com role
- ⚡ Só falta aplicar a migration no banco!

---

## 🆘 Problemas?

Se após aplicar ainda criar usuários com `role=CLIENT`:

1. Verifique se a migration foi aplicada:
   ```sql
   SELECT column_name, column_default, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'User' AND column_name = 'role';
   ```
   
   Deve retornar: `is_nullable = YES` e `column_default = NULL`

2. Reinicie o servidor Node.js

3. Limpe cache do navegador e faça logout completo
