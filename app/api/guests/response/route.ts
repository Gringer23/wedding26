import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/src/shared/lib/supabaseAdmin';

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

        const { data: guest, error: guestError } = await supabaseAdmin
            .from('Guest')
            .select('*')
            .eq('id', data.guestId)
            .single();

        if (guestError || !guest) {
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
                : JSON.stringify([]);

        const { data: response, error } = await supabaseAdmin
            .from('GuestResponse')
            .upsert(
                {
                    guestId: guest.id,
                    status: data.status,
                    peopleCount,
                    drinks,
                    comment: data.comment?.trim() || null,
                    updatedAt: new Date().toISOString(),
                },
                {
                    onConflict: 'guestId',
                },
            )
            .select('*')
            .single();

        if (error) {
            throw error;
        }

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