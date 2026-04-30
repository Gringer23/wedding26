import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/shared/lib/prisma';

const createGuestSchema = z.object({
    name: z.string().min(2, 'Введите имя гостя'),
    maxPeople: z.coerce.number().min(1).max(20),
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
        const existingGuest = await prisma.guest.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!existingGuest) {
            return slug;
        }

        counter += 1;
        slug = `${baseSlug}-${counter}`;
    }
}

export async function GET() {
    const guests = await prisma.guest.findMany({
        include: {
            response: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return NextResponse.json(guests);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = createGuestSchema.parse(body);

        const slug = await generateUniqueSlug(data.name);

        const guest = await prisma.guest.create({
            data: {
                name: data.name,
                slug,
                maxPeople: data.maxPeople,
            },
            include: {
                response: true,
            },
        });

        return NextResponse.json(guest);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: 'Не удалось создать гостя' },
            { status: 400 },
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();

        const schema = z.object({
            guestId: z.number(),
        });

        const data = schema.parse(body);

        await prisma.guest.delete({
            where: {
                id: data.guestId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: 'Не удалось удалить гостя' },
            { status: 400 },
        );
    }
}