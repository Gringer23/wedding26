import { NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
    password: z.string().min(1),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = loginSchema.parse(body);

        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            return NextResponse.json(
                { message: 'ADMIN_PASSWORD не задан' },
                { status: 500 },
            );
        }

        if (password !== adminPassword) {
            return NextResponse.json(
                { message: 'Неверный пароль' },
                { status: 401 },
            );
        }

        const response = NextResponse.json({ success: true });

        const isHttps =
            request.headers.get('x-forwarded-proto') === 'https' ||
            new URL(request.url).protocol === 'https:';

        response.cookies.set('admin_auth', 'true', {
            httpOnly: true,
            sameSite: 'lax',
            secure: isHttps,
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: 'Ошибка входа' },
            { status: 400 },
        );
    }
}