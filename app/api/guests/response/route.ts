import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/shared/lib/prisma';

const responseSchema = z.object({
    guestId: z.number(),
    status: z.enum(['WILL_COME', 'WILL_NOT_COME']),
    peopleCount: z.number().optional(),
    drinks: z.array(z.string()).optional(),
    comment: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = responseSchema.parse(body);

        const guest = await prisma.guest.findUnique({
            where: {
                id: data.guestId,
            },
        });

        if (!guest) {
            return NextResponse.json(
                { message: 'Гость не найден' },
                { status: 404 },
            );
        }

        const peopleCount =
            data.status === 'WILL_COME'
                ? Math.min(data.peopleCount ?? 1, guest.maxPeople)
                : null;

        const drinks =
            data.status === 'WILL_COME'
                ? JSON.stringify(data.drinks ?? [])
                : null;

        const response = await prisma.guestResponse.upsert({
            where: {
                guestId: data.guestId,
            },
            update: {
                status: data.status,
                peopleCount,
                drinks,
                comment: data.comment ?? null,
            },
            create: {
                guestId: data.guestId,
                status: data.status,
                peopleCount,
                drinks,
                comment: data.comment ?? null,
            },
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: 'Ошибка сохранения ответа' },
            { status: 400 },
        );
    }
}