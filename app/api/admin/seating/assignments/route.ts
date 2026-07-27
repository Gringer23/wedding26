import { NextResponse } from 'next/server';
import { z } from 'zod';

import { supabaseAdmin } from '@/src/shared/lib/supabaseAdmin';

const assignSchema = z.object({
    guestId: z.number(),
    tableId: z.number(),
    peopleCount: z.coerce.number().min(1).max(50),
    seatStart: z.coerce.number().min(1),
});

const deleteAssignmentSchema = z.object({
    assignmentId: z.number(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = assignSchema.parse(body);

        const { data: guest, error: guestError } = await supabaseAdmin
            .from('Guest')
            .select('id, maxPeople')
            .eq('id', data.guestId)
            .single();

        if (guestError || !guest) {
            return NextResponse.json(
                { message: 'Гость не найден' },
                { status: 404 },
            );
        }

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

        const { data: tableAssignments, error: tableAssignmentsError } =
            await supabaseAdmin
                .from('SeatingAssignment')
                .select('*')
                .eq('tableId', data.tableId);

        if (tableAssignmentsError) {
            throw tableAssignmentsError;
        }

        const { data: guestAssignments, error: guestAssignmentsError } =
            await supabaseAdmin
                .from('SeatingAssignment')
                .select('*')
                .eq('guestId', data.guestId);

        if (guestAssignmentsError) {
            throw guestAssignmentsError;
        }

        const alreadyAssignedPeople = (guestAssignments ?? []).reduce(
            (sum, assignment) => sum + assignment.peopleCount,
            0,
        );

        const remainingPeople = guest.maxPeople - alreadyAssignedPeople;

        if (remainingPeople <= 0) {
            return NextResponse.json(
                { message: 'Этот гость/семья уже полностью рассажен(а)' },
                { status: 400 },
            );
        }

        if (data.peopleCount > remainingPeople) {
            return NextResponse.json(
                {
                    message: `Можно рассадить ещё только ${remainingPeople} чел. из этой семьи`,
                },
                { status: 400 },
            );
        }

        const seatEnd = data.seatStart + data.peopleCount - 1;

        if (seatEnd > table.seats) {
            return NextResponse.json(
                { message: 'Недостаточно мест за столом' },
                { status: 400 },
            );
        }

        const conflicts = (tableAssignments ?? []).filter(item => {
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

        const { data: assignment, error } = await supabaseAdmin
            .from('SeatingAssignment')
            .insert({
                guestId: data.guestId,
                tableId: data.tableId,
                peopleCount: data.peopleCount,
                seatStart: data.seatStart,
            })
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(assignment);
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
            { message: 'Не удалось назначить стол' },
            { status: 400 },
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { assignmentId } = deleteAssignmentSchema.parse(body);

        const { error } = await supabaseAdmin
            .from('SeatingAssignment')
            .delete()
            .eq('id', assignmentId);

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
            { message: 'Не удалось убрать гостя из рассадки' },
            { status: 400 },
        );
    }
}
