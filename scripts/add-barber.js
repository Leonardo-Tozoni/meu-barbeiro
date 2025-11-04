const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addBarber() {
  try {
    // Buscar Barbearia Vintage
    const barbershop = await prisma.barbershop.findFirst({
      where: {
        name: {
          contains: 'Vintage',
          mode: 'insensitive'
        }
      }
    });

    if (!barbershop) {
      console.error('❌ Barbearia Vintage não encontrada');
      await prisma.$disconnect();
      return;
    }

    console.log(`\n📍 Barbearia encontrada:`);
    console.log(`   Nome: ${barbershop.name}`);
    console.log(`   ID: ${barbershop.id}`);
    console.log(`   Endereço: ${barbershop.address}\n`);

    const email = 'testebarber0@gmail.com';

    // Buscar ou criar usuário
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`📝 Criando novo usuário com email: ${email}`);
      user = await prisma.user.create({
        data: {
          email,
          name: 'Barbeiro Teste',
          role: 'BARBER'
        }
      });
      console.log(`✅ Usuário criado com sucesso`);
    } else {
      console.log(`👤 Usuário encontrado: ${user.name || user.email}`);
      
      // Atualizar role se necessário
      if (user.role !== 'BARBER') {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'BARBER' }
        });
        console.log(`✅ Role atualizado para BARBER`);
      }
    }

    // Verificar se já é barbeiro
    const existingBarber = await prisma.barber.findUnique({
      where: { userId: user.id }
    });

    if (existingBarber) {
      const currentBarbershop = await prisma.barbershop.findUnique({
        where: { id: existingBarber.barbershopId }
      });
      console.log(`\n⚠️  Usuário já é barbeiro de: ${currentBarbershop.name}`);
      
      // Atualizar para nova barbearia
      await prisma.barber.update({
        where: { id: existingBarber.id },
        data: { barbershopId: barbershop.id }
      });
      console.log(`✅ Barbearia atualizada para: ${barbershop.name}`);
    } else {
      // Criar novo barbeiro
      await prisma.barber.create({
        data: {
          userId: user.id,
          barbershopId: barbershop.id
        }
      });
      console.log(`✅ Barbeiro criado e vinculado à ${barbershop.name}`);
    }

    console.log(`\n🎉 Configuração concluída!`);
    console.log(`   Email: ${email}`);
    console.log(`   Barbearia: ${barbershop.name}`);
    console.log(`\n💡 Faça login com este email via Google OAuth para acessar o dashboard`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addBarber();
