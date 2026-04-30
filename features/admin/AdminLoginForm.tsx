'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginForm() {
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const login = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message ?? 'Не удалось войти');
                return;
            }

            router.push('/admin');
            router.refresh();
        } catch (error) {
            console.error(error);
            setError('Ошибка входа');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={login} className="space-y-5">
            <div>
                <label className="mb-2 block text-sm text-stone-500">
                    Пароль администратора
                </label>

                <input
                    type="password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    placeholder="Введите пароль"
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                />
            </div>

            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting || !password.trim()}
                className="w-full rounded-2xl bg-stone-900 px-5 py-3 text-white transition hover:bg-stone-700 disabled:opacity-50"
            >
                {isSubmitting ? 'Входим...' : 'Войти'}
            </button>
        </form>
    );
}