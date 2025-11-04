"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/_lib/prisma";

export const createService = async (
  barbershopId: string,
  serviceData: {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
  }
) => {
  try {
    await db.service.create({
      data: {
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        imageUrl: serviceData.imageUrl,
        barbershopId,
      },
    });

    revalidatePath("/barber-dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return { success: false, error: "Erro ao criar serviço" };
  }
};

export const updateService = async (
  serviceId: string,
  serviceData: {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
  }
) => {
  try {
    await db.service.update({
      where: { id: serviceId },
      data: {
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        imageUrl: serviceData.imageUrl,
      },
    });

    revalidatePath("/barber-dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    return { success: false, error: "Erro ao atualizar serviço" };
  }
};

export const deleteService = async (serviceId: string) => {
  try {
    // Verificar se há agendamentos para este serviço
    const bookingsCount = await db.booking.count({
      where: { serviceId },
    });

    if (bookingsCount > 0) {
      return {
        success: false,
        error: "Não é possível excluir um serviço com agendamentos",
      };
    }

    await db.service.delete({
      where: { id: serviceId },
    });

    revalidatePath("/barber-dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
    return { success: false, error: "Erro ao excluir serviço" };
  }
};

export const getBarbershopServices = async (barbershopId: string) => {
  try {
    const services = await db.service.findMany({
      where: { barbershopId },
      orderBy: { name: "asc" },
    });

    return services;
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return [];
  }
};
