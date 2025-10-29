/**
 * Cria uma data mantendo o horário local exato.
 * Útil para garantir que o horário selecionado pelo usuário seja preservado.
 * 
 * @param date - Data base
 * @param hours - Hora (0-23)
 * @param minutes - Minutos (0-59)
 * @returns Date com o horário exato especificado no timezone local
 */
export function createDateWithLocalTime(date: Date, hours: number, minutes: number): Date {
  // Cria uma nova data a partir da data base
  const newDate = new Date(date);
  
  // Define o horário específico no timezone local
  newDate.setHours(hours, minutes, 0, 0);
  
  return newDate;
}

/**
 * Converte uma Date para componentes individuais de data/hora.
 * Isso evita conversões automáticas de timezone.
 * 
 * @param date - Data para converter
 * @returns Objeto com ano, mês, dia, hora e minutos
 */
export function dateToComponents(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // JavaScript months são 0-indexed
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
  };
}

/**
 * Converte uma Date do banco (armazenada como UTC) para Date interpretada como horário local.
 * O banco armazena "15:30" como UTC, mas queremos tratar como se fosse horário local.
 * 
 * @param dateFromDb - Data vinda do banco de dados
 * @returns Date com os mesmos valores de hora/minuto, mas interpretada como horário local
 */
export function convertDbDateToLocal(dateFromDb: Date): Date {
  // Pega os valores UTC do banco
  const year = dateFromDb.getUTCFullYear();
  const month = dateFromDb.getUTCMonth();
  const day = dateFromDb.getUTCDate();
  const hours = dateFromDb.getUTCHours();
  const minutes = dateFromDb.getUTCMinutes();
  
  // Cria uma nova Date interpretando esses valores como horário local
  return new Date(year, month, day, hours, minutes, 0, 0);
}
