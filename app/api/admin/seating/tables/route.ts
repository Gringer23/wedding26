import { NextResponse } from 'next/server';
import { z } from 'zod';

import { supabaseAdmin } from '@/src/shared/lib/supabaseAdmin';

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

        const { data: table, error } = await supabaseAdmin
            .from('SeatingTable')
            .insert({
                name: data.name,
                type: data.type,
                seats: data.seats,
                positionX: data.positionX,
                positionY: data.positionY,
            })
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(table);
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
            { message: 'Не удалось создать стол' },
            { status: 400 },
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const data = updateTableSchema.parse(body);

        const { data: table, error: tableError } = await supabaseAdmin
            .from('SeatingTable')
            .select('*')
            .eq('id', data.tableId)
            .single();

        if (tableError || !table) {
            return NextResponse.json(
                { message: 'Стол не найден' },
                { status: 404 },
            );
        }

        const { data: assignments, error: assignmentsError } = await supabaseAdmin
            .from('SeatingAssignment')
            .select('seatStart, peopleCount')
            .eq('tableId', data.tableId);

        if (assignmentsError) {
            throw assignmentsError;
        }

        const maxSeatUsed = (assignments ?? []).reduce((max, assignment) => {
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

        const { data: updatedTable, error } = await supabaseAdmin
            .from('SeatingTable')
            .update({
                name: data.name,
                type: data.type,
                seats: data.seats,
                positionX: data.positionX,
                positionY: data.positionY,
                updatedAt: new Date().toISOString(),
            })
            .eq('id', data.tableId)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(updatedTable);
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
            { message: 'Не удалось обновить стол' },
            { status: 400 },
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { tableId } = deleteTableSchema.parse(body);

        const { error } = await supabaseAdmin
            .from('SeatingTable')
            .delete()
            .eq('id', tableId);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
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
            { message: 'Не удалось удалить стол' },
            { status: 400 },
        );
    }
}