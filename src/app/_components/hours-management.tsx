'use client';

import { getBarbershopHours, saveBarbershopHours } from '@/app/_actions/hours';
import { Button } from '@/app/_components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/_components/ui/card';
import { Input } from '@/app/_components/ui/input';
import { Label } from '@/app/_components/ui/label';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type HoursManagementProps = {
  barbershopId: string;
};

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

const HoursManagement = ({ barbershopId }: HoursManagementProps) => {
  const [hours, setHours] = useState<
    Array<{
      dayOfWeek: number;
      startHour: number;
      startMinutes: number;
      endHour: number;
      endMinutes: number;
      isOpen: boolean;
    }>
  >(
    DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.value,
      startHour: day.value === 0 ? 0 : 14,
      startMinutes: 0,
      endHour: day.value === 0 ? 0 : 18,
      endMinutes: day.value === 0 ? 0 : 30,
      isOpen: day.value !== 0
    }))
  );
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadHours = async () => {
      try {
        const savedHours = await getBarbershopHours(barbershopId);
        
        if (savedHours.length > 0) {
          // Mapear horários salvos
          const hoursMap = new Map(
            savedHours.map(h => [h.dayOfWeek, h])
          );
          
          setHours(
            DAYS_OF_WEEK.map(day => {
              const saved = hoursMap.get(day.value);
              if (saved) {
                return {
                  dayOfWeek: saved.dayOfWeek,
                  startHour: saved.startHour,
                  startMinutes: saved.startMinutes,
                  endHour: saved.endHour,
                  endMinutes: saved.endMinutes,
                  isOpen: saved.isOpen
                };
              }
              return {
                dayOfWeek: day.value,
                startHour: day.value === 0 ? 0 : 14,
                startMinutes: 0,
                endHour: day.value === 0 ? 0 : 18,
                endMinutes: day.value === 0 ? 0 : 30,
                isOpen: day.value !== 0
              };
            })
          );
        }
      } catch (error) {
        console.error('Erro ao carregar horários:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadHours();
  }, [barbershopId]);

  const updateHour = (
    dayOfWeek: number,
    field: 'startHour' | 'startMinutes' | 'endHour' | 'endMinutes' | 'isOpen',
    value: number | boolean
  ) => {
    setHours(prev =>
      prev.map(h =>
        h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
      )
    );
  };

  const formatTime = (hour: number, minutes: number): string => {
    return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const parseTime = (time: string): { hour: number; minutes: number } => {
    const [hour, minutes] = time.split(':').map(Number);
    return { hour: hour || 0, minutes: minutes || 0 };
  };

  const handleTimeChange = (
    dayOfWeek: number,
    type: 'start' | 'end',
    time: string
  ) => {
    const { hour, minutes } = parseTime(time);
    updateHour(dayOfWeek, type === 'start' ? 'startHour' : 'endHour', hour);
    updateHour(
      dayOfWeek,
      type === 'start' ? 'startMinutes' : 'endMinutes',
      minutes
    );
  };

  const handleSubmit = async () => {
    // Validação básica
    for (const hour of hours) {
      if (hour.isOpen) {
        const startTotal = hour.startHour * 60 + hour.startMinutes;
        const endTotal = hour.endHour * 60 + hour.endMinutes;

        if (startTotal >= endTotal) {
          toast.error(
            `Horário inválido para ${DAYS_OF_WEEK[hour.dayOfWeek].label}. O horário de início deve ser anterior ao horário de término.`
          );
          return;
        }
      }
    }

    setLoading(true);
    const result = await saveBarbershopHours(barbershopId, hours);

    if (result.success) {
      toast.success('Horários salvos com sucesso!');
    } else {
      toast.error(result.error || 'Erro ao salvar horários');
    }

    setLoading(false);
  };

  if (initialLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin" size={24} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="px-4 sm:px-6">
        <div>
          <CardTitle className="text-lg sm:text-xl">Horários de Funcionamento</CardTitle>
          <CardDescription className="text-sm sm:text-base mt-1">
            Configure os horários de disponibilidade da sua barbearia
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-3 sm:space-y-4">
          {DAYS_OF_WEEK.map(day => {
            const hour = hours.find(h => h.dayOfWeek === day.value);
            if (!hour) return null;

            return (
              <div
                key={day.value}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-solid border-secondary rounded-lg bg-secondary/5"
              >
                <div className="flex items-center justify-between sm:justify-start gap-3 sm:w-32 flex-shrink-0">
                  <Label className="font-semibold text-sm sm:text-base">
                    {day.label}
                  </Label>
                  <div className="flex items-center gap-2 sm:hidden">
                    <input
                      type="checkbox"
                      checked={hour.isOpen}
                      onChange={e =>
                        updateHour(day.value, 'isOpen', e.target.checked)
                      }
                      className="w-5 h-5"
                    />
                    <Label className="text-sm">Aberto</Label>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={hour.isOpen}
                    onChange={e =>
                      updateHour(day.value, 'isOpen', e.target.checked)
                    }
                    className="w-5 h-5"
                  />
                  <Label className="text-base">Aberto</Label>
                </div>

                {hour.isOpen && (
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
                    <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-0">
                      <Label className="text-sm sm:text-base whitespace-nowrap text-gray-300">
                        De:
                      </Label>
                      <Input
                        type="time"
                        value={formatTime(hour.startHour, hour.startMinutes)}
                        onChange={e =>
                          handleTimeChange(day.value, 'start', e.target.value)
                        }
                        disabled={loading}
                        className="flex-1 sm:w-32 min-w-0"
                      />
                    </div>

                    <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-0">
                      <Label className="text-sm sm:text-base whitespace-nowrap text-gray-300">
                        Até:
                      </Label>
                      <Input
                        type="time"
                        value={formatTime(hour.endHour, hour.endMinutes)}
                        onChange={e =>
                          handleTimeChange(day.value, 'end', e.target.value)
                        }
                        disabled={loading}
                        className="flex-1 sm:w-32 min-w-0"
                      />
                    </div>
                  </div>
                )}

                {!hour.isOpen && (
                  <div className="text-sm sm:text-base text-gray-400">
                    Fechado
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 sm:mt-6">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : null}
            Salvar Horários
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HoursManagement;

