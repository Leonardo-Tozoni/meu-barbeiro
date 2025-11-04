// Configuração de horários por barbearia

export interface BarbershopHours {
  [day: number]: { start: number; startMinutes: number; end: number; endMinutes: number } | null;
}

// Configuração padrão de horários
// day: 0 = Domingo, 1 = Segunda, 2 = Terça, ..., 6 = Sábado
const defaultHours: BarbershopHours = {
  0: null, // Domingo - Fechado
  1: { start: 14, startMinutes: 0, end: 18, endMinutes: 30 }, // Segunda: 14h às 18:30
  2: { start: 14, startMinutes: 0, end: 18, endMinutes: 30 }, // Terça: 14h às 18:30
  3: { start: 14, startMinutes: 0, end: 18, endMinutes: 30 }, // Quarta: 14h às 18:30
  4: { start: 14, startMinutes: 0, end: 21, endMinutes: 0 },  // Quinta: 14h às 21h
  5: { start: 14, startMinutes: 0, end: 21, endMinutes: 0 },  // Sexta: 14h às 21h
  6: { start: 14, startMinutes: 0, end: 21, endMinutes: 0 },  // Sábado: 14h às 21h
};

// Mapeamento de horários por nome de barbearia
// Você pode adicionar configurações específicas para cada barbearia aqui
const barbershopHoursConfig: Record<string, BarbershopHours> = {
  'Be Barbeiro': defaultHours,
  // Adicione outras barbearias aqui se precisar de horários diferentes:
  // 'Nome da Outra Barbearia': {
  //   0: null, // Domingo - Fechado
  //   1: { start: 9, startMinutes: 0, end: 18, endMinutes: 0 }, // Segunda: 9h às 18h
  //   ...
  // }
};

/**
 * Retorna a configuração de horários para uma barbearia específica
 * @param barbershopName - Nome da barbearia
 * @returns Configuração de horários ou horários padrão
 */
export function getBarbershopHours(barbershopName: string): BarbershopHours {
  return barbershopHoursConfig[barbershopName] || defaultHours;
}

/**
 * Verifica se a barbearia está aberta em um determinado dia
 * @param barbershopName - Nome da barbearia
 * @param dayOfWeek - Dia da semana (0 = Domingo, 6 = Sábado)
 * @returns true se estiver aberto, false se fechado
 */
export function isBarbershopOpen(barbershopName: string, dayOfWeek: number): boolean {
  const hours = getBarbershopHours(barbershopName);
  return hours[dayOfWeek] !== null;
}
