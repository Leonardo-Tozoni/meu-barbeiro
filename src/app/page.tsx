import { EyeIcon, FootprintsIcon, SearchIcon } from 'lucide-react';
import Image from 'next/image';
import BarbershopItem from './_components/BarbershopItem';
import Header from './_components/Header';
import { Avatar, AvatarImage } from './_components/ui/avatar';
import { Badge } from './_components/ui/badge';
import { Button } from './_components/ui/button';
import { Card, CardContent } from './_components/ui/card';
import { Input } from './_components/ui/input';
import { db } from './_lib/prisma';

export const Home = async () => {
  const barbershops = await db.barbershop.findMany({});
  const popularBarbershops = await db.barbershop.findMany({
    orderBy: {
      name: 'desc'
    }
  });

  return (
    <>
      <Header />
      <div className="p-5">
        <h2 className="text-xl font-bold">Olá, Leonardo!</h2>
        <p>Segunda-feira, 05 de agosto</p>

        <div className="mt-6 flex items-center gap-2">
          <Input placeholder="Pesquise por seu barbeiro..." />
          <Button>
            <SearchIcon />
          </Button>
        </div>

        <div className="mt-6 flex gap-3 overflow-x-scroll [&::-webkit-scrollbar]:hidden">
          <Button className="gap-2" variant="secondary">
            <Image alt="cabelo" src="/cabelo.svg" width={16} height={16} />
            Cabelo
          </Button>

          <Button className="gap-2" variant="secondary">
            <Image alt="barba" src="/barba.svg" width={16} height={16} />
            Cabelo
          </Button>

          <Button className="gap-2" variant="secondary">
            <Image
              alt="acabamento"
              src="/acabamento.svg"
              width={16}
              height={16}
            />
            Cabelo
          </Button>

          <Button className="gap-2" variant="secondary">
            <FootprintsIcon size={16} />
            Pézinho
          </Button>

          <Button className="gap-2" variant="secondary">
            <EyeIcon size={16} />
            Sobrancelha
          </Button>
        </div>

        {/* <div className="mt-6 flex gap-3 overflow-x-scroll [&::-webkit-scrollbar]:hidden">
          {quickSearchOptions.map((option) => (
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
        </div> */}

        <div className="relative mt-6 w-full h-[150px]">
          <Image
            alt="Banner slogan home page"
            src="/banner-01.png"
            fill
            className="object-cover rounded-xl"
          />
        </div>

        <h2 className="mt-6 mb-3 text-xs font-bold uppercase text-gray-400 ">
          Agendamentos
        </h2>
        <Card>
          <CardContent className="flex justify-between p-0">
            <div className="flex flex-col gap-2 py-5 pl-5">
              <Badge className="w-fit">Confirmado</Badge>
              <h3 className="font-bold">Corte de Cabelo</h3>

              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png" />
                </Avatar>
                <p className="text-sm">Tozoni BarberShop</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center px-5 border-l-2 border-solid">
              <p className="text-sm">Agosto</p>
              <p className="text-2xl">05</p>
              <p className="text-sm">20:00</p>
            </div>
          </CardContent>
        </Card>

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

      <footer>
        <Card>
          <CardContent className="px-5 py-6">
            <p className="text-sm text-gray-400">
              © 2024 Copyright <span className="font-bold">Meu Barbeiro</span>
            </p>
          </CardContent>
        </Card>
      </footer>
    </>
  );
};

export default Home;
