import { notFound } from 'next/navigation';
import { prisma } from '@/src/shared/lib/prisma';
import GuestForm from '@/features/wedding/GuestForm';
import BanquetMapBlock from "@/features/wedding/BanquetMapBlock";
import DressCodeBlock from "@/features/wedding/DressCodeBlock";
import Image from 'next/image';

type Props = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function InvitePage({ params }: Props) {
    const { slug } = await params;

    const guest = await prisma.guest.findUnique({
        where: { slug },
        include: {
            response: true,
        },
    });

    if (!guest) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#f7eee7] text-stone-800">
            <section className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff_0,#f7eee7_45%,#e7d3c2_100%)]" />

                <div className="relative z-10 w-full max-w-4xl">
                    <div className="bg-white/70 backdrop-blur-md rounded-[40px] shadow-2xl border border-white px-6 py-10 md:px-16 md:py-14 text-center">
                        <p className="text-sm uppercase tracking-[0.45em] text-stone-500 mb-8">
                            Wedding day
                        </p>

                        <h1 className="font-serif text-5xl md:text-8xl mb-6">
                            Александр <span className="text-stone-400">&</span> Дарья
                        </h1>

                        <p className="text-xl md:text-2xl mb-8 text-stone-600">
                            28 августа 2026
                        </p>
                        <CoupleHeroPhoto />
                        <div className="w-24 h-px bg-stone-300 mx-auto mb-8" />

                        <p className="text-2xl md:text-3xl font-serif mb-6">
                            Дорогой гость, {guest.name}
                        </p>

                        <p className="max-w-2xl mx-auto text-stone-600 leading-8 mb-10">
                            Мы с радостью приглашаем вас разделить с нами день нашей свадьбы.
                            Для нас будет большой честью видеть вас рядом в этот особенный момент.
                        </p>

                        <div className="grid gap-4 mb-12 text-left sm:grid-cols-2 lg:grid-cols-4">
                            <InfoCard title="Дата" value="28.08.2026" />
                            <InfoCard title="Время" value="16:00" />
                            <InfoCard title="Место" value='Ресторан "Завидное"' />
                            <InfoCard title="Дресс-код" value="Нежная палитра" />
                        </div>
                        <CoupleGallery />
                        <BanquetMapBlock />
                        <DressCodeBlock />
                        <TelegramBlock />
                        <GuestForm
                            guestId={guest.id}
                            guestName={guest.name}
                            maxPeople={guest.maxPeople}
                            initialResponse={
                                guest.response
                                    ? {
                                        status: guest.response.status,
                                        peopleCount: guest.response.peopleCount,
                                        drinks: guest.response.drinks,
                                        comment: guest.response.comment,
                                    }
                                    : null
                            }
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}

function InfoCard({ title, value }: { title: string; value: string }) {
    return (
        <div className="rounded-3xl bg-white/70 border border-stone-100 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-2">
                {title}
            </p>
            <p className="text-lg text-stone-700">{value}</p>
        </div>
    );
}

function TelegramBlock() {
    const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_GROUP_URL;

    if (!telegramUrl) {
        return null;
    }

    return (
        <div className="mx-auto mb-12 max-w-2xl rounded-[28px] border border-sky-100 bg-sky-50/80 p-6 text-left shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="mb-2 text-sm uppercase tracking-[0.25em] text-sky-500">
                        Telegram
                    </p>

                    <h2 className="mb-2 font-serif text-3xl text-stone-800">
                        Присоединяйтесь к группе гостей
                    </h2>

                    <p className="text-stone-600 leading-7">
                        В Telegram-группе мы будем делиться важной информацией:
                        таймингом, адресом, деталями трансфера и фотографиями после свадьбы.
                    </p>
                </div>

                <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-white transition hover:bg-sky-600"
                >
                    Вступить
                </a>
            </div>
        </div>
    );
}

function CoupleHeroPhoto() {
    return (
        <div className="mx-auto mb-10 max-w-2xl">
            <div className="relative overflow-hidden rounded-[36px] border border-white bg-white p-2 shadow-xl">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] md:aspect-[16/10]">
                    <Image
                        src="/images/couple-main.jpg"
                        alt="Александр и Дарья"
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 768px"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

                    <div className="absolute bottom-5 left-5 right-5 text-left text-white">
                        <p className="text-sm uppercase tracking-[0.3em] opacity-90">
                            Our story
                        </p>
                        <p className="mt-2 font-serif text-3xl md:text-4xl">
                            Скоро станем семьёй
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CoupleGallery() {
    const photos = [
        {
            src: '/images/couple-1.jpg',
            alt: 'Фотография Александра и Дарьи 1',
        },
        {
            src: '/images/couple-2.jpg',
            alt: 'Фотография Александра и Дарьи 2',
        },
        {
            src: '/images/couple-3.jpg',
            alt: 'Фотография Александра и Дарьи 3',
        },
    ];

    return (
        <section className="mx-auto mb-12 max-w-3xl text-left">
            <div className="rounded-[32px] border border-stone-100 bg-white/80 p-6 shadow-sm md:p-8">
                <p className="mb-3 text-sm uppercase tracking-[0.3em] text-stone-400">
                    Moments
                </p>

                <h2 className="mb-4 font-serif text-3xl text-stone-800 md:text-4xl">
                    Немного наших моментов
                </h2>

                <p className="mb-6 text-lg leading-8 text-stone-600">
                    Мы оставили здесь место для нескольких любимых фотографий,
                    чтобы приглашение стало ещё более личным и тёплым.
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                    {photos.map((photo, index) => (
                        <div
                            key={photo.src}
                            className={[
                                'relative overflow-hidden rounded-[28px] bg-stone-100 shadow-sm',
                                index === 1 ? 'md:-translate-y-4' : '',
                            ].join(' ')}
                        >
                            <div className="relative aspect-[3/4] w-full">
                                <Image
                                    src={photo.src}
                                    alt={photo.alt}
                                    fill
                                    className="object-cover transition duration-500 hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 260px"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}