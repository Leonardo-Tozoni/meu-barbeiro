'use client';

import {
  createService,
  deleteService,
  updateService
} from '@/app/_actions/service';
import ImageUpload from '@/app/_components/image-upload';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/app/_components/ui/alert-dialog';
import { Button } from '@/app/_components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/_components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/app/_components/ui/dialog';
import { Input } from '@/app/_components/ui/input';
import { Label } from '@/app/_components/ui/label';
import { Textarea } from '@/app/_components/ui/textarea';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
};

type ServicesManagementProps = {
  barbershopId: string;
  initialServices: Service[];
};

const ServicesManagement = ({
  barbershopId,
  initialServices
}: ServicesManagementProps) => {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      imageUrl: ''
    });
    setEditingService(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      imageUrl: service.imageUrl
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.imageUrl
    ) {
      toast.error('Preencha todos os campos');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Preço inválido');
      return;
    }

    setLoading(true);

    const serviceData = {
      name: formData.name,
      description: formData.description,
      price,
      imageUrl: formData.imageUrl
    };

    if (editingService) {
      const result = await updateService(editingService.id, serviceData);
      if (result.success) {
        toast.success('Serviço atualizado com sucesso!');
        setServices(
          services.map(s =>
            s.id === editingService.id ? { ...s, ...serviceData } : s
          )
        );
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast.error(result.error || 'Erro ao atualizar serviço');
      }
    } else {
      const result = await createService(barbershopId, serviceData);
      if (result.success) {
        toast.success('Serviço criado com sucesso!');
        window.location.reload();
      } else {
        toast.error(result.error || 'Erro ao criar serviço');
      }
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;

    setLoading(true);
    const result = await deleteService(serviceToDelete);

    if (result.success) {
      toast.success('Serviço excluído com sucesso!');
      setServices(services.filter(s => s.id !== serviceToDelete));
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    } else {
      toast.error(result.error || 'Erro ao excluir serviço');
    }

    setLoading(false);
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Serviços</CardTitle>
              <CardDescription>
                Gerencie os serviços da sua barbearia
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2" size={20} />
              Novo Serviço
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-sm text-gray-400">
              Nenhum serviço cadastrado. Clique em &quot;Novo Serviço&quot; para
              adicionar.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(service => (
                <div
                  key={service.id}
                  className="border border-solid border-secondary rounded-lg p-4"
                >
                  <div className="flex gap-3">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={service.imageUrl}
                        alt={service.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{service.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {service.description}
                      </p>
                      <p className="font-semibold text-primary mt-1">
                        R${' '}
                        {Intl.NumberFormat('pt-BR', {
                          minimumFractionDigits: 2
                        }).format(Number(service.price))}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(service)}
                    >
                      <Pencil size={16} className="mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setServiceToDelete(service.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para criar/editar serviço */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
            <DialogDescription>Preencha os dados do serviço</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceName">Nome do Serviço</Label>
              <Input
                id="serviceName"
                placeholder="Ex: Corte de Cabelo"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceDescription">Descrição</Label>
              <Textarea
                id="serviceDescription"
                placeholder="Descreva o serviço..."
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="servicePrice">Preço (R$)</Label>
              <Input
                id="servicePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 45.00"
                value={formData.price}
                onChange={e =>
                  setFormData({ ...formData, price: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <ImageUpload
              label="Imagem do Serviço"
              value={formData.imageUrl}
              onChange={value => setFormData({ ...formData, imageUrl: value })}
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : null}
              {editingService ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este serviço? Esta ação não pode
              ser desfeita. Serviços com agendamentos não podem ser excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ServicesManagement;
