'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Guest = {
    id: number;
    name: string;
    slug: string;
    maxPeople: number;
};

type SeatingAssignment = {
    id: number;
    guestId: number;
    tableId: number;
    peopleCount: number;
    seatStart: number;
    guest: Guest;
};

type SeatingTable = {
    id: number;
    name: string;
    type: 'ROUND' | 'PRESIDIUM';
    seats: number;
    positionX: number;
    positionY: number;
    assignments: SeatingAssignment[];
};

type Props = {
    guests: Guest[];
    tables: SeatingTable[];
};

export default function AdminSeating({ guests, tables }: Props) {
    const router = useRouter();
    const [seatStart, setSeatStart] = useState(1);
    const [tableName, setTableName] = useState('');
    const [seats, setSeats] = useState(8);

    const [guestId, setGuestId] = useState<number | ''>('');
    const [tableId, setTableId] = useState<number | ''>('');
    const [peopleCount, setPeopleCount] = useState(1);

    const [tableType, setTableType] = useState<'ROUND' | 'PRESIDIUM'>('ROUND');
    const [positionX, setPositionX] = useState(50);
    const [positionY, setPositionY] = useState(50);

    const [editingTableId, setEditingTableId] = useState<number | null>(null);
    const [editTableName, setEditTableName] = useState('');
    const [editTableType, setEditTableType] = useState<'ROUND' | 'PRESIDIUM'>('ROUND');
    const [editSeats, setEditSeats] = useState(8);
    const [editPositionX, setEditPositionX] = useState(50);
    const [editPositionY, setEditPositionY] = useState(50);

    const createTable = async () => {
        if (!tableName.trim()) return;

        const response = await fetch('/api/admin/seating/tables', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: tableName.trim(),
                type: tableType,
                seats,
                positionX,
                positionY,
            }),
        });

        if (!response.ok) {
            alert('Не удалось создать стол');
            return;
        }

        setTableName('');
        setTableType('ROUND');
        setSeats(8);
        setPositionX(50);
        setPositionY(50);

        router.refresh();
    };

    const startEditTable = (table: SeatingTable) => {
        setEditingTableId(table.id);
        setEditTableName(table.name);
        setEditTableType(table.type);
        setEditSeats(table.seats);
        setEditPositionX(table.positionX);
        setEditPositionY(table.positionY);
    };

    const cancelEditTable = () => {
        setEditingTableId(null);
        setEditTableName('');
        setEditTableType('ROUND');
        setEditSeats(8);
        setEditPositionX(50);
        setEditPositionY(50);
    };

    const updateTable = async () => {
        if (!editingTableId || !editTableName.trim()) {
            return;
        }

        const response = await fetch('/api/admin/seating/tables', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tableId: editingTableId,
                name: editTableName.trim(),
                type: editTableType,
                seats: editSeats,
                positionX: editPositionX,
                positionY: editPositionY,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message ?? 'Не удалось обновить стол');
            return;
        }

        cancelEditTable();
        router.refresh();
    };

    const deleteTable = async (id: number) => {
        const confirmed = window.confirm('Удалить стол и всю рассадку за ним?');

        if (!confirmed) return;

        const response = await fetch('/api/admin/seating/tables', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tableId: id,
            }),
        });

        if (!response.ok) {
            alert('Не удалось удалить стол');
            return;
        }

        router.refresh();
    };

    const assignGuest = async () => {
        if (!guestId || !tableId) return;

        const response = await fetch('/api/admin/seating/assignments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                guestId,
                tableId,
                peopleCount,
                seatStart,
            }),
        });

        if (!response.ok) {
            alert('Не удалось назначить гостя');
            return;
        }

        setGuestId('');
        setTableId('');
        setPeopleCount(1);
        setSeatStart(1);
        router.refresh();
    };

    const removeAssignment = async (id: number) => {
        const response = await fetch('/api/admin/seating/assignments', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                guestId: id,
            }),
        });

        if (!response.ok) {
            alert('Не удалось убрать гостя');
            return;
        }

        router.refresh();
    };

    return (
        <section className="rounded-[32px] border border-stone-100 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-stone-900">
                    План рассадки
                </h2>
                <p className="mt-1 text-stone-500">
                    Добавляйте столы и назначайте гостей. На персональной странице гостя
                    его стол будет подсвечен.
                </p>
            </div>

            <div className="mb-8 grid gap-4 md:grid-cols-[1fr_160px_120px_120px_120px_180px]">
                <div>
                    <label className="mb-2 block text-sm text-stone-500">
                        Название стола
                    </label>
                    <input
                        value={tableName}
                        onChange={event => setTableName(event.target.value)}
                        placeholder="Например: Стол №1"
                        className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-stone-500">
                        Тип
                    </label>
                    <select
                        value={tableType}
                        onChange={event =>
                            setTableType(event.target.value as 'ROUND' | 'PRESIDIUM')
                        }
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-700"
                    >
                        <option value="ROUND">Круглый стол</option>
                        <option value="PRESIDIUM">Президиум</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm text-stone-500">
                        Мест
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={50}
                        value={seats}
                        onChange={event => setSeats(Number(event.target.value))}
                        className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                    />
                </div>

                    <div>
                        <label className="mb-2 block text-sm text-stone-500">
                            X
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={positionX}
                            onChange={event => setPositionX(Number(event.target.value))}
                            className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-center outline-none focus:border-stone-700"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-stone-500">
                            Y
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={positionY}
                            onChange={event => setPositionY(Number(event.target.value))}
                            className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-center outline-none focus:border-stone-700"
                        />
                    </div>
                <div className="flex items-end">
                    <button
                        type="button"
                        onClick={createTable}
                        className="w-full rounded-2xl bg-stone-900 px-5 py-3 text-white transition hover:bg-stone-700"
                    >
                        Добавить стол
                    </button>
                </div>
            </div>

            <div className="mb-8 grid gap-4 md:grid-cols-[1fr_1fr_120px_120px_180px]">
                <div>
                    <label className="mb-2 block text-sm text-stone-500">
                        Гость
                    </label>
                    <select
                        value={guestId}
                        onChange={event => {
                            const id = Number(event.target.value);
                            const guest = guests.find(item => item.id === id);

                            setGuestId(id || '');
                            setPeopleCount(guest?.maxPeople ?? 1);
                        }}
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-700"
                    >
                        <option value="">Выберите гостя</option>
                        {guests.map(guest => (
                            <option key={guest.id} value={guest.id}>
                                {guest.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm text-stone-500">
                        Стол
                    </label>
                    <select
                        value={tableId}
                        onChange={event => setTableId(Number(event.target.value) || '')}
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-700"
                    >
                        <option value="">Выберите стол</option>
                        {tables.map(table => (
                            <option key={table.id} value={table.id}>
                                {table.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm text-stone-500">
                        Человек
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={50}
                        value={peopleCount}
                        onChange={event => setPeopleCount(Number(event.target.value))}
                        className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-stone-500">
                        С места
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={50}
                        value={seatStart}
                        onChange={event => setSeatStart(Number(event.target.value))}
                        className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                    />
                </div>

                <div className="flex items-end">
                    <button
                        type="button"
                        onClick={assignGuest}
                        className="w-full rounded-2xl bg-stone-900 px-5 py-3 text-white transition hover:bg-stone-700"
                    >
                        Назначить
                    </button>
                </div>
            </div>
            <div className="mb-6 rounded-[24px] border border-amber-100 bg-amber-50 p-5 text-sm leading-7 text-stone-700">
                <p className="font-medium text-stone-900">
                    Как работают координаты:
                </p>
                <p>
                    X — положение по горизонтали от 0 до 100. Y — положение по вертикали от 0 до 100.
                    Например, президиум удобно ставить X=50, Y=18. Центральный стол — X=50, Y=50.
                </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
                {tables.map(table => {
                    const occupied = table.assignments.reduce(
                        (sum, assignment) => sum + assignment.peopleCount,
                        0,
                    );

                    return (
                        <div
                            key={table.id}
                            className="rounded-[28px] border border-stone-100 bg-stone-50 p-5"
                        >
                            {editingTableId === table.id ? (
                                <div className="space-y-4">
                                    <div className="grid gap-3 md:grid-cols-[1fr_160px]">
                                        <div>
                                            <label className="mb-2 block text-sm text-stone-500">
                                                Название
                                            </label>
                                            <input
                                                value={editTableName}
                                                onChange={event => setEditTableName(event.target.value)}
                                                className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm text-stone-500">
                                                Тип
                                            </label>
                                            <select
                                                value={editTableType}
                                                onChange={event =>
                                                    setEditTableType(event.target.value as 'ROUND' | 'PRESIDIUM')
                                                }
                                                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-700"
                                            >
                                                <option value="ROUND">Круглый</option>
                                                <option value="PRESIDIUM">Президиум</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-3">
                                        <div>
                                            <label className="mb-2 block text-sm text-stone-500">
                                                Мест
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={50}
                                                value={editSeats}
                                                onChange={event => setEditSeats(Number(event.target.value))}
                                                className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm text-stone-500">
                                                X
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={editPositionX}
                                                onChange={event => setEditPositionX(Number(event.target.value))}
                                                className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm text-stone-500">
                                                Y
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={editPositionY}
                                                onChange={event => setEditPositionY(Number(event.target.value))}
                                                className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <button
                                            type="button"
                                            onClick={updateTable}
                                            className="rounded-xl bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-700"
                                        >
                                            Сохранить
                                        </button>

                                        <button
                                            type="button"
                                            onClick={cancelEditTable}
                                            className="rounded-xl bg-white px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100"
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-stone-900">
                                                {table.name}
                                            </h3>

                                            <p className="text-sm text-stone-500">
                                                {table.type === 'PRESIDIUM'
                                                    ? 'Президиум'
                                                    : 'Круглый стол'}{' '}
                                                • Занято {occupied} из {table.seats}
                                            </p>

                                            <p className="mt-1 text-xs text-stone-400">
                                                Координаты: X {table.positionX}, Y {table.positionY}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEditTable(table)}
                                                className="rounded-xl bg-white px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100"
                                            >
                                                Изменить
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => deleteTable(table.id)}
                                                className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700 transition hover:bg-red-100"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {table.assignments.length ? (
                                            table.assignments.map(assignment => (
                                                <div
                                                    key={assignment.id}
                                                    className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3"
                                                >
                                                    <div>
                                                        <p className="font-medium text-stone-900">
                                                            {assignment.guest.name}
                                                        </p>

                                                        <p className="text-sm text-stone-500">
                                                            {assignment.peopleCount} чел. • места{' '}
                                                            {assignment.seatStart}
                                                            {assignment.peopleCount > 1
                                                                ? `–${assignment.seatStart + assignment.peopleCount - 1}`
                                                                : ''}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeAssignment(assignment.guestId)}
                                                        className="rounded-xl bg-stone-100 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-200"
                                                    >
                                                        Убрать
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="rounded-2xl bg-white px-4 py-3 text-sm text-stone-400">
                                                За этим столом пока никого нет
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}

                {!tables.length && (
                    <p className="rounded-2xl bg-stone-50 p-5 text-stone-500">
                        Столы пока не добавлены.
                    </p>
                )}
            </div>
        </section>
    );
}