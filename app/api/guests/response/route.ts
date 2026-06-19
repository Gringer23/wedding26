import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/shared/lib/prisma';

const responseSchema = z.object({
    guestId: z.number(),
    status: z.enum(['WILL_COME', 'WILL_NOT_COME']),
    peopleCount: z.coerce.number().min(1).max(20).optional(),
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

        const response = await prisma.guestResponse.upsert({
            where: {
                guestId: guest.id,
            },
            create: {
                guestId: guest.id,
                status: data.status,
                peopleCount,
                drinks: JSON.stringify(data.drinks ?? []),
                comment: data.comment?.trim() || null,
            },
            update: {
                status: data.status,
                peopleCount,
                drinks: JSON.stringify(data.drinks ?? []),
                comment: data.comment?.trim() || null,
            },
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error(error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    message: error.issues
                        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
                        .join('; '),
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { message: 'Не удалось сохранить ответ' },
            { status: 400 },
        );
    }
}