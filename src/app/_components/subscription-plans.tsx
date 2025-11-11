'use client';

import { Button } from '@/app/_components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { createCheckoutSession } from '@/app/_actions/subscription';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: string;
};

type SubscriptionPlansProps = {
  plan: Plan;
};

export default function SubscriptionPlans({ plan }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const result = await createCheckoutSession();

      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.error || 'Erro ao criar sessão de checkout');
      }
    } catch (error) {
      toast.error('Erro ao processar assinatura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        {plan.description && (
          <CardDescription>{plan.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <span className="text-4xl font-bold">
            R${' '}
            {Intl.NumberFormat('pt-BR', {
              minimumFractionDigits: 2,
            }).format(Number(plan.price))}
          </span>
          <span className="text-muted-foreground">/mês</span>
        </div>
        <Button
          className="w-full"
          onClick={handleSubscribe}
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            'Assinar Agora'
          )}
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Assinatura mensal recorrente. Cancele a qualquer momento.
        </p>
      </CardContent>
    </Card>
  );
}

