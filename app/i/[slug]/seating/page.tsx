import { notFound } from 'next/navigation';
import Link from 'next/link';

import { prisma } from '@/src/shared/lib/prisma';
import SeatingPlanView from '@/features/seating/SeatingPlanView';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function GuestSeatingPage({ params }: Props) {
    const { slug } = await params;

    const guest = await prisma.guest.findUnique({
        where: { slug },
        include: {
            seatingAssignment: {
                include: {
                    table: true,
                },
            },
        },
    });

    if (!guest) {
        notFound();
    }

    const tables = await prisma.seatingTable.findMany({
        include: {
            assignments: {
                include: {
                    guest: true,
                },
                orderBy: {
                    guest: {
                        name: 'asc',
                    },
                },
            },
        },
        orderBy: {
            id: 'asc',
        },
    });

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
                        {guest.seatingAssignment
                            ? `Для вас подготовлен ${guest.seatingAssignment.table.name}.`
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