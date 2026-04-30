const dressCodeColors = [
    {
        name: 'Пыльная роза',
        value: '#D8A7A7',
    },
    {
        name: 'Шампань',
        value: '#EADBC8',
    },
    {
        name: 'Молочный',
        value: '#F7F1E8',
    },
    {
        name: 'Оливковый',
        value: '#9A9B73',
    },
    {
        name: 'Какао',
        value: '#8A6F5A',
    },
];

export default function DressCodeBlock() {
    return (
        <section className="mx-auto mb-12 max-w-3xl text-left">
            <div className="rounded-[32px] border border-stone-100 bg-white/80 p-6 shadow-sm md:p-8">
                <p className="mb-3 text-sm uppercase tracking-[0.3em] text-stone-400">
                    Dress code
                </p>

                <h2 className="mb-4 font-serif text-3xl text-stone-800 md:text-4xl">
                    Дресс-код и палитра свадьбы
                </h2>

                <p className="mb-6 text-lg leading-8 text-stone-600">
                    Нам будет очень приятно, если вы поддержите атмосферу нашего праздника
                    и выберете наряд в спокойных природных оттенках. Подойдут мягкие,
                    нежные и благородные цвета без слишком ярких акцентов.
                </p>

                <div className="mb-8 rounded-[24px] bg-[#f7f1eb] p-5">
                    <p className="mb-3 font-medium text-stone-800">
                        Для девушек
                    </p>

                    <p className="leading-7 text-stone-600">
                        Платья, костюмы или комплекты в оттенках пудрового, бежевого,
                        шампань, молочного, оливкового или какао. Просим по возможности
                        избегать белого цвета, чтобы оставить его для невесты.
                    </p>
                </div>

                <div className="mb-8 rounded-[24px] bg-[#f7f1eb] p-5">
                    <p className="mb-3 font-medium text-stone-800">
                        Для мужчин
                    </p>

                    <p className="leading-7 text-stone-600">
                        Классический костюм, рубашка, брюки с пиджаком или жилетом.
                        Отлично подойдут бежевые, серые, коричневые, оливковые и другие
                        спокойные оттенки.
                    </p>
                </div>

                <div>
                    <p className="mb-4 font-medium text-stone-800">
                        Наша цветовая палитра
                    </p>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                        {dressCodeColors.map(color => (
                            <div key={color.value} className="text-center">
                                <div
                                    className="mx-auto mb-3 h-20 w-20 rounded-full border border-white shadow-sm ring-1 ring-stone-100"
                                    style={{ backgroundColor: color.value }}
                                />

                                <p className="text-sm text-stone-600">
                                    {color.name}
                                </p>

                                <p className="mt-1 text-xs text-stone-400">
                                    {color.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 rounded-[24px] border border-stone-100 bg-white p-5">
                    <p className="leading-7 text-stone-600">
                        Главное — чтобы вам было комфортно. Дресс-код не строгий, но единая
                        палитра поможет сделать фотографии особенно красивыми и атмосферными.
                    </p>
                </div>
            </div>
        </section>
    );
}