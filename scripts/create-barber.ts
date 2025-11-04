import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createBarber(email: string, barbershopId: string) {
  try {
    // Verificar se a barbearia existe
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
    });

    if (!barbershop) {
      console.error(`❌ Barbearia com ID ${barbershopId} não encontrada`);
      return;
    }

    // Buscar ou criar usuário
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`📝 Usuário não encontrado. Criando novo usuário...`);
      user = await prisma.user.create({
        data: {
          email,
          name: `Barbeiro ${barbershop.name}`,
          role: "BARBER",
        },
      });
      console.log(`✅ Usuário criado: ${user.email}`);
    } else {
      // Atualizar role se necessário
      if (user.role !== "BARBER") {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: "BARBER" },
        });
        console.log(`✅ Role do usuário atualizado para BARBER`);
      }
    }

    // Verificar se já existe um registro de barbeiro
    const existingBarber = await prisma.barber.findUnique({
      where: { userId: user.id },
    });

    if (existingBarber) {
      console.log(`⚠️  Usuário já é barbeiro da barbearia: ${barbershop.name}`);
      return;
    }

    // Criar registro de barbeiro
    await prisma.barber.create({
      data: {
        userId: user.id,
        barbershopId: barbershop.id,
      },
    });

    console.log(`\n✅ Barbeiro criado com sucesso!`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Barbearia: ${barbershop.name}`);
    console.log(`   Endereço: ${barbershop.address}`);
  } catch (error) {
    console.error("❌ Erro ao criar barbeiro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Função para listar barbearias
async function listBarbershops() {
  try {
    const barbershops = await prisma.barbershop.findMany({
      select: {
        id: true,
        name: true,
        address: true,
      },
    });

    console.log("\n📍 Barbearias disponíveis:\n");
    barbershops.forEach((barbershop, index) => {
      console.log(`${index + 1}. ${barbershop.name}`);
      console.log(`   ID: ${barbershop.id}`);
      console.log(`   Endereço: ${barbershop.address}\n`);
    });
  } catch (error) {
    console.error("❌ Erro ao listar barbearias:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
const command = args[0];

if (command === "list") {
  listBarbershops();
} else if (command === "create") {
  const email = args[1];
  const barbershopId = args[2];

  if (!email || !barbershopId) {
    console.log(`
📚 Uso:
  
  Listar barbearias:
    npm run create-barber list
    
  Criar barbeiro:
    npm run create-barber create <email> <barbershop-id>
    
  Exemplo:
    npm run create-barber create barbeiro@exemplo.com abc-123-def-456
    `);
    process.exit(1);
  }

  createBarber(email, barbershopId);
} else {
  console.log(`
📚 Comandos disponíveis:
  
  list   - Lista todas as barbearias disponíveis
  create - Cria um novo barbeiro
  
  Uso:
    npm run create-barber list
    npm run create-barber create <email> <barbershop-id>
  `);
}
