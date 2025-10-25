# Sistema de Onboarding

## Visão Geral

O sistema de onboarding permite que os usuários escolham seu tipo (Cliente ou Barbeiro) após o primeiro login via Google OAuth. O processo é automático e acontece apenas uma vez.

## Fluxo do Sistema

### 1. Primeiro Login (Google OAuth)
- Usuário faz login pela primeira vez
- É criado no banco com `role = null`
- Não tem acesso às funcionalidades ainda

### 2. Redirecionamento Automático
- `RoleChecker` detecta que `role` é `null`
- Usuário é redirecionado para `/onboarding`

### 3. Página de Onboarding

#### Opção 1: Cliente
- Clica em "Sou Cliente"
- Role é definido como `CLIENT`
- Mensagem de sucesso
- Redirecionado para página inicial (pode agendar serviços)

#### Opção 2: Barbeiro
- Clica em "Sou Barbeiro"
- Sistema carrega lista de barbearias
- Barbearias com barbeiro já vinculado aparecem desabilitadas
- Seleciona uma barbearia disponível
- Role é definido como `BARBER`
- Vínculo é criado na tabela `Barber`
- Mensagem de sucesso
- Redirecionado para `/barber-dashboard`

## Regras de Negócio

### Para Clientes
✅ Pode fazer agendamentos
✅ Pode ver seus próprios agendamentos em `/bookings`
✅ Menu mostra: "Início" e "Agendamentos"

### Para Barbeiros
✅ Pode ver dashboard com agendamentos da barbearia
✅ Vê apenas agendamentos da sua barbearia
✅ Menu mostra: "Início" e "Dashboard"
❌ Não pode fazer agendamentos como cliente
❌ Não pode trocar de barbearia depois de vinculado

### Restrições
- **Uma barbearia só pode ter UM barbeiro por vez**
- **Um usuário só pode ser barbeiro de UMA barbearia**
- **O onboarding acontece apenas UMA vez**
- **Não é possível mudar de role depois de definido** (por segurança)

## Arquitetura Técnica

### Banco de Dados

```prisma
model User {
  role UserRole? // Null para novos usuários
  barber Barber? // Relação opcional
}

model Barber {
  userId       String @unique // Um usuário, um vínculo
  barbershopId String         // Uma barbearia
}
```

### Componentes Criados

1. **`/onboarding/page.tsx`**
   - Página de seleção de tipo de usuário
   - Interface visual para escolher entre Cliente e Barbeiro
   - Seleção de barbearia para barbeiros

2. **`/src/app/_components/role-checker.tsx`**
   - Componente que verifica se usuário tem role
   - Redireciona automaticamente para onboarding se necessário
   - Evita loops de redirecionamento

3. **`/src/app/_actions/onboarding.ts`**
   - `setUserAsClient()` - Define usuário como cliente
   - `setUserAsBarber()` - Define usuário como barbeiro e vincula barbearia
   - `getAllBarbershops()` - Lista barbearias disponíveis
   - Validações de barbearia já ocupada

### Fluxo de Validação

```
Login Google → Session criada com role=null
    ↓
RoleChecker detecta role=null
    ↓
Redireciona para /onboarding
    ↓
Usuário escolhe tipo
    ↓
Server Action valida e atualiza banco
    ↓
Session é atualizada
    ↓
Usuário é redirecionado para página apropriada
```

## Segurança

### Validações Implementadas

1. **Backend (Server Actions)**
   ```typescript
   // Verifica se barbearia já tem barbeiro
   const existingBarber = await db.barber.findFirst({
     where: { barbershopId }
   });
   
   if (existingBarber) {
     return { success: false, error: "Barbearia já possui barbeiro" };
   }
   ```

2. **Frontend (UI)**
   ```typescript
   // Desabilita barbearias que já têm barbeiro
   disabled={barbershop._count.barbers > 0}
   ```

3. **Middleware**
   - Protege rotas `/bookings` e `/barber-dashboard`
   - Requer autenticação

4. **RoleChecker**
   - Verifica role em todas as páginas
   - Previne acesso sem onboarding completo

## Como Usar

### Para Novos Usuários

1. Acesse o sistema
2. Clique em "Fazer Login"
3. Faça login com Google
4. Escolha seu tipo:
   - **Cliente**: Para agendar serviços
   - **Barbeiro**: Para gerenciar uma barbearia
5. Se escolheu barbeiro, selecione sua barbearia
6. Pronto! Já pode usar o sistema

### Para Redefinir um Usuário (Admin)

```sql
-- Remover vínculo de barbeiro
DELETE FROM "Barber" WHERE "userId" = 'user-id';

-- Remover role
UPDATE "User" SET role = NULL WHERE id = 'user-id';

-- Na próxima vez que fizer login, passará pelo onboarding novamente
```

## Experiência do Usuário

### Cliente
1. Login com Google
2. Página de onboarding
3. Clica em "Sou Cliente"
4. ✅ "Bem-vindo! Você pode fazer seus agendamentos agora."
5. Redirecionado para página inicial

### Barbeiro
1. Login com Google
2. Página de onboarding
3. Clica em "Sou Barbeiro"
4. Lista de barbearias aparece
5. Seleciona uma barbearia disponível
6. ✅ "Parabéns! Sua barbearia foi vinculada com sucesso."
7. Redirecionado para dashboard do barbeiro

## Tratamento de Erros

### Barbearia Já Ocupada
```
❌ "Esta barbearia já possui um barbeiro vinculado (Nome do Barbeiro)"
```

### Usuário Já é Barbeiro
```
❌ "Você já está vinculado a uma barbearia"
```

### Erro Genérico
```
❌ "Erro ao configurar sua conta"
```

## Arquivos Modificados/Criados

### Criados
- `/src/app/onboarding/page.tsx`
- `/src/app/_components/role-checker.tsx`
- `/src/app/_actions/onboarding.ts`
- `/src/middleware.ts`
- `/ONBOARDING_SYSTEM.md`

### Modificados
- `/prisma/schema.prisma` - Role agora é opcional
- `/src/app/_lib/auth.ts` - Session permite role null
- `/src/app/layout.tsx` - Incluído RoleChecker
- `/src/app/_components/side-menu.tsx` - Menu baseado em role CLIENT

### Migrations
- `20251025160423_make_role_optional` - Torna role opcional

## Próximos Passos Sugeridos

1. **Painel Admin**: Permitir admin gerenciar vínculos de barbeiros
2. **Múltiplos Barbeiros**: Permitir mais de um barbeiro por barbearia
3. **Troca de Barbearia**: Permitir barbeiro solicitar mudança (com aprovação)
4. **Convite**: Sistema de convite para barbeiros se cadastrarem
5. **Verificação**: Verificar identidade de barbeiros antes de vincular

## Importante: Gerar Prisma Client

Se você parar o servidor de desenvolvimento, execute:

```bash
npx prisma generate
```

Isso atualizará os tipos do TypeScript com as mudanças no schema.
