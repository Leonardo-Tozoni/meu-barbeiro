'use server';

import { db } from '@/app/_lib/prisma';
import { revalidatePath } from 'next/cache';

export interface BarbershopHoursData {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  startHour: number;
  startMinutes: number;
  endHour: number;
  endMinutes: number;
  isOpen: boolean;
}

export const saveBarbershopHours = async (
  barbershopId: string,
  hours: BarbershopHoursData[]
) => {
  try {
    // Deletar horários existentes para esta barbearia
    await db.barbershopHours.deleteMany({
      where: { barbershopId }
    });

    // Criar novos horários
    await db.barbershopHours.createMany({
      data: hours.map(hour => ({
        barbershopId,
        dayOfWeek: hour.dayOfWeek,
        startHour: hour.startHour,
        startMinutes: hour.startMinutes,
        endHour: hour.endHour,
        endMinutes: hour.endMinutes,
        isOpen: hour.isOpen
      }))
    });

    revalidatePath('/barber-dashboard');
    revalidatePath(`/barbershops/${barbershopId}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar horários:', error);
    return { success: false, error: 'Erro ao salvar horários' };
  }
};

export const getBarbershopHours = async (barbershopId: string) => {
  try {
    const hours = await db.barbershopHours.findMany({
      where: { barbershopId },
      orderBy: { dayOfWeek: 'asc' }
    });

    return hours;
  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    return [];
  }
};

export interface BarbershopHoursMap {
  [day: number]: {
    start: number;
    startMinutes: number;
    end: number;
    endMinutes: number;
  } | null;
}

// Configuração padrão de horários
const defaultHours: BarbershopHoursMap = {
  0: null, // Domingo - Fechado
  1: { start: 14, startMinutes: 0, end: 18, endMinutes: 30 }, // Segunda: 14h às 18:30
  2: { start: 14, startMinutes: 0, end: 18, endMinutes: 30 }, // Terça: 14h às 18:30
  3: { start: 14, startMinutes: 0, end: 18, endMinutes: 30 }, // Quarta: 14h às 18:30
  4: { start: 14, startMinutes: 0, end: 21, endMinutes: 0 }, // Quinta: 14h às 21h
  5: { start: 14, startMinutes: 0, end: 21, endMinutes: 0 }, // Sexta: 14h às 21h
  6: { start: 14, startMinutes: 0, end: 21, endMinutes: 0 } // Sábado: 14h às 21h
};

/**
 * Retorna a configuração de horários para uma barbearia específica no formato usado pelo sistema de agendamento
 */
export const getBarbershopHoursMap = async (
  barbershopId: string
): Promise<BarbershopHoursMap> => {
  try {
    const hours = await db.barbershopHours.findMany({
      where: { barbershopId }
    });

    if (hours.length === 0) {
      return defaultHours;
    }

    const hoursMap: BarbershopHoursMap = {
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
};
