import { prisma } from '@/src/shared/lib/prisma';
import AdminGuests from '@/features/admin/AdminGuests';
import AdminLogoutButton from '@/features/admin/AdminLogoutButton';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const guests = await prisma.guest.findMany({
        include: {
            response: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });


    return (
        <main className="min-h-screen bg-[#f7f1eb] px-4 py-8 text-stone-900">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="mb-3 text-sm uppercase tracking-[0.35em] text-stone-500">
                            Wedding admin
                        </p>

                        <h1 className="font-serif text-4xl md:text-5xl">
                            Управление приглашениями
                        </h1>

                        <p className="mt-3 max-w-2xl text-stone-600">
                            Создавайте именные приглашения, копируйте ссылки для гостей и
                            отслеживайте ответы по присутствию.
                        </p>
                    </div>

                    <AdminLogoutButton />
                </div>

                <AdminGuests guests={guests} />
            </div>
        </main>
    );
}