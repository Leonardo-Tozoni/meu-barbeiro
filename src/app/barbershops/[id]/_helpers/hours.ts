import { setHours, setMinutes, format, addMinutes, getDay } from "date-fns";
import { getBarbershopHours } from "./barbershop-hours";

export function generateDayTimeList(date: Date, barbershopName: string): string[] {
  const dayOfWeek = getDay(date); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  const hours = getBarbershopHours(barbershopName);
  const dayConfig = hours[dayOfWeek];

  // Se a barbearia estiver fechada neste dia, retorna lista vazia
  if (!dayConfig) {
    return [];
  }

  const startTime = setMinutes(setHours(date, dayConfig.start), dayConfig.startMinutes);
  const endTime = setMinutes(setHours(date, dayConfig.end), dayConfig.endMinutes);
  const interval = 45; // intervalo em minutos
  const timeList: string[] = [];

  let currentTime = startTime;

  while (currentTime <= endTime) {
    timeList.push(format(currentTime, "HH:mm"));
    currentTime = addMinutes(currentTime, interval);
  }

  return timeList;
}
