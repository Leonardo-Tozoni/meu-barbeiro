import { SearchIcon } from 'lucide-react';
import Image from 'next/image';
import Header from './_components/Header';
import { Avatar, AvatarImage } from './_components/ui/avatar';
import { Badge } from './_components/ui/badge';
import { Button } from './_components/ui/button';
import { Card, CardContent } from './_components/ui/card';
import { Input } from './_components/ui/input';

export const Home = () => {
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

        <div className="relative mt-6 w-full h-[150px]">
          <Image
            alt="Banner slogan home page"
            src="/banner-01.png"
            fill
            className="object-cover rounded-xl"
          />
        </div>

        <Card className="mt-6">
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
      </div>
    </>
  );
};

export default Home;
