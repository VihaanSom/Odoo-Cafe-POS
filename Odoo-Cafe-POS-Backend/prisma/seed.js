const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data in order (respecting foreign keys)
    console.log('🗑️  Clearing existing data...');
    await prisma.receipt.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.posSession.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.table.deleteMany();
    await prisma.floor.deleteMany();
    await prisma.posTerminal.deleteMany();
    await prisma.paymentSettings.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Cleared existing data');

    // ========== USERS ==========
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@odoo-cafe.com',
            password: hashedPassword,
        }
    });

    const cashier1 = await prisma.user.create({
        data: {
            name: 'Rahul Sharma',
            email: 'rahul@odoo-cafe.com',
            password: hashedPassword,
        }
    });

    const cashier2 = await prisma.user.create({
        data: {
            name: 'Priya Patel',
            email: 'priya@odoo-cafe.com',
            password: hashedPassword,
        }
    });

    console.log('✅ Created 3 users');

    // ========== BRANCHES ==========
    const mainBranch = await prisma.branch.create({
        data: {
            name: 'Main Street Cafe',
            address: '123 Main Street, Downtown, Mumbai 400001',
        }
    });

    const mallBranch = await prisma.branch.create({
        data: {
            name: 'Mall Outlet',
            address: 'Phoenix Mall, 2nd Floor, Food Court, Bangalore 560001',
        }
    });

    console.log('✅ Created 2 branches');

    // ========== PAYMENT SETTINGS ==========
    await prisma.paymentSettings.create({
        data: {
            branchId: mainBranch.id,
            upiId: 'odoocafe@upi',
            upiName: 'Odoo Cafe Main',
            merchantCode: 'ODOO001',
        }
    });

    await prisma.paymentSettings.create({
        data: {
            branchId: mallBranch.id,
            upiId: 'odoocafe.mall@upi',
            upiName: 'Odoo Cafe Mall',
            merchantCode: 'ODOO002',
        }
    });

    console.log('✅ Created 2 payment settings');

    // ========== POS TERMINALS ==========
    const terminal1 = await prisma.posTerminal.create({
        data: {
            branchId: mainBranch.id,
            userId: cashier1.id,
            terminalName: 'Main Counter',
        }
    });

    const terminal2 = await prisma.posTerminal.create({
        data: {
            branchId: mainBranch.id,
            userId: cashier2.id,
            terminalName: 'Express Counter',
        }
    });

    const terminal3 = await prisma.posTerminal.create({
        data: {
            branchId: mallBranch.id,
            userId: null,
            terminalName: 'Mall Counter 1',
        }
    });

    console.log('✅ Created 3 POS terminals');

    // ========== POS SESSIONS ==========
    const session1 = await prisma.posSession.create({
        data: {
            terminalId: terminal1.id,
            totalSales: 15000.00,
        }
    });

    const session2 = await prisma.posSession.create({
        data: {
            terminalId: terminal2.id,
            totalSales: 8500.00,
        }
    });

    console.log('✅ Created 2 POS sessions');

    // ========== FLOORS ==========
    const groundFloor = await prisma.floor.create({
        data: { branchId: mainBranch.id, name: 'Ground Floor' }
    });

    const firstFloor = await prisma.floor.create({
        data: { branchId: mainBranch.id, name: 'First Floor' }
    });

    const outdoor = await prisma.floor.create({
        data: { branchId: mainBranch.id, name: 'Outdoor Patio' }
    });

    const mallFloor = await prisma.floor.create({
        data: { branchId: mallBranch.id, name: 'Food Court Area' }
    });

    console.log('✅ Created 4 floors');

    // ========== TABLES ==========
    const table1 = await prisma.table.create({
        data: { floorId: groundFloor.id, tableNumber: 1, status: 'FREE' }
    });
    const table2 = await prisma.table.create({
        data: { floorId: groundFloor.id, tableNumber: 2, status: 'OCCUPIED' }
    });
    await prisma.table.createMany({
        data: [
            { floorId: groundFloor.id, tableNumber: 3, status: 'FREE' },
            { floorId: groundFloor.id, tableNumber: 4, status: 'FREE' },
            { floorId: groundFloor.id, tableNumber: 5, status: 'FREE' },
            { floorId: groundFloor.id, tableNumber: 6, status: 'FREE' },
            { floorId: firstFloor.id, tableNumber: 7, status: 'FREE' },
            { floorId: firstFloor.id, tableNumber: 8, status: 'OCCUPIED' },
            { floorId: firstFloor.id, tableNumber: 9, status: 'FREE' },
            { floorId: firstFloor.id, tableNumber: 10, status: 'FREE' },
            { floorId: outdoor.id, tableNumber: 11, status: 'FREE' },
            { floorId: outdoor.id, tableNumber: 12, status: 'FREE' },
            { floorId: outdoor.id, tableNumber: 13, status: 'FREE' },
            { floorId: outdoor.id, tableNumber: 14, status: 'FREE' },
            { floorId: mallFloor.id, tableNumber: 1, status: 'FREE' },
            { floorId: mallFloor.id, tableNumber: 2, status: 'FREE' },
            { floorId: mallFloor.id, tableNumber: 3, status: 'FREE' },
            { floorId: mallFloor.id, tableNumber: 4, status: 'FREE' },
        ]
    });

    console.log('✅ Created 18 tables');

    // ========== CATEGORIES ==========
    const beverages = await prisma.category.create({
        data: { branchId: mainBranch.id, name: 'Beverages' }
    });
    const snacks = await prisma.category.create({
        data: { branchId: mainBranch.id, name: 'Snacks' }
    });
    const desserts = await prisma.category.create({
        data: { branchId: mainBranch.id, name: 'Desserts' }
    });
    const meals = await prisma.category.create({
        data: { branchId: mainBranch.id, name: 'Meals' }
    });
    const mallBeverages = await prisma.category.create({
        data: { branchId: mallBranch.id, name: 'Beverages' }
    });
    const mallSnacks = await prisma.category.create({
        data: { branchId: mallBranch.id, name: 'Snacks' }
    });

    console.log('✅ Created 6 categories');

    // ========== PRODUCTS ==========
    const espresso = await prisma.product.create({
        data: { branchId: mainBranch.id, categoryId: beverages.id, name: 'Espresso', price: 120, isActive: true }
    });
    const cappuccino = await prisma.product.create({
        data: { branchId: mainBranch.id, categoryId: beverages.id, name: 'Cappuccino', price: 180, isActive: true }
    });
    const latte = await prisma.product.create({
        data: { branchId: mainBranch.id, categoryId: beverages.id, name: 'Latte', price: 200, isActive: true }
    });
    const croissant = await prisma.product.create({
        data: { branchId: mainBranch.id, categoryId: snacks.id, name: 'Croissant', price: 80, isActive: true }
    });
    const brownie = await prisma.product.create({
        data: { branchId: mainBranch.id, categoryId: desserts.id, name: 'Chocolate Brownie', price: 120, isActive: true }
    });

    await prisma.product.createMany({
        data: [
            { branchId: mainBranch.id, categoryId: beverages.id, name: 'Americano', price: 150, isActive: true },
            { branchId: mainBranch.id, categoryId: beverages.id, name: 'Cold Brew', price: 220, isActive: true },
            { branchId: mainBranch.id, categoryId: beverages.id, name: 'Iced Tea', price: 100, isActive: true },
            { branchId: mainBranch.id, categoryId: beverages.id, name: 'Fresh Orange Juice', price: 150, isActive: true },
            { branchId: mainBranch.id, categoryId: snacks.id, name: 'Chocolate Muffin', price: 100, isActive: true },
            { branchId: mainBranch.id, categoryId: snacks.id, name: 'Cheese Sandwich', price: 150, isActive: true },
            { branchId: mainBranch.id, categoryId: snacks.id, name: 'Veggie Wrap', price: 180, isActive: true },
            { branchId: mainBranch.id, categoryId: desserts.id, name: 'Cheesecake', price: 200, isActive: true },
            { branchId: mainBranch.id, categoryId: desserts.id, name: 'Ice Cream Sundae', price: 180, isActive: true },
            { branchId: mainBranch.id, categoryId: meals.id, name: 'Club Sandwich', price: 280, isActive: true },
            { branchId: mainBranch.id, categoryId: meals.id, name: 'Pasta Alfredo', price: 350, isActive: true },
            { branchId: mainBranch.id, categoryId: meals.id, name: 'Grilled Chicken Salad', price: 320, isActive: true },
            { branchId: mallBranch.id, categoryId: mallBeverages.id, name: 'Espresso', price: 130, isActive: true },
            { branchId: mallBranch.id, categoryId: mallBeverages.id, name: 'Latte', price: 210, isActive: true },
            { branchId: mallBranch.id, categoryId: mallSnacks.id, name: 'Croissant', price: 90, isActive: true },
        ]
    });

    console.log('✅ Created 20 products');

    // ========== ORDERS ==========
    const order1 = await prisma.order.create({
        data: {
            branchId: mainBranch.id,
            sessionId: session1.id,
            tableId: table2.id,
            createdBy: cashier1.id,
            orderType: 'DINE_IN',
            status: 'COMPLETED',
            totalAmount: 560.00,
        }
    });

    const order2 = await prisma.order.create({
        data: {
            branchId: mainBranch.id,
            sessionId: session1.id,
            tableId: null,
            createdBy: cashier1.id,
            orderType: 'TAKEAWAY',
            status: 'COMPLETED',
            totalAmount: 380.00,
        }
    });

    const order3 = await prisma.order.create({
        data: {
            branchId: mainBranch.id,
            sessionId: session2.id,
            tableId: table1.id,
            createdBy: cashier2.id,
            orderType: 'DINE_IN',
            status: 'IN_PROGRESS',
            totalAmount: 450.00,
        }
    });

    const order4 = await prisma.order.create({
        data: {
            branchId: mainBranch.id,
            sessionId: session2.id,
            tableId: null,
            createdBy: cashier2.id,
            orderType: 'TAKEAWAY',
            status: 'CREATED',
            totalAmount: 200.00,
        }
    });

    console.log('✅ Created 4 orders');

    // ========== ORDER ITEMS ==========
    await prisma.orderItem.createMany({
        data: [
            // Order 1 items
            { orderId: order1.id, productId: cappuccino.id, quantity: 2, priceAtTime: 180.00 },
            { orderId: order1.id, productId: croissant.id, quantity: 2, priceAtTime: 80.00 },
            { orderId: order1.id, productId: brownie.id, quantity: 1, priceAtTime: 120.00 },
            // Order 2 items
            { orderId: order2.id, productId: latte.id, quantity: 1, priceAtTime: 200.00 },
            { orderId: order2.id, productId: espresso.id, quantity: 1, priceAtTime: 120.00 },
            { orderId: order2.id, productId: croissant.id, quantity: 1, priceAtTime: 80.00 },
            // Order 3 items
            { orderId: order3.id, productId: cappuccino.id, quantity: 1, priceAtTime: 180.00 },
            { orderId: order3.id, productId: latte.id, quantity: 1, priceAtTime: 200.00 },
            { orderId: order3.id, productId: brownie.id, quantity: 1, priceAtTime: 120.00 },
            // Order 4 items
            { orderId: order4.id, productId: espresso.id, quantity: 1, priceAtTime: 120.00 },
            { orderId: order4.id, productId: croissant.id, quantity: 1, priceAtTime: 80.00 },
        ]
    });

    console.log('✅ Created 11 order items');

    // ========== PAYMENTS ==========
    await prisma.payment.create({
        data: {
            orderId: order1.id,
            method: 'CARD',
            amount: 560.00,
            status: 'COMPLETED',
            transactionReference: 'TXN001234567890',
        }
    });

    await prisma.payment.create({
        data: {
            orderId: order2.id,
            method: 'UPI',
            amount: 380.00,
            status: 'COMPLETED',
            transactionReference: 'UPI202601251234',
        }
    });

    await prisma.payment.create({
        data: {
            orderId: order3.id,
            method: 'CASH',
            amount: 450.00,
            status: 'PENDING',
            transactionReference: null,
        }
    });

    console.log('✅ Created 3 payments');

    // ========== RECEIPTS ==========
    await prisma.receipt.create({
        data: {
            orderId: order1.id,
            receiptNumber: 'RCP-2026-0001',
        }
    });

    await prisma.receipt.create({
        data: {
            orderId: order2.id,
            receiptNumber: 'RCP-2026-0002',
        }
    });

    console.log('✅ Created 2 receipts');

    // ========== SUMMARY ==========
    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ├── Users: 3');
    console.log('   ├── Branches: 2');
    console.log('   ├── Payment Settings: 2');
    console.log('   ├── POS Terminals: 3');
    console.log('   ├── POS Sessions: 2');
    console.log('   ├── Floors: 4');
    console.log('   ├── Tables: 18');
    console.log('   ├── Categories: 6');
    console.log('   ├── Products: 20');
    console.log('   ├── Orders: 4');
    console.log('   ├── Order Items: 11');
    console.log('   ├── Payments: 3');
    console.log('   └── Receipts: 2');
    console.log('\n🔐 Login credentials:');
    console.log('   • admin@odoo-cafe.com / password123');
    console.log('   • rahul@odoo-cafe.com / password123');
    console.log('   • priya@odoo-cafe.com / password123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
