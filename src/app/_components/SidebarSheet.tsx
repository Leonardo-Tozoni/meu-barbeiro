import { CalendarIcon, HomeIcon, LogInIcon, LogOutIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { quickSearchOptions } from '../_constants/search';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';
import { SheetClose, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';

const SidebarSheet = () => {
  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="text-left">Menu</SheetTitle>
      </SheetHeader>

      <div className="py-5 flex justify-between items-center border-b border-solid gap-3">
        <h2 className="font-bold">Olá, faça seu login!</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon">
              <LogInIcon />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] rounded-lg">
            <DialogHeader>
              <DialogTitle>Faça login na plataforma</DialogTitle>
              <DialogDescription>
                Conecte-se usando sua conta do Google
              </DialogDescription>
              <Button variant="outline" className="flex gap-2 font-bold">
                <Image
                  alt="Logo do google"
                  src="/google.svg"
                  width={18}
                  height={18}
                />
                Google
              </Button>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        {/* <Avatar>
          <AvatarImage src="https://github.com/leonardo-tozoni.png" />
        </Avatar>

        <div>
          <p className="font-bold">Leonardo Tozoni</p>
          <p className="text-xs">leocebe2000@gmail.com</p>
        </div> */}
      </div>

      <div className="py-5 flex flex-col gap-2 border-b border-solid">
        <SheetClose asChild>
          <Button variant="ghost" className="gap-2 justify-start" asChild>
            <Link href="/">
              <HomeIcon size={18} />
              Início
            </Link>
          </Button>
        </SheetClose>
        <Button variant="ghost" className="gap-2 justify-start">
          <CalendarIcon size={18} />
          Agendamentos
        </Button>
      </div>

      <div className="py-5 flex flex-col gap-2 border-b border-solid">
        {quickSearchOptions.map(option => (
          <Button
            key={option.title}
            variant="ghost"
            className="gap-2 justify-start"
          >
            <Image
              alt={option.title}
              src={option.imageUrl}
              height={18}
              width={18}
            />
            {option.title}
          </Button>
        ))}
      </div>

      <div className="py-5 flex flex-col gap-2 border-b border-solid">
        <Button variant="ghost" className="justify-start gap-2">
          <LogOutIcon size={18} />
          Sair
        </Button>
      </div>
    </SheetContent>
  );
};

export default SidebarSheet;
