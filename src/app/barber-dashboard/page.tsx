import {
  getTodayBarbershopBookings,
  getUpcomingBarbershopBookings
} from '@/app/_actions/get-barbershop-bookings';
import Header from '@/app/_components/header';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/app/_components/ui/avatar';
import { Badge } from '@/app/_components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/app/_components/ui/card';
import { authOptions } from '@/app/_lib/auth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

const reconstructDate = (dateComponents: {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
}) => {
  return new Date(
    dateComponents.year,
    dateComponents.month - 1,
    dateComponents.day,
    dateComponents.hours,
    dateComponents.minutes,
    0,
    0
  );
};

const BarberDashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect('/');
  }
  if ((session.user as any).role !== 'BARBER') {
    return redirect('/');
  }

  const barbershopId = (session.user as any).barbershopId;

  if (!barbershopId) {
    return redirect('/');
  }

  const [todayBookings, upcomingBookings] = await Promise.all([
    getTodayBarbershopBookings(barbershopId),
    getUpcomingBarbershopBookings(barbershopId)
  ]);

  const futureBookings = upcomingBookings.filter(booking => {
    const bookingDate = reconstructDate(booking.date as any);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return bookingDate >= tomorrow;
  });

  return (
    <>
      <Header />

      <div className="px-5 py-6">
        <h1 className="text-xl font-bold mb-6">Dashboard do Barbeiro</h1>

        {/* Agendamentos de Hoje */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Agendamentos de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            {todayBookings.length === 0 ? (
              <p className="text-sm text-gray-400">
                Nenhum agendamento para hoje.
              </p>
            ) : (
              <div className="space-y-4">
                {todayBookings.map(booking => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between border-b border-solid border-secondary pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={booking.user.image || ''} />
                        <AvatarFallback>
                          {booking.user.name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{booking.user.name}</p>
                        <p className="text-sm text-gray-400">
                          {booking.service.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {format(reconstructDate(booking.date as any), 'HH:mm', {
                          locale: ptBR
                        })}
                      </p>
                      <p className="text-sm text-gray-400">
                        R${' '}
                        {Intl.NumberFormat('pt-BR', {
                          minimumFractionDigits: 2
                        }).format(Number(booking.service.price))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximos Agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {futureBookings.length === 0 ? (
              <p className="text-sm text-gray-400">
                Nenhum agendamento futuro.
              </p>
            ) : (
              <div className="space-y-4">
                {futureBookings.map(booking => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between border-b border-solid border-secondary pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={booking.user.image || ''} />
                        <AvatarFallback>
                          {booking.user.name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{booking.user.name}</p>
                        <p className="text-sm text-gray-400">
                          {booking.service.name}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {format(
                            reconstructDate(booking.date as any),
                            "dd 'de' MMMM",
                            { locale: ptBR }
                          )}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {format(reconstructDate(booking.date as any), 'HH:mm', {
                          locale: ptBR
                        })}
                      </p>
                      <p className="text-sm text-gray-400">
                        R${' '}
                        {Intl.NumberFormat('pt-BR', {
                          minimumFractionDigits: 2
                        }).format(Number(booking.service.price))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default BarberDashboardPage;
