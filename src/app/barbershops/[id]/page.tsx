import PhoneItem from '@/app/_components/PhoneItem';
import ServiceItem from '@/app/_components/ServiceItem';
import { authOptions } from '@/app/_lib/auth';
import { db } from '@/app/_lib/prisma';
import { MapPinIcon, StarIcon } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import BarbershopInfo from './_components/BarberShopInfo';

interface IBarbershopPageProps {
  params: {
    id: string;
  };
}

const BarbershopPage = async ({ params }: IBarbershopPageProps) => {
  const session = await getServerSession(authOptions);

  if (!params.id) {
    return null;
  }

  const barbershop = await db.barbershop.findUnique({
    where: {
      id: params.id
    },
    include: {
      services: true
    }
  });

  if (!barbershop) {
    return notFound();
  }

  return (
    <div>
      <BarbershopInfo barbershop={barbershop} />

      <div className="p-5 border-b border-solid">
        <h1 className="font-bold text-xl mb-3">{barbershop?.name}</h1>
        <div className="mb-2 flex items-center gap-1">
          <MapPinIcon className="text-primary" size={18} />
          <p className="text-sm">{barbershop?.address}</p>
        </div>

        <div className="flex items-center gap-1">
          <StarIcon className="fill-primary text-primary" size={18} />
          <p className="text-sm">5,0 (499 avaliações)</p>
        </div>
      </div>

      <div className="p-5 border-b border-solid space-y-3">
        <h1 className="font-bold uppercase text-xs text-gray-400 ">
          Sobre nós
        </h1>

        <p className="text-sm text-justify">{barbershop?.description}</p>
      </div>

      <div className="p-5 border-b border-solid space-y-3">
        <h1 className="font-bold uppercase text-xs text-gray-400 ">Serviços</h1>
        <div className="space-y-3">
          {barbershop.services.map(service => (
            <ServiceItem
              key={service.id}
              service={service}
              isAuthenticated={!!session?.user}
            />
          ))}
        </div>
      </div>

      <div className="p-5 space-y-3">
        <h1 className="font-bold uppercase text-xs text-gray-400 ">Contato</h1>
        {barbershop.phones.map(phone => (
          <PhoneItem key={phone} phone={phone} />
        ))}
      </div>
    </div>
  );
};

export default BarbershopPage;
