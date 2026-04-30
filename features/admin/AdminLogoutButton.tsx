'use client';

import { useRouter } from 'next/navigation';

export default function AdminLogoutButton() {
    const router = useRouter();

    const logout = async () => {
        await fetch('/api/admin/logout', {
            method: 'POST',
        });

        router.push('/admin/login');
        router.refresh();
    };

    return (
        <button
            type="button"
            onClick={logout}
            className="rounded-2xl bg-white px-5 py-3 text-sm text-stone-700 shadow-sm transition hover:bg-stone-50"
        >
            Выйти
        </button>
    );
}