import { notFound } from 'next/navigation';
import Link from 'next/link';

import { supabaseAdmin } from '@/src/shared/lib/supabaseAdmin';
import SeatingPlanView from '@/features/seating/SeatingPlanView';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function GuestSeatingPage({ params }: Props) {
    const { slug } = await params;

    const { data: guest, error: guestError } = await supabaseAdmin
        .from('Guest')
        .select('*')
        .eq('slug', slug)
        .single();

    if (guestError || !guest) {
        notFound();
    }

    const { data: seatingAssignment, error: assignmentError } = await supabaseAdmin
        .from('SeatingAssignment')
        .select('*, table:SeatingTable(*)')
        .eq('guestId', guest.id)
        .maybeSingle();

    if (assignmentError) {
        console.error(assignmentError);
    }

    const guestWithAssignment = {
        ...guest,
        seatingAssignment: seatingAssignment
            ? {
                ...seatingAssignment,
                table: seatingAssignment.table,
            }
            : null,
    };

    const { data: tablesData, error: tablesError } = await supabaseAdmin
        .from('SeatingTable')
        .select('*')
        .order('id', { ascending: true });

    if (tablesError) {
        console.error(tablesError);
    }

    const tables = await Promise.all(
        (tablesData ?? []).map(async table => {
            const { data: assignments, error } = await supabaseAdmin
                .from('SeatingAssignment')
                .select('*, guest:Guest(*)')
                .eq('tableId', table.id);

            if (error) {
                console.error(error);
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
        <main className="min-h-screen bg-[#f7eee7] px-4 py-10 text-stone-800">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 rounded-[36px] border border-white bg-white/75 p-6 text-center shadow-xl backdrop-blur md:p-10">
                    <p className="mb-3 text-sm uppercase tracking-[0.35em] text-stone-400">
                        Seating plan
                    </p>

                    <h1 className="mb-4 font-serif text-4xl md:text-6xl">
                        План рассадки
                    </h1>

                    <p className="mx-auto max-w-2xl leading-8 text-stone-600">
                        {guestWithAssignment.seatingAssignment
                            ? `Для вас подготовлен ${guestWithAssignment.seatingAssignment.table.name}.`
                            : 'Ваше место пока уточняется. Мы обязательно сообщим детали ближе к дате свадьбы.'}
                    </p>

                    <div className="mt-6">
                        <Link
                            href={`/i/${guest.slug}`}
                            className="inline-flex rounded-full border border-stone-300 bg-white px-6 py-3 text-stone-700 transition hover:border-stone-700"
                        >
                            Вернуться к приглашению
                        </Link>
                    </div>
                </div>

                <SeatingPlanView
                    tables={tables}
                    activeGuestId={guest.id}
                />
            </div>
        </main>
    );
}