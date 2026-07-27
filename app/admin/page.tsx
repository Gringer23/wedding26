import AdminGuests from '@/features/admin/AdminGuests';
import AdminLogoutButton from '@/features/admin/AdminLogoutButton';
import AdminSeating from '@/features/admin/AdminSeating';
import { supabaseAdmin } from '@/src/shared/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const { data: guestsData, error: guestsError } = await supabaseAdmin
        .from('Guest')
        .select('*')
        .order('createdAt', { ascending: false });

    if (guestsError) {
        console.error(guestsError);
    }

    const guests = await Promise.all(
        (guestsData ?? []).map(async guest => {
            const { data: response, error: responseError } = await supabaseAdmin
                .from('GuestResponse')
                .select('*')
                .eq('guestId', guest.id)
                .maybeSingle();

            if (responseError) {
                console.error(responseError);
            }

            return {
                ...guest,
                response: response ?? null,
            };
        }),
    );

    const { data: tablesData, error: tablesError } = await supabaseAdmin
        .from('SeatingTable')
        .select('*')
        .order('id', { ascending: true });

    if (tablesError) {
        console.error(tablesError);
    }

    const tables = await Promise.all(
        (tablesData ?? []).map(async table => {
            const { data: assignments, error: assignmentsError } =
                await supabaseAdmin
                    .from('SeatingAssignment')
                    .select('*, guest:Guest(*)')
                    .eq('tableId', table.id);

            if (assignmentsError) {
                console.error(assignmentsError);
            }

            return {
                ...table,
                assignments: (assignments ?? []).sort((a, b) =>
                    String(a.guest?.name ?? '').localeCompare(
                        String(b.guest?.name ?? ''),
                        'ru',
                    ),
                ),
            };
        }),
    );

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

                <div className="mt-8">
                    <AdminSeating guests={guests} tables={tables} />
                </div>
            </div>
        </main>
    );
}