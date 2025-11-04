"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const RoleChecker = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    // Não redirecionar se já estiver na página de onboarding
    if (pathname === "/onboarding") return;

    if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role;
      
      // Se o usuário não tem role definido, redirecionar para onboarding
      if (!role) {
        router.push("/onboarding");
      }
    }
  }, [session, status, router, pathname]);

  // Mostrar loading enquanto verifica
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  // Se o usuário está autenticado mas não tem role e não está na página de onboarding
  if (
    status === "authenticated" && 
    session?.user && 
    !(session.user as any).role && 
    pathname !== "/onboarding"
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleChecker;
