import AdminLoginForm from '@/features/admin/AdminLoginForm';

export default function AdminLoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f7f1eb] px-4 text-stone-900">
            <div className="w-full max-w-md rounded-[32px] border border-stone-100 bg-white p-8 shadow-sm">
                <p className="mb-3 text-sm uppercase tracking-[0.35em] text-stone-500">
                    Wedding admin
                </p>

                <h1 className="mb-3 font-serif text-4xl">
                    Вход в админку
                </h1>

                <p className="mb-8 text-stone-500">
                    Введите пароль, чтобы управлять приглашениями и ответами гостей.
                </p>

                <AdminLoginForm />
            </div>
        </main>
    );
}