# Sistema de Login para Barbeiros

## Visão Geral

O sistema agora suporta dois tipos de usuários:
- **CLIENTE (CLIENT)**: Usuários que fazem agendamentos
- **BARBEIRO (BARBER)**: Usuários que gerenciam uma barbearia e visualizam agendamentos

## Estrutura do Banco de Dados

### Modelo User
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(CLIENT)  // Novo campo
  accounts      Account[]
  sessions      Session[]
  bookings      Booking[]
  barber        Barber?                     // Nova relação
}
```

### Modelo Barber
```prisma
model Barber {
  id           String     @id @default(uuid())
  userId       String     @unique
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  barbershopId String
  barbershop   Barbershop @relation(fields: [barbershopId], references: [id], onDelete: Cascade)
  createdAt    DateTime   @default(now())
}
```

## Funcionalidades

### Para Clientes (CLIENT)
- Visualizar barbearias
- Fazer agendamentos
- Ver seus próprios agendamentos em `/bookings`
- Menu mostra: "Início" e "Agendamentos"

### Para Barbeiros (BARBER)
- Visualizar dashboard com agendamentos da sua barbearia em `/barber-dashboard`
- Ver agendamentos de hoje
- Ver próximos agendamentos
- **NÃO consegue ver agendamentos de outras barbearias**
- Menu mostra: "Início" e "Dashboard"

## Como Usar

### 1. Executar a Migration
```bash
npx prisma migrate dev
```

### 2. Popular o Banco com Dados de Teste (Opcional)
```bash
npm run seed
```

Isso criará:
- 10 barbearias
- Serviços para cada barbearia
- 10 usuários barbeiros (um para cada barbearia)

### 3. Emails dos Barbeiros Criados no Seed
- barbeiro1@barbeariavintagе.com (Barbearia Vintage)
- barbeiro2@corte&estilo.com (Corte & Estilo)
- barbeiro3@barba&navalha.com (Barba & Navalha)
- E assim por diante...

### 4. Criar um Barbeiro Manualmente

Para criar um barbeiro para uma barbearia existente:

```typescript
// 1. Criar ou atualizar um usuário para ser barbeiro
const user = await prisma.user.update({
  where: { email: "email@example.com" },
  data: { role: "BARBER" }
});

// 2. Associar o usuário com uma barbearia
await prisma.barber.create({
  data: {
    userId: user.id,
    barbershopId: "ID_DA_BARBEARIA"
  }
});
```

### 5. Transformar um Cliente em Barbeiro

Se você já tem um usuário logado via Google e quer torná-lo barbeiro:

```typescript
// No console do banco ou script
UPDATE "User" SET role = 'BARBER' WHERE email = 'seu-email@gmail.com';

INSERT INTO "Barber" (id, "userId", "barbershopId", "createdAt") 
VALUES (
  gen_random_uuid(), 
  'ID_DO_USER', 
  'ID_DA_BARBEARIA', 
  NOW()
);
```

## Fluxo de Autenticação

1. Usuário faz login via Google OAuth
2. NextAuth busca informações do usuário incluindo:
   - `role` (CLIENT ou BARBER)
   - `barbershopId` (se for barbeiro)
3. Session inclui essas informações
4. Frontend usa o `role` para mostrar menu apropriado
5. Backend valida permissões nas rotas

## Segurança

- Barbeiros só podem ver agendamentos da sua própria barbearia
- Validação de role acontece tanto no backend (server components) quanto no frontend
- Rotas protegidas redirecionam usuários não autorizados

## Arquivos Criados/Modificados

### Criados
- `/src/app/_actions/get-barbershop-bookings.ts` - Server actions para barbeiros
- `/src/app/barber-dashboard/page.tsx` - Dashboard do barbeiro
- `/prisma/migrations/xxx_add_barber_role_and_table/` - Migration

### Modificados
- `/prisma/schema.prisma` - Adicionados enum, modelo Barber e campo role
- `/src/app/_lib/auth.ts` - Inclui role e barbershopId na session
- `/src/app/_components/side-menu.tsx` - Menu diferenciado por role
- `/prisma/seed.ts` - Cria barbeiros de exemplo

## Próximos Passos Sugeridos

1. **Adicionar página de gerenciamento**: Permitir barbeiros editarem informações da barbearia
2. **Sistema de notificações**: Notificar barbeiros sobre novos agendamentos
3. **Relatórios**: Dashboard com estatísticas e relatórios
4. **Múltiplos barbeiros**: Permitir mais de um barbeiro por barbearia
5. **Agenda por barbeiro**: Cada barbeiro ter sua própria agenda
