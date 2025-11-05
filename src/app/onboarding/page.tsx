'use client';

import {
  createBarbershopAndSetBarber,
  getAllBarbershops,
  setUserAsBarber,
  setUserAsClient
} from '@/app/_actions/onboarding';
import ImageUpload from '@/app/_components/image-upload';
import { Button } from '@/app/_components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/_components/ui/card';
import { Input } from '@/app/_components/ui/input';
import { Label } from '@/app/_components/ui/label';
import { Loader2, LogIn, Plus, ScissorsIcon, UserIcon } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Barbershop = {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  _count: {
    barbers: number;
  };
};

const OnboardingPage = () => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<'role' | 'barbershop' | 'createBarbershop'>(
    'role'
  );
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBarbershops, setLoadingBarbershops] = useState(false);
  const [barbershopForm, setBarbershopForm] = useState({
    name: '',
    address: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;

      if (user.role === 'CLIENT') {
        router.push('/');
      } else if (user.role === 'BARBER' && user.barbershopId) {
        router.push('/barber-dashboard');
      }
    }
  }, [session, router]);

  const handleClientSelection = async () => {
    if (!session?.user) return;

    setLoading(true);
    const result = await setUserAsClient((session.user as any).id);

    if (result.success) {
      toast.success('Bem-vindo! Você pode fazer seus agendamentos agora.');
      await update();
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/');
      router.refresh();
    } else {
      toast.error(result.error || 'Erro ao configurar sua conta');
    }
    setLoading(false);
  };

  const handleBarberSelection = async () => {
    setLoadingBarbershops(true);
    const data = await getAllBarbershops();
    setBarbershops(data);
    setLoadingBarbershops(false);
    setStep('barbershop');
  };

  const handleBarbershopSelection = async (barbershopId: string) => {
    if (!session?.user) return;

    setLoading(true);
    const result = await setUserAsBarber(
      (session.user as any).id,
      barbershopId
    );

    if (result.success) {
      toast.success('Parabéns! Sua barbearia foi vinculada com sucesso.');
      await update();
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/barber-dashboard');
      router.refresh();
    } else {
      toast.error(result.error || 'Erro ao vincular barbearia');
    }
    setLoading(false);
  };

  const handleCreateBarbershop = async () => {
    if (!session?.user) return;

    if (
      !barbershopForm.name ||
      !barbershopForm.address ||
      !barbershopForm.imageUrl
    ) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    const result = await createBarbershopAndSetBarber(
      (session.user as any).id,
      barbershopForm
    );

    if (result.success) {
      toast.success('Parabéns! Sua barbearia foi criada com sucesso.');
      await update();
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/barber-dashboard');
      router.refresh();
    } else {
      toast.error(result.error || 'Erro ao criar barbearia');
    }
    setLoading(false);
  };

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-background">
        <Image
          src="/logo.png"
          alt="Meu barbeiro"
          height={30}
          width={200}
          className="mb-4"
        />
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Bem-vindo ao Meu Barbeiro!
            </CardTitle>
            <CardDescription className="text-center">
              Para começar, faça login com sua conta Google
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => signIn('google')}>
              <LogIn className="mr-2" size={20} />
              Entrar com Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-background">
      <Image
        src="/logo.png"
        alt="Meu barbeiro"
        height={30}
        width={200}
        className="mb-4"
      />
      <div className="w-full max-w-2xl">
        {step === 'role' ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Bem-vindo ao Meu Barbeiro!
              </CardTitle>
              <CardDescription>
                Para começar, precisamos saber como você vai usar a plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2"
                onClick={handleClientSelection}
                disabled={loading}
              >
                <UserIcon size={32} />
                <div className="text-left">
                  <p className="font-bold">Sou Cliente</p>
                  <p className="text-sm text-muted-foreground">
                    Quero agendar serviços em barbearias
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2"
                onClick={handleBarberSelection}
                disabled={loading || loadingBarbershops}
              >
                {loadingBarbershops ? (
                  <Loader2 className="animate-spin" size={32} />
                ) : (
                  <ScissorsIcon size={32} />
                )}
                <div className="text-left">
                  <p className="font-bold">Sou Barbeiro</p>
                  <p className="text-sm text-muted-foreground">
                    Quero gerenciar minha barbearia
                  </p>
                </div>
              </Button>
            </CardContent>
          </Card>
        ) : step === 'barbershop' ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Selecione sua Barbearia
              </CardTitle>
              <CardDescription>
                Escolha a barbearia que você irá gerenciar ou crie uma nova
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="default"
                className="w-full"
                onClick={() => setStep('createBarbershop')}
                disabled={loading}
              >
                <Plus className="mr-2" size={20} />
                Criar Nova Barbearia
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou selecione uma existente
                  </span>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-3">
                {barbershops.map(barbershop => (
                  <Button
                    key={barbershop.id}
                    variant="outline"
                    className="w-full h-auto p-3 flex items-center gap-3 justify-start"
                    onClick={() => handleBarbershopSelection(barbershop.id)}
                    disabled={loading || barbershop._count.barbers > 0}
                  >
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={barbershop.imageUrl}
                        alt={barbershop.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold">{barbershop.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {barbershop.address}
                      </p>
                      {barbershop._count.barbers > 0 && (
                        <p className="text-xs text-red-500 mt-1">
                          Já possui barbeiro vinculado
                        </p>
                      )}
                    </div>
                  </Button>
                ))}
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep('role')}
                disabled={loading}
              >
                Voltar
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Criar Nova Barbearia</CardTitle>
              <CardDescription>
                Preencha os dados da sua barbearia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Barbearia</Label>
                <Input
                  id="name"
                  placeholder="Ex: Barbearia do João"
                  value={barbershopForm.name}
                  onChange={e =>
                    setBarbershopForm({
                      ...barbershopForm,
                      name: e.target.value
                    })
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  placeholder="Ex: Rua das Flores, 123 - Centro"
                  value={barbershopForm.address}
                  onChange={e =>
                    setBarbershopForm({
                      ...barbershopForm,
                      address: e.target.value
                    })
                  }
                  disabled={loading}
                />
              </div>

              <ImageUpload
                label="Imagem da Barbearia"
                value={barbershopForm.imageUrl}
                onChange={value =>
                  setBarbershopForm({ ...barbershopForm, imageUrl: value })
                }
                disabled={loading}
              />

              <Button
                className="w-full"
                onClick={handleCreateBarbershop}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : null}
                Criar Barbearia
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep('barbershop')}
                disabled={loading}
              >
                Voltar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
