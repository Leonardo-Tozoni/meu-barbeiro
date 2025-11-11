import { getSubscriptionStatus } from '@/app/_actions/subscription';
import Header from '@/app/_components/header';
import SubscriptionPlans from '@/app/_components/subscription-plans';
import SubscriptionStatus from '@/app/_components/subscription-status';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/app/_components/ui/card';
import { authOptions } from '@/app/_lib/auth';
import { db } from '@/app/_lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

const SubscriptionPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect('/');
  }

  const user = session.user as any;

  if (user.role !== 'BARBER') {
    return redirect('/');
  }

  // Get active plan
  const plan = await db.plan.findFirst({
    where: { active: true },
  });

  // Get subscription status
  const subscriptionResult = await getSubscriptionStatus();

  return (
    <>
      <Header />
      <div className="px-5 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Assinatura</h1>
            <p className="text-muted-foreground">
              Gerencie sua assinatura e tenha acesso completo à plataforma
            </p>
          </div>

          {subscriptionResult.success && subscriptionResult.data.hasSubscription ? (
            <SubscriptionStatus
              subscription={subscriptionResult.data.subscription}
            />
          ) : plan ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Escolha seu Plano</CardTitle>
                  <CardDescription>
                    Assine agora e tenha acesso completo à plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscriptionPlans
                    plan={{
                      id: plan.id,
                      name: plan.name,
                      description: plan.description || null,
                      price: plan.price.toString(),
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Nenhum plano disponível no momento. Entre em contato com o
                  suporte.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default SubscriptionPage;

