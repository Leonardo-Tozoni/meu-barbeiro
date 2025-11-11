import { getBarbershopHoursMap } from '@/app/_actions/hours';
import { addMinutes, format, getDay, setHours, setMinutes } from 'date-fns';
import { type BarbershopHours } from './barbershop-hours';

export async function generateDayTimeList(
  date: Date,
  barbershopId: string
): Promise<string[]> {
  const dayOfWeek = getDay(date); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  const hours = await getBarbershopHoursMap(barbershopId);
  const dayConfig = hours[dayOfWeek];

  // Se a barbearia estiver fechada neste dia, retorna lista vazia
  if (!dayConfig) {
    return [];
  }

  const startTime = setMinutes(
    setHours(date, dayConfig.start),
    dayConfig.startMinutes
  );
  const endTime = setMinutes(
    setHours(date, dayConfig.end),
    dayConfig.endMinutes
  );
  const interval = 45; // intervalo em minutos
  const timeList: string[] = [];

  let currentTime = startTime;

  while (currentTime <= endTime) {
    timeList.push(format(currentTime, 'HH:mm'));
    currentTime = addMinutes(currentTime, interval);
  }

  return timeList;
}

// Versão síncrona para compatibilidade (usa horários padrão)
export function generateDayTimeListSync(
  date: Date,
  hours: BarbershopHours
): string[] {
  const dayOfWeek = getDay(date); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  const dayConfig = hours[dayOfWeek];

  // Se a barbearia estiver fechada neste dia, retorna lista vazia
  if (!dayConfig) {
    return [];
  }

  const startTime = setMinutes(
    setHours(date, dayConfig.start),
    dayConfig.startMinutes
  );
  const endTime = setMinutes(
    setHours(date, dayConfig.end),
    dayConfig.endMinutes
  );
  const interval = 45; // intervalo em minutos
  const timeList: string[] = [];

  let currentTime = startTime;

  while (currentTime <= endTime) {
    timeList.push(format(currentTime, 'HH:mm'));
    currentTime = addMinutes(currentTime, interval);
  }

  return timeList;
}
