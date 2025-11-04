const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetUserRole() {
  const email = process.argv[2];

  if (!email) {
    console.log(`
📚 Uso:
  node scripts/reset-user-role.js <email>
  
Exemplo:
  node scripts/reset-user-role.js usuario@exemplo.com
  
Este script remove o role e vínculo de barbeiro de um usuário,
permitindo que ele passe pelo onboarding novamente.
    `);
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { barber: true },
    });

    if (!user) {
      console.error(`❌ Usuário com email ${email} não encontrado`);
      await prisma.$disconnect();
      return;
    }

    console.log(`\n👤 Usuário encontrado:`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role atual: ${user.role || 'Nenhum'}`);

    if (user.barber) {
      console.log(`   Barbearia vinculada: Sim`);
      
      // Remover vínculo de barbeiro
      await prisma.barber.delete({
        where: { userId: user.id },
      });
      console.log(`\n✅ Vínculo de barbeiro removido`);
    }

    // Remover role
    await prisma.user.update({
      where: { id: user.id },
      data: { role: null },
    });

    console.log(`✅ Role removido`);
    console.log(`\n🎉 Usuário resetado com sucesso!`);
    console.log(`   Na próxima vez que ${user.name} fizer login,`);
    console.log(`   será redirecionado para o onboarding.`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetUserRole();
