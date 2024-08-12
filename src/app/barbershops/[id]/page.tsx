import PhoneItem from '@/app/_components/PhoneItem';
import ServiceItem from '@/app/_components/ServiceItem';
import { Button } from '@/app/_components/ui/button';
import { db } from '@/app/_lib/prisma';
import { ChevronLeftIcon, MapPinIcon, MenuIcon, StarIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface IBarbershopPageProps {
  params: {
    id: string;
  };
}

const BarbershopPage = async ({ params }: IBarbershopPageProps) => {
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
      <div className="relative w-full h-[250px]">
        <Image
          alt={barbershop.name}
          src={barbershop?.imageUrl}
          fill
          className="object-cover"
        />

        <Button
          size="icon"
          variant="secondary"
          className="absolute left-4 top-4"
          asChild
        >
          <Link href="/">
            <ChevronLeftIcon />
          </Link>
        </Button>

        <Button
          size="icon"
          variant="secondary"
          className="absolute right-4 top-4"
        >
          <MenuIcon />
        </Button>
      </div>

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
            <ServiceItem key={service.id} service={service} />
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
