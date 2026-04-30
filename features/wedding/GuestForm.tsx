'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

const formSchema = z
    .object({
        status: z.enum(['WILL_COME', 'WILL_NOT_COME'], {
            message: 'Выберите, сможете ли вы прийти',
        }),
        peopleCount: z.coerce.number().optional(),
        drinks: z.array(z.string()).optional(),
        comment: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.status === 'WILL_COME') {
            if (!data.peopleCount || data.peopleCount < 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['peopleCount'],
                    message: 'Укажите количество гостей',
                });
            }
        }
    });

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

type InitialResponse = {
    status: 'WILL_COME' | 'WILL_NOT_COME';
    peopleCount: number | null;
    drinks: string | null;
    comment: string | null;
};

type Props = {
    guestId: number;
    guestName: string;
    maxPeople: number;
    initialResponse: InitialResponse | null;
};

const drinkOptions = [
    'Вино красное',
    'Вино белое',
    'Шампанское',
    'Виски',
    'Водка',
    'Безалкогольные напитки',
];

export default function GuestForm({
                                      guestId,
                                      maxPeople,
                                      initialResponse,
                                  }: Props) {
    const [isSuccess, setIsSuccess] = useState(false);

    const initialDrinks = useMemo(() => {
        if (!initialResponse?.drinks) return [];

        try {
            return JSON.parse(initialResponse.drinks) as string[];
        } catch {
            return [];
        }
    }, [initialResponse]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormInput, unknown, FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: initialResponse?.status ?? undefined,
            peopleCount: initialResponse?.peopleCount ?? 1,
            drinks: initialDrinks,
            comment: initialResponse?.comment ?? '',
        },
    });

    const status = watch('status');
    const drinks = watch('drinks') ?? [];

    const onSubmit = async (values: FormValues) => {
        const response = await fetch('/api/guests/response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                guestId,
                ...values,
            }),
        });

        if (!response.ok) {
            throw new Error('Не удалось сохранить ответ');
        }

        setIsSuccess(true);
    };

    const toggleDrink = (drink: string) => {
        const current = drinks ?? [];

        if (current.includes(drink)) {
            setValue(
                'drinks',
                current.filter(item => item !== drink),
                { shouldValidate: true },
            );
            return;
        }

        setValue('drinks', [...current, drink], { shouldValidate: true });
    };

    return (
        <div className="max-w-2xl mx-auto text-left">
            <div className="text-center mb-8">
                <h2 className="font-serif text-3xl mb-3">
                    Подтвердите присутствие
                </h2>
                <p className="text-stone-500">
                    Пожалуйста, заполните небольшую анкету до 1 августа 2026.
                </p>
            </div>

            {isSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 rounded-2xl bg-green-50 text-green-800 border border-green-100 p-4 text-center"
                >
                    Спасибо! Ваш ответ сохранён.
                </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
                <div>
                    <p className="font-medium mb-3">Вы сможете прийти?</p>

                    <div className="grid md:grid-cols-2 gap-3">
                        <label className="cursor-pointer">
                            <input
                                type="radio"
                                value="WILL_COME"
                                className="peer sr-only"
                                {...register('status')}
                            />
                            <div className="rounded-2xl border border-stone-200 p-4 text-center peer-checked:bg-stone-800 peer-checked:text-white transition">
                                Да, я приду
                            </div>
                        </label>

                        <label className="cursor-pointer">
                            <input
                                type="radio"
                                value="WILL_NOT_COME"
                                className="peer sr-only"
                                {...register('status')}
                            />
                            <div className="rounded-2xl border border-stone-200 p-4 text-center peer-checked:bg-stone-800 peer-checked:text-white transition">
                                К сожалению, не смогу
                            </div>
                        </label>
                    </div>

                    {errors.status && (
                        <p className="text-red-500 text-sm mt-2">
                            {errors.status.message}
                        </p>
                    )}
                </div>

                {status === 'WILL_COME' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-7"
                    >
                        <div>
                            <label className="font-medium block mb-3">
                                Сколько человек будет?
                            </label>

                            <select
                                {...register('peopleCount')}
                                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-4 outline-none focus:border-stone-500"
                            >
                                {Array.from({ length: maxPeople }).map((_, index) => {
                                    const value = index + 1;

                                    return (
                                        <option key={value} value={value}>
                                            {value}
                                        </option>
                                    );
                                })}
                            </select>

                            {errors.peopleCount && (
                                <p className="text-red-500 text-sm mt-2">
                                    {errors.peopleCount.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <p className="font-medium mb-3">
                                Предпочтения по напиткам
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {drinkOptions.map(drink => {
                                    const isActive = drinks.includes(drink);

                                    return (
                                        <button
                                            key={drink}
                                            type="button"
                                            onClick={() => toggleDrink(drink)}
                                            className={[
                                                'rounded-full border px-4 py-2 transition',
                                                isActive
                                                    ? 'bg-stone-800 text-white border-stone-800'
                                                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400',
                                            ].join(' ')}
                                        >
                                            {drink}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                <div>
                    <label className="font-medium block mb-3">
                        Комментарий
                    </label>

                    <textarea
                        {...register('comment')}
                        rows={4}
                        placeholder="Например: аллергии, пожелания, особенности меню..."
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-4 outline-none focus:border-stone-500 resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-stone-800 text-white px-8 py-4 hover:bg-stone-700 transition disabled:opacity-60"
                >
                    {isSubmitting ? 'Сохраняем...' : 'Отправить ответ'}
                </button>
            </form>
        </div>
    );
}