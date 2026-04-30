'use client';

const banquetAddress =
    process.env.NEXT_PUBLIC_BANQUET_ADDRESS ??
    'Адрес банкета будет указан позже';

const yandexMapUrl = process.env.NEXT_PUBLIC_YANDEX_MAP_URL;
const yandexRouteUrl = process.env.NEXT_PUBLIC_YANDEX_ROUTE_URL;

const weddingTitle =
    process.env.NEXT_PUBLIC_WEDDING_TITLE ?? 'Свадьба';

const weddingDate =
    process.env.NEXT_PUBLIC_WEDDING_DATE ?? '2026-08-28';

const weddingStartTime =
    process.env.NEXT_PUBLIC_WEDDING_START_TIME ?? '16:00';

const weddingEndTime =
    process.env.NEXT_PUBLIC_WEDDING_END_TIME ?? '23:00';

function toCalendarDateTime(date: string, time: string) {
    return `${date.replaceAll('-', '')}T${time.replace(':', '')}00`;
}

function downloadIcsFile() {
    const start = toCalendarDateTime(weddingDate, weddingStartTime);
    const end = toCalendarDateTime(weddingDate, weddingEndTime);

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Wedding Invite//RU',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `SUMMARY:${weddingTitle}`,
        `DTSTART;TZID=Europe/Moscow:${start}`,
        `DTEND;TZID=Europe/Moscow:${end}`,
        `LOCATION:${banquetAddress}`,
        'DESCRIPTION:Свадьба. Не забудьте подтвердить присутствие на сайте-приглашении.',
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        'DESCRIPTION:Завтра свадьба',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], {
        type: 'text/calendar;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'wedding-reminder.ics';
    link.click();

    URL.revokeObjectURL(url);
}

export default function BanquetMapBlock() {

    return (
        <section className="mx-auto mb-12 max-w-3xl text-left">
            <div className="overflow-hidden rounded-[32px] border border-stone-100 bg-white shadow-sm">
                <div className="p-6 md:p-8">
                    <p className="mb-3 text-sm uppercase tracking-[0.3em] text-stone-400">
                        Адрес банкета
                    </p>

                    <h2 className="mb-3 font-serif text-3xl text-stone-800 md:text-4xl">
                        Ждём вас на празднике
                    </h2>

                    <p className="mb-6 text-lg leading-8 text-stone-600">
                        {banquetAddress}
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        {yandexRouteUrl && (
                            <a
                                href={yandexRouteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-white transition hover:bg-stone-700"
                            >
                                Построить маршрут
                            </a>
                        )}

                        <button
                            type="button"
                            onClick={downloadIcsFile}
                            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-3 text-stone-700 transition hover:border-stone-700"
                        >
                            Скачать напоминание
                        </button>
                    </div>
                </div>

                {yandexMapUrl && (
                    <div className="h-[320px] w-full border-t border-stone-100 md:h-[420px]">
                        <iframe
                            src={yandexMapUrl}
                            width="100%"
                            height="100%"
                            allowFullScreen
                            loading="lazy"
                            className="block border-0"
                            title="Карта места проведения банкета"
                        />
                    </div>
                )}
            </div>
        </section>
    );
}