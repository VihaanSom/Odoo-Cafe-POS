const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Start seeding...');

    // 1. Create a Test Branch
    const branch = await prisma.branch.create({
        data: {
            name: 'Main Branch',
            address: '123 Coffee St',
        },
    });
    console.log(`Created Branch with ID: ${branch.id}`);

    // 2. Create a Test User (Admin)
    const uniqueEmail = `admin_${Date.now()}@odoocafe.com`;
    // We create a new user to avoid hitting any bad rows during lookup of existing ones
    const user = await prisma.user.create({
        data: {
            email: uniqueEmail,
            name: 'Admin User',
            password: '$2a$12$V.o/s.f/s.f/s.f/s.f/s.f/s.f/s.f/s.f/s.f/s.f/s.f/s.f/s.f', // Placeholder hash
        },
    });
    console.log(`Created User with ID: ${user.id} (${uniqueEmail})`);

    // 3. Create a POS Terminal
    const terminal = await prisma.posTerminal.create({
        data: {
            terminalName: 'Counter 1',
            branchId: branch.id,
            userId: user.id,
        },
    });

    console.log(`\n✅ Seeding finished.`);
    console.log(`------------------------------------------`);
    console.log(`🔑 YOUR TERMINAL ID FOR POSTMAN:`);
    console.log(`${terminal.id}`);
    console.log(`------------------------------------------`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
