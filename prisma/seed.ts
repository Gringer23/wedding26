import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    await prisma.guest.upsert({
        where: { slug: 'ivan-petrov' },
        update: {},
        create: {
            name: 'Иван Петров',
            slug: 'ivan-petrov',
            maxPeople: 2,
        },
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async error => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });