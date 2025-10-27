"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { UserIcon, ScissorsIcon, Loader2 } from "lucide-react";
import { setUserAsClient, setUserAsBarber, getAllBarbershops } from "@/app/_actions/onboarding";
import { toast } from "sonner";
import Image from "next/image";
import { useEffect } from "react";

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
  const [step, setStep] = useState<"role" | "barbershop">("role");
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBarbershops, setLoadingBarbershops] = useState(false);

  useEffect(() => {
    // Se o usuário já tem role, redirecionar
    if (session?.user && (session.user as any).role) {
      const role = (session.user as any).role;
      if (role === "CLIENT") {
        router.push("/");
      } else if (role === "BARBER") {
        router.push("/barber-dashboard");
      }
    }
  }, [session, router]);

  const handleClientSelection = async () => {
    if (!session?.user) return;

    setLoading(true);
    const result = await setUserAsClient((session.user as any).id);

    if (result.success) {
      toast.success("Bem-vindo! Você pode fazer seus agendamentos agora.");
      // Atualizar session e aguardar
      await update();
      // Aguardar um pouco para garantir que a session foi atualizada
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push("/");
      router.refresh();
    } else {
      toast.error(result.error || "Erro ao configurar sua conta");
    }
    setLoading(false);
  };

  const handleBarberSelection = async () => {
    setLoadingBarbershops(true);
    const data = await getAllBarbershops();
    setBarbershops(data);
    setLoadingBarbershops(false);
    setStep("barbershop");
  };

  const handleBarbershopSelection = async (barbershopId: string) => {
    if (!session?.user) return;

    setLoading(true);
    const result = await setUserAsBarber((session.user as any).id, barbershopId);

    if (result.success) {
      toast.success("Parabéns! Sua barbearia foi vinculada com sucesso.");
      // Atualizar session e aguardar
      await update();
      // Aguardar um pouco para garantir que a session foi atualizada
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push("/barber-dashboard");
      router.refresh();
    } else {
      toast.error(result.error || "Erro ao vincular barbearia");
    }
    setLoading(false);
  };

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-5 bg-background">
      <div className="w-full max-w-2xl">
        {step === "role" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Bem-vindo ao Meu Barbeiro!</CardTitle>
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Selecione sua Barbearia</CardTitle>
              <CardDescription>
                Escolha a barbearia que você irá gerenciar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {barbershops.map((barbershop) => (
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
                onClick={() => setStep("role")}
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
