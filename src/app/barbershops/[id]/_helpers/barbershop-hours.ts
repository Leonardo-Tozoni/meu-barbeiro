// Configuração de horários por barbearia

import { db } from '@/app/_lib/prisma';

export interface BarbershopHours {
  [day: number]: {
    start: number;
    startMinutes: number;
    end: number;
    endMinutes: number;
  } | null;
}

// Configuração padrão de horários
// day: 0 = Domingo, 1 = Segunda, 2 = Terça, ..., 6 = Sábado
const defaultHours: BarbershopHours = {
  0: null, // Domingo - Fechado
  1: { start: 14, startMinutes: 0, end: 18, endMinutes: 30 }, // Segunda: 14h às 18:30
  2: { start: 14, startMinutes: 0, end: 18, endMinutes: 30 }, // Terça: 14h às 18:30
  3: { start: 14, startMinutes: 0, end: 18, endMinutes: 30 }, // Quarta: 14h às 18:30
  4: { start: 14, startMinutes: 0, end: 21, endMinutes: 0 }, // Quinta: 14h às 21h
  5: { start: 14, startMinutes: 0, end: 21, endMinutes: 0 }, // Sexta: 14h às 21h
  6: { start: 14, startMinutes: 0, end: 21, endMinutes: 0 } // Sábado: 14h às 21h
};

/**
 * Retorna a configuração de horários para uma barbearia específica do banco de dados
 * @param barbershopId - ID da barbearia
 * @returns Configuração de horários ou horários padrão
 */
export async function getBarbershopHours(
  barbershopId: string
): Promise<BarbershopHours> {
  try {
    const hours = await db.barbershopHours.findMany({
      where: { barbershopId }
    });

    if (hours.length === 0) {
      return defaultHours;
    }

    const hoursMap: BarbershopHours = {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null
    };

    hours.forEach(hour => {
      if (hour.isOpen) {
        hoursMap[hour.dayOfWeek] = {
          start: hour.startHour,
          startMinutes: hour.startMinutes,
          end: hour.endHour,
          endMinutes: hour.endMinutes
        };
      } else {
        hoursMap[hour.dayOfWeek] = null;
      }
    });

    return hoursMap;
  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    return defaultHours;
  }
}

/**
 * Retorna a configuração de horários para uma barbearia específica (versão síncrona para compatibilidade)
 * @param barbershopName - Nome da barbearia (mantido para compatibilidade, mas não é mais usado)
 * @returns Configuração de horários padrão
 * @deprecated Use getBarbershopHours com barbershopId ao invés disso
 */
export function getBarbershopHoursSync(): BarbershopHours {
  return defaultHours;
}

/**
 * Verifica se a barbearia está aberta em um determinado dia
 * @param hours - Configuração de horários
 * @param dayOfWeek - Dia da semana (0 = Domingo, 6 = Sábado)
 * @returns true se estiver aberto, false se fechado
 */
export function isBarbershopOpen(
  hours: BarbershopHours,
  dayOfWeek: number
): boolean {
  return hours[dayOfWeek] !== null;
}
