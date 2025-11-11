import Header from '@/app/_components/header';
import { Button } from '@/app/_components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/app/_components/ui/card';
import { authOptions } from '@/app/_lib/auth';
import { db } from '@/app/_lib/prisma';
import { CheckCircle2 } from 'lucide-react';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const SuccessPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect('/');
  }

  const user = session.user as any;

  if (user.role !== 'BARBER') {
    return redirect('/');
  }

  // Wait a bit for webhook to process
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check if subscription was created
  const barber = await db.barber.findUnique({
    where: { userId: user.id },
    include: { subscription: { include: { plan: true } } },
  });

  return (
    <>
      <Header />
      <div className="px-5 py-6">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Assinatura Confirmada!</CardTitle>
              <CardDescription>
                {barber?.subscription
                  ? 'Sua assinatura foi ativada com sucesso.'
                  : 'Estamos processando sua assinatura. Você receberá um email de confirmação em breve.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {barber?.subscription && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plano:</span>
                    <span className="font-medium">{barber.subscription.plan.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-medium">
                      R${' '}
                      {Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: 2,
                      }).format(Number(barber.subscription.plan.price))}
                      /mês
                    </span>
                  </div>
                </div>
              )}
              <Button asChild className="w-full">
                <Link href="/barber-dashboard">Ir para Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/subscription">Ver Detalhes da Assinatura</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SuccessPage;

