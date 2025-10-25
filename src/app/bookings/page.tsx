import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import BookingItem from "../_components/booking-item";
import Header from "../_components/header";
import { authOptions } from "../_lib/auth";
import { db } from "../_lib/prisma";

const BookingsPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect("/");
  }

  // Se não é cliente, redirecionar
  if ((session.user as any).role !== "CLIENT") {
    return redirect("/");
  }

  const [confirmedBookings, finishedBookings] = await Promise.all([
    db.booking.findMany({
      where: {
        userId: (session.user as any).id,
        date: {
          gte: new Date(),
        },
      },
      include: {
        service: true,
        barbershop: true,
      },
    }),
    db.booking.findMany({
      where: {
        userId: (session.user as any).id,
        date: {
          lt: new Date(),
        },
      },
      include: {
        service: true,
        barbershop: true,
      },
    }),
  ]);

  // Converter Decimal para number
  const confirmedBookingsWithPrice = confirmedBookings.map((booking) => ({
    ...booking,
    service: {
      ...booking.service,
      price: Number(booking.service.price),
    },
  }));

  const finishedBookingsWithPrice = finishedBookings.map((booking) => ({
    ...booking,
    service: {
      ...booking.service,
      price: Number(booking.service.price),
    },
  }));

  return (
    <>
      <Header />

      <div className="px-5 py-6">
        <h1 className="text-xl font-bold mb-6">Agendamentos</h1>

        {confirmedBookingsWithPrice.length > 0 && (
          <>
            <h2 className="text-gray-400 uppercase font-bold text-sm mb-3">Confirmados</h2>

            <div className="flex flex-col gap-3">
              {confirmedBookingsWithPrice.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </>
        )}

        {finishedBookingsWithPrice.length > 0 && (
          <>
            <h2 className="text-gray-400 uppercase font-bold text-sm mt-6 mb-3">Finalizados</h2>

            <div className="flex flex-col gap-3">
              {finishedBookingsWithPrice.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BookingsPage;
