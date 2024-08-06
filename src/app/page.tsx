import { SearchIcon } from 'lucide-react';
import Image from 'next/image';
import Header from './_components/Header';
import { Button } from './_components/ui/button';
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
      </div>
    </>
  );
};

export default Home;
