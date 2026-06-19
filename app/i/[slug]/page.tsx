import { notFound } from 'next/navigation';
import GuestForm from '@/features/wedding/GuestForm';
import BanquetMapBlock from '@/features/wedding/BanquetMapBlock';
import DressCodeBlock from '@/features/wedding/DressCodeBlock';
import Image from 'next/image';
import Reveal from '@/src/shared/ui/Reveal';
import Link from 'next/link';
import { supabaseAdmin } from '@/src/shared/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function InvitePage({ params }: Props) {
    const { slug } = await params;

    const { data: guest, error: guestError } = await supabaseAdmin
        .from('Guest')
        .select('*')
        .eq('slug', slug)
        .single();

    if (guestError || !guest) {
        notFound();
    }

    const { data: response, error: responseError } = await supabaseAdmin
        .from('GuestResponse')
        .select('*')
        .eq('guestId', guest.id)
        .maybeSingle();

    if (responseError) {
        console.error(responseError);
    }

    const guestWithResponse = {
        ...guest,
        response: response ?? null,
    };

    return (
        <main className="min-h-screen bg-[#f7eee7] text-stone-800">
            <section className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff_0,#f7eee7_45%,#e7d3c2_100%)]" />

                <div className="relative z-10 w-full max-w-4xl">
                    <div className="bg-white/70 backdrop-blur-md rounded-[40px] shadow-2xl border border-white px-6 py-10 md:px-16 md:py-14 text-center">
                        <Reveal>
                            <p className="text-sm uppercase tracking-[0.45em] text-stone-500 mb-8">
                                Wedding day
                            </p>

                            <h1 className="font-serif mb-6 whitespace-nowrap text-[36px] sm:text-6xl md:text-8xl">
                                Александр <span className="text-stone-400">&</span> Дарья
                            </h1>

                            <p className="text-xl md:text-2xl mb-8 text-stone-600">
                                28 августа 2026
                            </p>
                        </Reveal>

                        <Reveal delay={0.1}>
                            <CoupleHeroPhoto />
                        </Reveal>

                        <Reveal delay={0.15}>
                            <div className="w-24 h-px bg-stone-300 mx-auto mb-8" />

                            <p className="text-3xl md:text-4xl font-serif font-semibold mb-6">
                                {guestWithResponse.name}!
                            </p>

                            <p className="max-w-2xl mx-auto text-stone-600 leading-8 mb-10">
                                От всей души приглашаем вас разделить с нами день нашей свадьбы.
                                Для нас будет большой честью видеть вас рядом в этот особенный момент.
                            </p>
                        </Reveal>

                        <Reveal delay={0.1}>
                            <div className="grid gap-4 mb-12 text-left sm:grid-cols-2 lg:grid-cols-4">
                                <InfoCard title="Дата" value="28.08.2026" />
                                <InfoCard title="Время" value="16:00" />
                                <InfoCard title="Место" value='Ресторан "Завидное"' />
                                <InfoCard title="Дресс-код" value="Нежная палитра" />
                            </div>
                        </Reveal>

                        <Reveal>
                            <CoupleGallery />
                        </Reveal>

                        <Reveal>
                            <BanquetMapBlock />
                        </Reveal>

                        <Reveal>
                            <DressCodeBlock />
                        </Reveal>

                        <Reveal>
                            <GiftBlock />
                        </Reveal>

                        <Reveal>
                            <TelegramBlock />
                        </Reveal>

                        <Reveal>
                            <MaxBlock />
                        </Reveal>

                        <Reveal>
                            <SeatingPlanButton slug={guestWithResponse.slug} />
                        </Reveal>

                        <Reveal>
                            <GuestForm
                                guestId={guestWithResponse.id}
                                guestName={guestWithResponse.name}
                                maxPeople={guestWithResponse.maxPeople}
                                initialResponse={
                                    guestWithResponse.response
                                        ? {
                                            status: guestWithResponse.response.status,
                                            peopleCount: guestWithResponse.response.peopleCount,
                                            drinks: guestWithResponse.response.drinks ?? [],
                                            comment: guestWithResponse.response.comment,
                                        }
                                        : null
                                }
                            />
                        </Reveal>
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
                        таймингом, адресом и фотографиями после свадьбы.
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

function MaxBlock() {
    const maxUrl = process.env.NEXT_PUBLIC_MAX_GROUP_URL;

    if (!maxUrl) {
        return null;
    }

    return (
        <div className="mx-auto mb-12 max-w-2xl rounded-[28px] border border-[#D8E7FF] bg-gradient-to-br from-[#F4F8FF] via-[#EEF6FF] to-[#E8F2FF] p-6 text-left shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#3367D6]">
                        MAX
                    </p>

                    <h2 className="mb-2 font-serif text-3xl text-stone-800">
                        Присоединяйтесь к группе гостей
                    </h2>

                    <p className="text-stone-600 leading-7">
                        В MAX-группе мы будем делиться важной информацией:
                        таймингом, адресом и фотографиями после свадьбы.
                    </p>
                </div>

                <a
                    href={maxUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#3367D6] px-6 py-3 text-white shadow-sm transition hover:bg-[#2A56B3]"
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
                    Photos
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                    {photos.map((photo, index) => (
                        <Reveal key={photo.src} delay={index * 0.12}>
                            <div
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
                                        loading="eager"
                                    />
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

function SeatingPlanButton({ slug }: { slug: string }) {
    return (
        <div className="mx-auto mb-12 max-w-2xl rounded-[28px] border border-stone-100 bg-white/80 p-6 text-center shadow-sm">
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-stone-400">
                Seating plan
            </p>

            <h2 className="mb-3 font-serif text-3xl text-stone-800">
                План рассадки гостей
            </h2>

            <p className="mx-auto mb-6 max-w-xl leading-7 text-stone-600">
                Мы подготовили схему рассадки, чтобы вам было легко найти свой стол
                в день торжества.
            </p>

            <Link
                href={`/i/${slug}/seating`}
                className="inline-flex items-center justify-center rounded-full bg-stone-900 px-7 py-3 text-white transition hover:bg-stone-700"
            >
                Посмотреть рассадку
            </Link>
        </div>
    );
}

function GiftBlock() {
    return (
        <div className="mx-auto mb-12 max-w-2xl rounded-[28px] border border-amber-100 bg-gradient-to-br from-[#fffaf0] via-[#fff7e8] to-[#f7eee7] p-6 text-left shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="mb-2 text-sm uppercase tracking-[0.25em] text-amber-600">
                        Gifts
                    </p>

                    <h2 className="mb-2 font-serif text-3xl text-stone-800">
                        О подарках
                    </h2>

                    <p className="text-stone-600 leading-7">
                        Ваше присутствие на нашем празднике - уже большая радость для нас.
                        Если вы захотите порадовать нас подарком, мы будем благодарны за вклад
                        в наш семейный бюджет.
                    </p>

                    <p className="mt-4 text-stone-600 leading-7">
                        Такой подарок поможет нам осуществить общие мечты, обустроить будущий быт
                        и станет для нас самым универсальным и желанным вариантом.
                    </p>
                </div>

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-100 text-3xl">
                    🎁
                </div>
            </div>
        </div>
    );
}