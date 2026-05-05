import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/src/shared/lib/prisma';

const assignSchema = z.object({
    guestId: z.number(),
    tableId: z.number(),
    peopleCount: z.coerce.number().min(1).max(50),
    seatStart: z.coerce.number().min(1),
});

const deleteAssignmentSchema = z.object({
    guestId: z.number(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = assignSchema.parse(body);

        const guest = await prisma.guest.findUnique({
            where: { id: data.guestId },
            select: {
                id: true,
                maxPeople: true,
            },
        });

        const table = await prisma.seatingTable.findUnique({
            where: { id: data.tableId },
            include: {
                assignments: true,
            },
        });

        if (!guest) {
            return NextResponse.json(
                { message: 'Гость не найден' },
                { status: 404 },
            );
        }

        if (!table) {
            return NextResponse.json(
                { message: 'Стол не найден' },
                { status: 404 },
            );
        }

        const peopleCount = Math.min(data.peopleCount, guest.maxPeople);
        const seatEnd = data.seatStart + peopleCount - 1;

        if (seatEnd > table.seats) {
            return NextResponse.json(
                { message: 'Недостаточно мест за столом' },
                { status: 400 },
            );
        }

        const conflicts = table.assignments.filter(item => {
            if (item.guestId === data.guestId) return false;

            const existingStart = item.seatStart;
            const existingEnd = item.seatStart + item.peopleCount - 1;

            return data.seatStart <= existingEnd && seatEnd >= existingStart;
        });

        if (conflicts.length) {
            return NextResponse.json(
                { message: 'Выбранные места уже заняты' },
                { status: 409 },
            );
        }

        const assignment = await prisma.seatingAssignment.upsert({
            where: {
                guestId: data.guestId,
            },
            update: {
                tableId: data.tableId,
                peopleCount,
                seatStart: data.seatStart,
            },
            create: {
                guestId: data.guestId,
                tableId: data.tableId,
                peopleCount,
                seatStart: data.seatStart,
            },
        });

        return NextResponse.json(assignment);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: 'Не удалось назначить стол' },
            { status: 400 },
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { guestId } = deleteAssignmentSchema.parse(body);

        await prisma.seatingAssignment.delete({
            where: {
                guestId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: 'Не удалось убрать гостя из рассадки' },
            { status: 400 },
        );
    }
}