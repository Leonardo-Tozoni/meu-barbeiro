const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteUser() {
  const email = process.argv[2];

  if (!email) {
    console.log(`
📚 Uso:
  node scripts/delete-user.js <email>
  
Exemplo:
  node scripts/delete-user.js usuario@exemplo.com
  
⚠️  ATENÇÃO: Este script DELETA PERMANENTEMENTE o usuário do banco de dados!
    `);
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        barber: true,
        bookings: true,
        accounts: true,
        sessions: true
      },
    });

    if (!user) {
      console.error(`❌ Usuário com email ${email} não encontrado`);
      await prisma.$disconnect();
      return;
    }

    console.log(`\n👤 Usuário encontrado:`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role || 'Nenhum'}`);
    console.log(`   Bookings: ${user.bookings.length}`);
    console.log(`   Accounts: ${user.accounts.length}`);
    console.log(`   Sessions: ${user.sessions.length}`);
    if (user.barber) {
      console.log(`   Vínculo de barbeiro: Sim`);
    }

    console.log(`\n⚠️  DELETANDO USUÁRIO...`);

    // Deletar bookings primeiro se existirem
    if (user.bookings.length > 0) {
      await prisma.booking.deleteMany({
        where: { userId: user.id },
      });
      console.log(`   ✅ ${user.bookings.length} booking(s) deletado(s)`);
    }

    // Deletar usuário (cascade vai deletar accounts e sessions)
    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log(`\n✅ Usuário deletado com sucesso!`);
    console.log(`   Email: ${email}`);
    console.log(`\n💡 O usuário pode fazer login novamente e será criado do zero.`);

  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();
