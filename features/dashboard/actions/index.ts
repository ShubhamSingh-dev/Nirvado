"use server";

import { currentUser } from "@/features/auth/actions";
import { db } from "@/lib/db";
import { Templates } from "@prisma/client";

export const createPlayground = async (data: {
  title: string;
  template: Templates;
  description: string;
  userId: string;
}) => {
  const { title, template, description } = data;
  const user = await currentUser();

  try {
    const playground = await db.playground.create({
      data: {
        title,
        template,
        description,
        userId: user?.id!,
      },
    });

    return playground;
  } catch (error) {
    console.error(error);
  }
};

export const getAllPlaygroundForUser = async () => {
  const user = await currentUser();
  try {
    const playground = await db.playground.findMany({
      where: {
        userId: user?.id!,
      },
      include: {
        user: true,
        Starmark: {
          where: {
            userId: user?.id!,
          },
          select: {
            isMarked: true,
          },
        },
      },
    });

    return playground;
  } catch (error) {
    console.error(error);
    return null;
  }
};
