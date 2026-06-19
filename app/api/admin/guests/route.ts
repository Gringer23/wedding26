import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/src/shared/lib/supabaseAdmin';

const createGuestSchema = z.object({
    name: z.string().min(2, 'Введите имя гостя'),
    maxPeople: z.coerce.number().min(1).max(20),
});

const deleteGuestSchema = z.object({
    guestId: z.number(),
});

function slugify(value: string) {
    const map: Record<string, string> = {
        а: 'a',
        б: 'b',
        в: 'v',
        г: 'g',
        д: 'd',
        е: 'e',
        ё: 'e',
        ж: 'zh',
        з: 'z',
        и: 'i',
        й: 'y',
        к: 'k',
        л: 'l',
        м: 'm',
        н: 'n',
        о: 'o',
        п: 'p',
        р: 'r',
        с: 's',
        т: 't',
        у: 'u',
        ф: 'f',
        х: 'h',
        ц: 'c',
        ч: 'ch',
        ш: 'sh',
        щ: 'sch',
        ъ: '',
        ы: 'y',
        ь: '',
        э: 'e',
        ю: 'yu',
        я: 'ya',
    };

    return value
        .toLowerCase()
        .split('')
        .map(char => map[char] ?? char)
        .join('')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function generateUniqueSlug(name: string) {
    const baseSlug = slugify(name) || 'guest';

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const { data, error } = await supabaseAdmin
            .from('Guest')
            .select('id')
            .eq('slug', slug)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            return slug;
        }

        counter += 1;
        slug = `${baseSlug}-${counter}`;
    }
}

export async function GET() {
    try {
        const { data: guests, error: guestsError } = await supabaseAdmin
            .from('Guest')
            .select('*')
            .order('createdAt', { ascending: false });

        if (guestsError) {
            throw guestsError;
        }

        const guestIds = guests.map(guest => guest.id);

        const { data: responses, error: responsesError } = await supabaseAdmin
            .from('GuestResponse')
            .select('*')
            .in('guestId', guestIds.length ? guestIds : [-1]);

        if (responsesError) {
            throw responsesError;
        }

        const responsesByGuestId = new Map(
            responses.map(response => [response.guestId, response]),
        );

        const result = guests.map(guest => ({
            ...guest,
            response: responsesByGuestId.get(guest.id) ?? null,
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: 'Не удалось получить гостей' },
            { status: 400 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = createGuestSchema.parse(body);

        const slug = await generateUniqueSlug(data.name);

        const { data: guest, error } = await supabaseAdmin
            .from('Guest')
            .insert({
                name: data.name,
                slug,
                maxPeople: data.maxPeople,
            })
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            ...guest,
            response: null,
        });
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
            { message: 'Не удалось создать гостя' },
            { status: 400 },
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const data = deleteGuestSchema.parse(body);

        const { error } = await supabaseAdmin
            .from('Guest')
            .delete()
            .eq('id', data.guestId);

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
            { message: 'Не удалось удалить гостя' },
            { status: 400 },
        );
    }
}