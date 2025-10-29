# 📋 Como Cadastrar Novas Barbearias

Este guia explica como adicionar novas barbearias ao sistema de forma fácil e organizada.

## 🎯 Visão Geral

O sistema usa um arquivo de configuração centralizado (`prisma/barbershops-data.ts`) para gerenciar os dados das barbearias. Isso facilita a adição de novas barbearias sem precisar modificar o código do seed principal.

## 📁 Estrutura de Arquivos

```
prisma/
  ├── barbershops-data.ts  (📝 Edite este arquivo para adicionar barbearias)
  └── seed.ts              (✅ Não precisa editar - usa os dados do arquivo acima)

src/app/barbershops/[id]/_helpers/
  └── barbershop-hours.ts  (⏰ Configure horários personalizados aqui)
```

## ➕ Como Adicionar uma Nova Barbearia

### Passo 1: Preparar as Imagens

Primeiro, você precisa ter as URLs das imagens:
- **Imagem da barbearia**: Foto da fachada ou logo
- **Imagens dos serviços**: Uma imagem para cada serviço oferecido

> **Dica**: Você pode usar serviços como [UploadThing](https://uploadthing.com/), [Imgur](https://imgur.com/), ou hospedar suas próprias imagens.

### Passo 2: Editar o Arquivo de Configuração

Abra o arquivo `prisma/barbershops-data.ts` e adicione sua barbearia no array `barbershopsData`.

**Exemplo de estrutura:**

```typescript
{
  name: 'Nome da Sua Barbearia',
  address: 'Endereço Completo da Barbearia',
  imageUrl: 'https://exemplo.com/imagem-barbearia.jpg',
  services: [
    {
      name: 'Nome do Serviço',
      description: 'Descrição detalhada do serviço',
      price: 30.0,
      imageUrl: 'https://exemplo.com/imagem-servico.jpg'
    },
    // Adicione mais serviços conforme necessário
  ]
}
```

### Passo 3: Exemplo Completo

Aqui está um exemplo completo de como adicionar uma nova barbearia:

```typescript
export const barbershopsData: BarbershopData[] = [
  {
    name: 'Be Barbeiro',
    address: 'Rua Marcio Frezzatto, 411 - Sehac - Mogi Mirim',
    imageUrl: 'https://bp72chbkwc.ufs.sh/f/uGhjVd3tm1ZYQ0vHmrj6PAlwqLcjep5fDV8gJnIOTQ3idRhH',
    services: [
      // ... serviços existentes
    ]
  },
  // ⬇️ ADICIONE AQUI SUA NOVA BARBEARIA
  {
    name: 'Barber Shop Premium',
    address: 'Av. Paulista, 1000 - Bela Vista - São Paulo',
    imageUrl: 'https://exemplo.com/barber-shop-premium.jpg',
    services: [
      {
        name: 'Corte Executivo',
        description: 'Corte moderno para profissionais',
        price: 45.0,
        imageUrl: 'https://exemplo.com/corte-executivo.jpg'
      },
      {
        name: 'Barba Completa',
        description: 'Barba feita com navalha e toalha quente',
        price: 35.0,
        imageUrl: 'https://exemplo.com/barba-completa.jpg'
      }
    ]
  }
];
```

## ⏰ Configurar Horários de Funcionamento

Por padrão, todas as barbearias seguem este horário:
- **Segunda a Quarta**: 14h às 18:30
- **Quinta a Sábado**: 14h às 21h
- **Domingo**: Fechado

### Como Alterar os Horários

Se você precisar configurar horários diferentes para uma barbearia específica:

**1. Abra o arquivo:** `src/app/barbershops/[id]/_helpers/barbershop-hours.ts`

**2. Adicione a configuração no objeto `barbershopHoursConfig`:**

```typescript
const barbershopHoursConfig: Record<string, BarbershopHours> = {
  'Be Barbeiro': defaultHours,
  
  // Adicione sua barbearia com horários personalizados:
  'Nome da Sua Barbearia': {
    0: null, // Domingo - Fechado
    1: { start: 9, startMinutes: 0, end: 18, endMinutes: 0 },  // Segunda: 9h às 18h
    2: { start: 9, startMinutes: 0, end: 18, endMinutes: 0 },  // Terça: 9h às 18h
    3: { start: 9, startMinutes: 0, end: 18, endMinutes: 0 },  // Quarta: 9h às 18h
    4: { start: 9, startMinutes: 0, end: 18, endMinutes: 0 },  // Quinta: 9h às 18h
    5: { start: 9, startMinutes: 0, end: 20, endMinutes: 0 },  // Sexta: 9h às 20h
    6: { start: 10, startMinutes: 0, end: 16, endMinutes: 0 }, // Sábado: 10h às 16h
  }
};
```

**Legenda dos dias:**
- `0` = Domingo
- `1` = Segunda-feira
- `2` = Terça-feira
- `3` = Quarta-feira
- `4` = Quinta-feira
- `5` = Sexta-feira
- `6` = Sábado

**Para marcar um dia como fechado:** Use `null`
```typescript
0: null, // Domingo - Fechado
```

## 🔄 Executar o Seed

Depois de adicionar sua barbearia no arquivo de configuração:

### Opção 1: Limpar e Popular o Banco (Recomendado)

```bash
# 1. Parar o servidor de desenvolvimento (se estiver rodando)
# Pressione Ctrl+C no terminal do servidor

# 2. Limpar todas as tabelas e popular com os dados novos
npx tsx scripts/clear-and-seed.ts
```

### Opção 2: Popular Banco Sem Limpar (Apenas Adicionar)

```bash
# Se você quer APENAS adicionar novas barbearias sem apagar as existentes
npx prisma db seed
```

### Opção 3: Usar o Prisma Studio (Interface Visual)

```bash
# 1. Abrir o Prisma Studio
npx prisma studio

# 2. Navegar até a tabela Barbershop
# 3. Clicar em "Add record" para adicionar manualmente
# 4. Preencher os campos e salvar
```

## ⚠️ Observações Importantes

### 🔑 Sobre os Usuários Barbeiros

O sistema cria automaticamente um usuário barbeiro para cada barbearia com:
- **Nome**: `Barbeiro [Nome da Barbearia]`
- **Email**: `barbeiro[número]@[nomedabarbearia].com`
- **Role**: `BARBER`

**Exemplo:**
- Barbearia: "Barber Shop Premium"
- Email gerado: `barbeiro2@barbershoppremium.com`

### 💰 Formato de Preços

- Use ponto (`.`) como separador decimal
- Exemplo: `25.0` ou `45.50`

### 🖼️ Sugestões de Imagens para Serviços

Você pode usar as mesmas imagens padrão dos serviços existentes ou fazer upload de suas próprias:

```typescript
// Imagens padrão disponíveis:
'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png' // Corte
'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png' // Barba
'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png' // Combo
'https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png' // Premium
```

### 🌐 Configurar Domínios de Imagens

Se você usar imagens de um novo domínio, precisa adicioná-lo ao `next.config.mjs`:

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'utfs.io'
      },
      {
        hostname: 'bp72chbkwc.ufs.sh'
      },
      {
        hostname: 'seu-novo-dominio.com' // Adicione aqui
      }
    ]
  }
};
```

## 📊 Verificar Barbearias Cadastradas

Para ver todas as barbearias cadastradas no banco:

```bash
# Abrir Prisma Studio
npx prisma studio

# Ou executar o script de listagem
npx tsx scripts/list-barbershops.ts
```

## 🐛 Solução de Problemas

### Erro: "Cannot read properties of undefined"

**Causa**: O servidor de desenvolvimento está rodando e bloqueando o Prisma Client.

**Solução**:
1. Pare o servidor (`Ctrl+C`)
2. Execute o comando novamente
3. Reinicie o servidor

### Erro: "Unique constraint failed"

**Causa**: Você está tentando adicionar uma barbearia que já existe.

**Solução**:
1. Use o script `clear-and-seed.ts` para limpar e recriar tudo
2. Ou mude o nome da barbearia para um nome único

### Erro: "hostname is not configured under images"

**Causa**: O domínio da imagem não está configurado no Next.js.

**Solução**:
1. Adicione o domínio no arquivo `next.config.mjs`
2. Reinicie o servidor de desenvolvimento

## 📝 Checklist Rápido

Antes de executar o seed, verifique:

- [ ] Adicionei os dados da barbearia no arquivo `barbershops-data.ts`
- [ ] Todas as URLs de imagens estão funcionando
- [ ] Os preços estão no formato correto (com ponto decimal)
- [ ] Configurei horários personalizados (se necessário)
- [ ] Adicionei domínios de imagens no `next.config.mjs` (se necessário)
- [ ] Parei o servidor de desenvolvimento
- [ ] Executei o comando de seed correto

## 🎉 Pronto!

Após executar o seed, sua nova barbearia estará disponível no sistema e aparecerá na lista de barbearias do aplicativo com os horários configurados!

---

**Precisa de ajuda?** Consulte a documentação do Prisma: https://www.prisma.io/docs
