'use client';

import { Button } from '@/app/_components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { Badge } from '@/app/_components/ui/badge';
import { cancelSubscription } from '@/app/_actions/subscription';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type SubscriptionStatusProps = {
  subscription: {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    plan: {
      id: string;
      name: string;
      description: string | null;
      price: string;
    };
  };
};

export default function SubscriptionStatus({
  subscription,
}: SubscriptionStatusProps) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (
      !confirm(
        'Tem certeza que deseja cancelar sua assinatura? Você continuará com acesso até o fim do período atual.'
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await cancelSubscription();

      if (result.success) {
        toast.success(result.message || 'Assinatura cancelada com sucesso');
        window.location.reload();
      } else {
        toast.error(result.error || 'Erro ao cancelar assinatura');
      }
    } catch (error) {
      toast.error('Erro ao processar cancelamento');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (subscription.status === 'active' && !subscription.cancelAtPeriodEnd) {
      return (
        <Badge className="bg-green-500">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Ativa
        </Badge>
      );
    } else if (subscription.status === 'active' && subscription.cancelAtPeriodEnd) {
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
          <AlertCircle className="mr-1 h-3 w-3" />
          Cancelando ao fim do período
        </Badge>
      );
    } else if (subscription.status === 'past_due') {
      return (
        <Badge variant="outline" className="border-red-500 text-red-500">
          <XCircle className="mr-1 h-3 w-3" />
          Pagamento pendente
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          <XCircle className="mr-1 h-3 w-3" />
          {subscription.status}
        </Badge>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Status da Assinatura</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Plano: {subscription.plan.name} - R${' '}
          {Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
          }).format(Number(subscription.plan.price))}
          /mês
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Período atual:</span>
            <span className="font-medium">
              {format(new Date(subscription.currentPeriodStart), "dd 'de' MMMM", {
                locale: ptBR,
              })}{' '}
              -{' '}
              {format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM", {
                locale: ptBR,
              })}
            </span>
          </div>
          {subscription.cancelAtPeriodEnd && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Acesso até:</span>
              <span className="font-medium text-yellow-600">
                {format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM", {
                  locale: ptBR,
                })}
              </span>
            </div>
          )}
        </div>
        {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Cancelar Assinatura'
            )}
          </Button>
        )}
        {subscription.cancelAtPeriodEnd && (
          <p className="text-sm text-muted-foreground text-center">
            Sua assinatura será cancelada ao fim do período atual. Você continuará
            com acesso até{' '}
            {format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
            .
          </p>
        )}
      </CardContent>
    </Card>
  );
}

