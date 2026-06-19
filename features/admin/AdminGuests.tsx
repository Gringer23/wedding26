'use client';

import {useEffect, useMemo, useState} from 'react';
import { useRouter } from 'next/navigation';

type AttendanceStatus = 'WILL_COME' | 'WILL_NOT_COME';

type GuestResponse = {
    id: number;
    status: AttendanceStatus;
    peopleCount: number | null;
    drinks: string | null;
    comment: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
};

type Guest = {
    id: number;
    name: string;
    slug: string;
    maxPeople: number;
    response: GuestResponse | null;
    createdAt: Date | string;
    updatedAt: Date | string;
};

type Props = {
    guests: Guest[];
};

export default function AdminGuests({ guests }: Props) {
    const router = useRouter();

    const [name, setName] = useState('');
    const [maxPeople, setMaxPeople] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
    const [createdLink, setCreatedLink] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const [origin, setOrigin] = useState('');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOrigin(window.location.origin);
    }, []);

    const filteredGuests = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        if (!normalizedSearch) {
            return guests;
        }

        return guests.filter(guest => {
            return (
                guest.name.toLowerCase().includes(normalizedSearch) ||
                guest.slug.toLowerCase().includes(normalizedSearch)
            );
        });
    }, [guests, search]);

    const stats = useMemo(() => {
        const answeredCount = guests.filter(guest => guest.response).length;

        const willComeCount = guests.filter(
            guest => guest.response?.status === 'WILL_COME',
        ).length;

        const willNotComeCount = guests.filter(
            guest => guest.response?.status === 'WILL_NOT_COME',
        ).length;

        const totalPeople = guests.reduce((sum, guest) => {
            if (guest.response?.status !== 'WILL_COME') {
                return sum;
            }

            return sum + (guest.response.peopleCount ?? 0);
        }, 0);

        return {
            totalGuests: guests.length,
            answeredCount,
            willComeCount,
            willNotComeCount,
            totalPeople,
        };
    }, [guests]);

    const createGuest = async () => {
        if (!name.trim()) {
            return;
        }

        setIsSubmitting(true);
        setCreatedLink(null);

        try {
            const response = await fetch('/api/admin/guests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim(),
                    maxPeople,
                }),
            });

            if (!response.ok) {
                throw new Error('Не удалось создать гостя');
            }

            const guest = (await response.json()) as Guest;
            const link = `${window.location.origin}/i/${guest.slug}`;

            setCreatedLink(link);
            setName('');
            setMaxPeople(1);

            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Не удалось создать гостя');
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteGuest = async (guestId: number) => {
        const isConfirmed = window.confirm('Удалить этого гостя?');

        if (!isConfirmed) {
            return;
        }

        try {
            const response = await fetch('/api/admin/guests', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    guestId,
                }),
            });

            if (!response.ok) {
                throw new Error('Не удалось удалить гостя');
            }

            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Не удалось удалить гостя');
        }
    };

    const copyLink = async (slug: string) => {
        const link = `${window.location.origin}/i/${slug}`;

        await navigator.clipboard.writeText(link);

        setCopiedSlug(slug);

        window.setTimeout(() => {
            setCopiedSlug(null);
        }, 1500);
    };

    return (
        <div className="space-y-8">
            <section className="grid gap-4 md:grid-cols-5">
                <StatCard title="Всего гостей" value={stats.totalGuests} />
                <StatCard title="Ответили" value={stats.answeredCount} />
                <StatCard title="Придут" value={stats.willComeCount} />
                <StatCard title="Не придут" value={stats.willNotComeCount} />
                <StatCard title="Всего человек" value={stats.totalPeople} />
            </section>

            <section className="rounded-[32px] bg-white p-6 shadow-sm border border-stone-100">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-stone-900">
                        Добавить гостя
                    </h2>
                    <p className="text-stone-500 mt-1">
                        После добавления будет автоматически создана персональная ссылка.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_180px_180px]">
                    <div>
                        <label className="block text-sm text-stone-500 mb-2">
                            Имя гостя или семьи
                        </label>

                        <input
                            value={name}
                            onChange={event => setName(event.target.value)}
                            placeholder="Например: Семья Ивановых"
                            className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-stone-500 mb-2">
                            Кол-во человек
                        </label>

                        <input
                            type="number"
                            min={1}
                            max={20}
                            value={maxPeople}
                            onChange={event => setMaxPeople(Number(event.target.value))}
                            className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={createGuest}
                            disabled={isSubmitting || !name.trim()}
                            className="w-full rounded-2xl bg-stone-900 text-white px-5 py-3 hover:bg-stone-700 transition disabled:opacity-50"
                        >
                            {isSubmitting ? 'Создаём...' : 'Создать'}
                        </button>
                    </div>
                </div>

                {createdLink && (
                    <div className="mt-5 rounded-2xl bg-green-50 border border-green-100 p-4">
                        <p className="text-sm text-green-700 mb-2">
                            Гость создан. Ссылка:
                        </p>

                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <code className="flex-1 rounded-xl bg-white px-4 py-3 text-sm text-stone-700 break-all">
                                {createdLink}
                            </code>

                            <button
                                type="button"
                                onClick={() => navigator.clipboard.writeText(createdLink)}
                                className="rounded-xl bg-green-700 text-white px-5 py-3 hover:bg-green-800 transition"
                            >
                                Скопировать
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <section className="rounded-[32px] bg-white p-6 shadow-sm border border-stone-100">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-stone-900">
                            Список гостей
                        </h2>
                        <p className="text-stone-500 mt-1">
                            Здесь можно копировать персональные ссылки и смотреть ответы.
                        </p>
                    </div>

                    <input
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Поиск по имени или ссылке"
                        className="w-full md:w-80 rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-left">
                        <thead>
                        <tr className="border-b border-stone-100 text-sm text-stone-500">
                            <th className="py-4 pr-4 font-medium">Гость</th>
                            <th className="py-4 pr-4 font-medium">Ссылка</th>
                            <th className="py-4 pr-4 font-medium">Макс.</th>
                            <th className="py-4 pr-4 font-medium">Статус</th>
                            <th className="py-4 pr-4 font-medium">Ответ</th>
                            <th className="py-4 pr-4 font-medium">Напитки</th>
                            <th className="py-4 pr-4 font-medium">Комментарий</th>
                            <th className="py-4 pr-4 font-medium">Действия</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredGuests.map(guest => {
                            const visibleLink = `/i/${guest.slug}`;
                            const fullLink = origin ? `${origin}/i/${guest.slug}` : visibleLink;
                            const drinks = parseDrinks(guest.response?.drinks);

                            return (
                                <tr
                                    key={guest.id}
                                    className="border-b border-stone-100 last:border-0"
                                >
                                    <td className="py-4 pr-4">
                                        <div>
                                            <p className="font-medium text-stone-900">
                                                {guest.name}
                                            </p>
                                            <p className="text-xs text-stone-400">
                                                ID: {guest.id}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="py-4 pr-4">
                                        <code className="block max-w-[260px] truncate rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-600">
                                            {visibleLink}
                                        </code>
                                    </td>

                                    <td className="py-4 pr-4 text-stone-700">
                                        {guest.maxPeople}
                                    </td>

                                    <td className="py-4 pr-4">
                                        <StatusBadge response={guest.response} />
                                    </td>

                                    <td className="py-4 pr-4 text-stone-700">
                                        {guest.response?.status === 'WILL_COME'
                                            ? `${guest.response.peopleCount ?? 1} чел.`
                                            : guest.response?.status === 'WILL_NOT_COME'
                                                ? 'Не придёт'
                                                : '-'}
                                    </td>

                                    <td className="py-4 pr-4 text-stone-700">
                                        {drinks.length ? drinks.join(', ') : '-'}
                                    </td>
                                    <td className="py-4 pr-4 text-stone-700">
                                        {guest.response?.comment ? (
                                            <p
                                                title={guest.response.comment}
                                                className="max-w-[260px] truncate text-sm"
                                            >
                                                {guest.response.comment}
                                            </p>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="py-4 pr-4">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => copyLink(guest.slug)}
                                                className="rounded-xl bg-stone-900 text-white px-4 py-2 text-sm hover:bg-stone-700 transition"
                                            >
                                                {copiedSlug === guest.slug
                                                    ? 'Скопировано'
                                                    : 'Копировать'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => deleteGuest(guest.id)}
                                                className="rounded-xl bg-red-50 text-red-700 px-4 py-2 text-sm hover:bg-red-100 transition"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {!filteredGuests.length && (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="py-10 text-center text-stone-500"
                                >
                                    Гости не найдены
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

function StatCard({
                      title,
                      value,
                  }: {
    title: string;
    value: number;
}) {
    return (
        <div className="rounded-[24px] bg-white p-5 shadow-sm border border-stone-100">
            <p className="text-sm text-stone-500 mb-2">{title}</p>
            <p className="text-3xl font-semibold text-stone-900">{value}</p>
        </div>
    );
}

function StatusBadge({
                         response,
                     }: {
    response: GuestResponse | null;
}) {
    if (!response) {
        return (
            <span className="inline-flex rounded-full bg-stone-100 text-stone-600 px-3 py-1 text-sm">
        Нет ответа
      </span>
        );
    }

    if (response.status === 'WILL_COME') {
        return (
            <span className="inline-flex rounded-full bg-green-50 text-green-700 px-3 py-1 text-sm">
        Придёт
      </span>
        );
    }

    return (
        <span className="inline-flex rounded-full bg-red-50 text-red-700 px-3 py-1 text-sm">
      Не придёт
    </span>
    );
}

function parseDrinks(value?: string | null): string[] {
    if (!value) {
        return [];
    }

    try {
        return JSON.parse(value) as string[];
    } catch {
        return [];
    }
}