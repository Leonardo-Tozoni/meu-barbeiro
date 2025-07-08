import { SearchIcon } from 'lucide-react';
import { getServerSession } from 'next-auth';
import Image from 'next/image';
import BarbershopItem from './_components/BarbershopItem';
import BookingItem from './_components/BookingItem';
import Header from './_components/Header';
import { Button } from './_components/ui/button';
import { Input } from './_components/ui/input';
import { quickSearchOptions } from './_constants/search';
import { db } from './_lib/prisma';
import { authOptions } from './api/auth/[...nextauth]/route';

export const Home = async () => {
  const session = await getServerSession(authOptions);
  const barbershops = await db.barbershop.findMany({});
  const popularBarbershops = await db.barbershop.findMany({
    orderBy: {
      name: 'desc'
    }
  });

  console.log('Session:', session);

  return (
    <>
      <Header />
      <div className="p-5">
        {!!session?.user?.name && session.user.name.length > 0 ? (
          <h2 className="text-xl font-bold">Olá, {session?.user?.name}!</h2>
        ) : (
          <h2 className="text-xl font-bold">Olá, visitante!</h2>
        )}
        <p>Segunda-feira, 05 de agosto</p>

        <div className="mt-6 flex items-center gap-2">
          <Input placeholder="Pesquise por seu barbeiro..." />
          <Button>
            <SearchIcon />
          </Button>
        </div>

        <div className="mt-6 flex gap-3 overflow-x-scroll [&::-webkit-scrollbar]:hidden">
          {quickSearchOptions.map(option => (
            <Button className="gap-2" variant="secondary" key={option.title}>
              <Image
                src={option.imageUrl}
                width={16}
                height={16}
                alt={option.title}
              />
              {option.title}
            </Button>
          ))}
        </div>

        <div className="relative mt-6 w-full h-[150px]">
          <Image
            alt="Banner slogan home page"
            src="/banner-01.png"
            fill
            className="object-cover rounded-xl"
          />
        </div>

        <BookingItem />

        <h2 className="mt-6 mb-3 text-xs font-bold uppercase text-gray-400 ">
          Recomendados
        </h2>
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {barbershops.map(barbershop => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>

        <h2 className="mt-6 mb-3 text-xs font-bold uppercase text-gray-400 ">
          Populares
        </h2>
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {popularBarbershops.map(popular => (
            <BarbershopItem key={popular.id} barbershop={popular} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
