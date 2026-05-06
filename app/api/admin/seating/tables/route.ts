import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/src/shared/lib/prisma';

const createTableSchema = z.object({
    name: z.string().min(1),
    type: z.enum(['ROUND', 'PRESIDIUM']),
    seats: z.coerce.number().min(1).max(50),
    positionX: z.coerce.number().min(0).max(1000),
    positionY: z.coerce.number().min(0).max(1000),
});

const updateTableSchema = z.object({
    tableId: z.number(),
    name: z.string().min(1),
    type: z.enum(['ROUND', 'PRESIDIUM']),
    seats: z.coerce.number().min(1).max(50),
    positionX: z.coerce.number().min(0).max(1000),
    positionY: z.coerce.number().min(0).max(1000),
});

const deleteTableSchema = z.object({
    tableId: z.number(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = createTableSchema.parse(body);

        const table = await prisma.seatingTable.create({
            data: {
                name: data.name,
                type: data.type,
                seats: data.seats,
                positionX: data.positionX,
                positionY: data.positionY,
            },
        });

        return NextResponse.json(table);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: 'Не удалось создать стол' },
            { status: 400 },
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const data = updateTableSchema.parse(body);

        const table = await prisma.seatingTable.findUnique({
            where: {
                id: data.tableId,
            },
            include: {
                assignments: true,
            },
        });

        if (!table) {
            return NextResponse.json(
                { message: 'Стол не найден' },
                { status: 404 },
            );
        }

        const maxSeatUsed = table.assignments.reduce((max, assignment) => {
            const assignmentEnd =
                assignment.seatStart + assignment.peopleCount - 1;

            return Math.max(max, assignmentEnd);
        }, 0);

        if (data.seats < maxSeatUsed) {
            return NextResponse.json(
                {
                    message: `Нельзя уменьшить количество мест до ${data.seats}. Уже занято место №${maxSeatUsed}.`,
                },
                { status: 400 },
            );
        }

        const updatedTable = await prisma.seatingTable.update({
            where: {
                id: data.tableId,
            },
            data: {
                name: data.name,
                type: data.type,
                seats: data.seats,
                positionX: data.positionX,
                positionY: data.positionY,
            },
        });

        return NextResponse.json(updatedTable);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: 'Не удалось обновить стол' },
            { status: 400 },
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { tableId } = deleteTableSchema.parse(body);

        await prisma.seatingTable.delete({
            where: {
                id: tableId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: 'Не удалось удалить стол' },
            { status: 400 },
        );
    }
}