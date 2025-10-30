import BarbershopItem from '@/app/(home)/_components/barbershop-item';
import Search from '@/app/(home)/_components/search';
import BookingItem from '@/app/_components/booking-item';
import Header from '@/app/_components/header';
import { convertDbDateToLocal } from '@/app/_helpers/date';
import { authOptions } from '@/app/_lib/auth';
import { db } from '@/app/_lib/prisma';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Redirecionar para onboarding se não estiver logado ou não tiver role
  if (!session?.user || !(session.user as any).role) {
    redirect('/onboarding');
  }

  const [barbershops, recommendedBarbershops, confirmedBookings] =
    await Promise.all([
      db.barbershop.findMany({}),
      db.barbershop.findMany({
        orderBy: {
          id: 'asc'
        }
      }),
      session?.user
        ? db.booking.findMany({
            where: {
              userId: (session.user as any).id,
              date: {
                gte: new Date()
              }
            },
            include: {
              service: true,
              barbershop: true
            }
          })
        : Promise.resolve([])
    ]);

  const serializedBookings = confirmedBookings.map(booking => {
    const localDate = convertDbDateToLocal(booking.date);
    return {
      ...booking,
      date: {
        year: localDate.getFullYear(),
        month: localDate.getMonth() + 1,
        day: localDate.getDate(),
        hours: localDate.getHours(),
        minutes: localDate.getMinutes()
      },
      service: {
        ...booking.service,
        price: Number(booking.service.price)
      }
    };
  });

  return (
    <div>
      <Header />

      <div className="px-5 pt-5">
        <h2 className="text-xl font-bold">
          {session?.user
            ? `Olá, ${session.user.name?.split(' ')[0]}!`
            : 'Olá! Vamos agendar um corte hoje?'}
        </h2>
        <p className="capitalize text-sm">
          {format(new Date(), "EEEE',' dd 'de' MMMM", {
            locale: ptBR
          })}
        </p>
      </div>

      <div className="px-5 mt-6">
        <Search />
      </div>

      <div className="mt-6">
        {serializedBookings.length > 0 && (
          <>
            <h2 className="pl-5 text-xs mb-3 uppercase text-gray-400 font-bold">
              Agendamentos
            </h2>
            <div className="px-5 flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
              {serializedBookings.map(booking => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-6">
        <h2 className="px-5 text-xs mb-3 uppercase text-gray-400 font-bold">
          Recomendados
        </h2>

        <div className="flex px-5 gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {barbershops.map(barbershop => (
            <div key={barbershop.id} className="min-w-[167px] max-w-[167px]">
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 mb-[4.5rem]">
        <h2 className="px-5 text-xs mb-3 uppercase text-gray-400 font-bold">
          Populares
        </h2>

        <div className="flex px-5 gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {recommendedBarbershops.map(barbershop => (
            <div key={barbershop.id} className="min-w-[167px] max-w-[167px]">
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
