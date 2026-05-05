'use client';

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
    tables: SeatingTable[];
    activeGuestId?: number;
};

type SeatItem = {
    seatNumber: number;
    assignment: SeatingAssignment | null;
    isActive: boolean;
};

export default function SeatingPlanView({ tables, activeGuestId }: Props) {
    if (!tables.length) {
        return (
            <div className="rounded-[32px] border border-stone-100 bg-white/80 p-10 text-center shadow-sm">
                <p className="text-stone-500">
                    План рассадки пока не добавлен.
                </p>
            </div>
        );
    }

    return (
        <section className="space-y-8">
            <div className="rounded-[36px] border border-white bg-white/70 p-4 shadow-xl backdrop-blur md:p-8">
                <div className="mb-8 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-stone-400">
                        Банкетный зал
                    </p>

                    <h2 className="mt-3 font-serif text-3xl md:text-5xl">
                        Схема рассадки
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-stone-600 leading-7">
                        Ваш стол и ваши места подсвечены на схеме.
                    </p>
                </div>

                <div className="mb-6 flex flex-wrap justify-center gap-3 text-sm">
                    <Legend colorClass="bg-stone-300" label="Свободное место" />
                    <Legend colorClass="bg-stone-600" label="Занятое место" />
                    <Legend colorClass="bg-amber-500" label="Ваше место" />
                </div>

                <div className="overflow-x-auto">
                    <div className="mx-auto min-w-[1100px]">
                        <div className="relative h-[780px] rounded-[36px] border border-stone-100 bg-[#f9f4ee] p-6">
                            <div className="pointer-events-none absolute inset-x-10 top-6 rounded-2xl border border-dashed border-stone-200 py-3 text-center text-sm uppercase tracking-[0.3em] text-stone-400">
                                Сцена / президиум
                            </div>

                            {tables.map(table => (
                                <TableNode
                                    key={table.id}
                                    table={table}
                                    activeGuestId={activeGuestId}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                {tables.map(table => (
                    <TableInfoCard
                        key={table.id}
                        table={table}
                        activeGuestId={activeGuestId}
                    />
                ))}
            </div>
        </section>
    );
}

function TableNode({
                       table,
                       activeGuestId,
                   }: {
    table: SeatingTable;
    activeGuestId?: number;
}) {
    const seatMap = buildSeatMap(table, activeGuestId);
    const isActiveTable = seatMap.some(item => item.isActive);

    return (
        <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
                left: `${table.positionX}%`,
                top: `${table.positionY}%`,
            }}
        >
            {table.type === 'PRESIDIUM' ? (
                <PresidiumTable
                    table={table}
                    seatMap={seatMap}
                    isActiveTable={isActiveTable}
                />
            ) : (
                <RoundTable
                    table={table}
                    seatMap={seatMap}
                    isActiveTable={isActiveTable}
                />
            )}
        </div>
    );
}

function RoundTable({
                        table,
                        seatMap,
                        isActiveTable,
                    }: {
    table: SeatingTable;
    seatMap: SeatItem[];
    isActiveTable: boolean;
}) {
    const size = 240;
    const center = size / 2;
    const tableRadius = 48;
    const seatsRadius = 82;
    const seatDotRadius = 10;

    const occupiedSeats = seatMap.filter(item => item.assignment).length;

    return (
        <div className="relative">
            <svg
                viewBox={`0 0 ${size} ${size}`}
                className="h-[240px] w-[240px] overflow-visible drop-shadow"
            >
                {seatMap.map((seat, index) => {
                    const angle =
                        -Math.PI / 2 + (index * 2 * Math.PI) / table.seats;

                    const x = center + Math.cos(angle) * seatsRadius;
                    const y = center + Math.sin(angle) * seatsRadius;

                    const isOccupied = Boolean(seat.assignment);

                    return (
                        <g key={seat.seatNumber}>
                            {seat.isActive && (
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={seatDotRadius + 8}
                                    fill="rgba(245, 158, 11, 0.18)"
                                />
                            )}

                            <circle
                                cx={x}
                                cy={y}
                                r={seatDotRadius}
                                fill={
                                    seat.isActive
                                        ? '#f59e0b'
                                        : isOccupied
                                            ? '#57534e'
                                            : '#d6d3d1'
                                }
                                stroke="#ffffff"
                                strokeWidth={3}
                            >
                                <title>
                                    {seat.assignment
                                        ? `${seat.assignment.guest.name}, место ${seat.seatNumber}`
                                        : `Свободное место ${seat.seatNumber}`}
                                </title>
                            </circle>

                            <text
                                x={x}
                                y={y + 24}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#78716c"
                            >
                                {seat.seatNumber}
                            </text>
                        </g>
                    );
                })}

                <circle
                    cx={center}
                    cy={center}
                    r={tableRadius}
                    fill={isActiveTable ? '#292524' : '#ffffff'}
                    stroke={isActiveTable ? '#f59e0b' : '#e7e5e4'}
                    strokeWidth={4}
                />

                <text
                    x={center}
                    y={center - 6}
                    textAnchor="middle"
                    fontSize="14"
                    fill={isActiveTable ? '#ffffff' : '#57534e'}
                >
                    {table.name}
                </text>

                <text
                    x={center}
                    y={center + 14}
                    textAnchor="middle"
                    fontSize="11"
                    fill={isActiveTable ? 'rgba(255,255,255,0.75)' : '#a8a29e'}
                >
                    {occupiedSeats}/{table.seats}
                </text>
            </svg>
        </div>
    );
}

function PresidiumTable({
                            table,
                            seatMap,
                            isActiveTable,
                        }: {
    table: SeatingTable;
    seatMap: SeatItem[];
    isActiveTable: boolean;
}) {
    const width = 340;
    const height = 190;
    const rectX = 80;
    const rectY = 65;
    const rectWidth = 180;
    const rectHeight = 60;
    const seatDotRadius = 9;

    const occupiedSeats = seatMap.filter(item => item.assignment).length;
    const positions = getRectSeatPositions(seatMap.length, width, height, 30);

    return (
        <div className="relative">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-[190px] w-[340px] overflow-visible drop-shadow"
            >
                {seatMap.map((seat, index) => {
                    const point = positions[index];
                    const isOccupied = Boolean(seat.assignment);

                    return (
                        <g key={seat.seatNumber}>
                            {seat.isActive && (
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r={seatDotRadius + 8}
                                    fill="rgba(245, 158, 11, 0.18)"
                                />
                            )}

                            <circle
                                cx={point.x}
                                cy={point.y}
                                r={seatDotRadius}
                                fill={
                                    seat.isActive
                                        ? '#f59e0b'
                                        : isOccupied
                                            ? '#57534e'
                                            : '#d6d3d1'
                                }
                                stroke="#ffffff"
                                strokeWidth={3}
                            >
                                <title>
                                    {seat.assignment
                                        ? `${seat.assignment.guest.name}, место ${seat.seatNumber}`
                                        : `Свободное место ${seat.seatNumber}`}
                                </title>
                            </circle>

                            <text
                                x={point.x}
                                y={point.y + 24}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#78716c"
                            >
                                {seat.seatNumber}
                            </text>
                        </g>
                    );
                })}

                <rect
                    x={rectX}
                    y={rectY}
                    width={rectWidth}
                    height={rectHeight}
                    rx={18}
                    fill={isActiveTable ? '#292524' : '#ffffff'}
                    stroke={isActiveTable ? '#f59e0b' : '#e7e5e4'}
                    strokeWidth={4}
                />

                <text
                    x={width / 2}
                    y={height / 2 - 6}
                    textAnchor="middle"
                    fontSize="15"
                    fill={isActiveTable ? '#ffffff' : '#57534e'}
                >
                    {table.name}
                </text>

                <text
                    x={width / 2}
                    y={height / 2 + 14}
                    textAnchor="middle"
                    fontSize="11"
                    fill={isActiveTable ? 'rgba(255,255,255,0.75)' : '#a8a29e'}
                >
                    {occupiedSeats}/{table.seats}
                </text>
            </svg>
        </div>
    );
}

function TableInfoCard({
                           table,
                           activeGuestId,
                       }: {
    table: SeatingTable;
    activeGuestId?: number;
}) {
    const isActiveTable = table.assignments.some(
        item => item.guestId === activeGuestId,
    );

    const occupied = table.assignments.reduce(
        (sum, assignment) => sum + assignment.peopleCount,
        0,
    );

    return (
        <div
            className={[
                'rounded-[28px] border p-5 shadow-sm',
                isActiveTable
                    ? 'border-amber-300 bg-amber-50/70'
                    : 'border-stone-100 bg-white/80',
            ].join(' ')}
        >
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                        {table.type === 'PRESIDIUM' ? 'Президиум' : 'Стол'}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl text-stone-900">
                        {table.name}
                    </h3>
                </div>

                <div className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">
                    {occupied}/{table.seats}
                </div>
            </div>

            <div className="space-y-2">
                {table.assignments.length ? (
                    table.assignments.map(assignment => {
                        const isActiveGuest = assignment.guestId === activeGuestId;
                        const seatEnd =
                            assignment.seatStart + assignment.peopleCount - 1;

                        return (
                            <div
                                key={assignment.id}
                                className={[
                                    'rounded-2xl px-4 py-3 text-sm',
                                    isActiveGuest
                                        ? 'bg-amber-100 text-stone-900'
                                        : 'bg-stone-50 text-stone-700',
                                ].join(' ')}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-medium">
                                            {assignment.guest.name}
                                        </p>
                                        <p className="mt-1 text-xs opacity-75">
                                            Места {assignment.seatStart}
                                            {assignment.peopleCount > 1
                                                ? `–${seatEnd}`
                                                : ''}
                                        </p>
                                    </div>

                                    <div className="shrink-0 text-xs opacity-75">
                                        {assignment.peopleCount} чел.
                                    </div>
                                </div>

                                {isActiveGuest && (
                                    <p className="mt-2 text-xs font-medium text-amber-700">
                                        Это ваше место
                                    </p>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-400">
                        Пока никого нет
                    </p>
                )}
            </div>
        </div>
    );
}

function buildSeatMap(
    table: SeatingTable,
    activeGuestId?: number,
): SeatItem[] {
    const result: SeatItem[] = Array.from({ length: table.seats }, (_, index) => ({
        seatNumber: index + 1,
        assignment: null,
        isActive: false,
    }));

    for (const assignment of table.assignments) {
        for (let offset = 0; offset < assignment.peopleCount; offset += 1) {
            const seatNumber = assignment.seatStart + offset;

            if (seatNumber < 1 || seatNumber > table.seats) {
                continue;
            }

            result[seatNumber - 1] = {
                seatNumber,
                assignment,
                isActive: assignment.guestId === activeGuestId,
            };
        }
    }

    return result;
}

function getRectSeatPositions(
    total: number,
    width: number,
    height: number,
    padding = 24,
) {
    const x1 = padding;
    const y1 = padding;
    const x2 = width - padding;
    const y2 = height - padding;

    const topLength = x2 - x1;
    const rightLength = y2 - y1;
    const bottomLength = x2 - x1;
    const leftLength = y2 - y1;

    const perimeter =
        topLength + rightLength + bottomLength + leftLength;

    return Array.from({ length: total }, (_, index) => {
        const distance = (index / total) * perimeter;

        if (distance <= topLength) {
            return { x: x1 + distance, y: y1 };
        }

        if (distance <= topLength + rightLength) {
            return {
                x: x2,
                y: y1 + (distance - topLength),
            };
        }

        if (distance <= topLength + rightLength + bottomLength) {
            return {
                x: x2 - (distance - topLength - rightLength),
                y: y2,
            };
        }

        return {
            x: x1,
            y: y2 - (distance - topLength - rightLength - bottomLength),
        };
    });
}

function Legend({
                    colorClass,
                    label,
                }: {
    colorClass: string;
    label: string;
}) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-stone-600 shadow-sm">
            <span className={`h-3 w-3 rounded-full ${colorClass}`} />
            <span>{label}</span>
        </div>
    );
}