const User = require('./models/User');

async function check() {
    try {
        const users = await User.findAll();
        console.log('--- ALL USERS ---');
        users.forEach(u => {
            console.log(`${u.full_name} | ${u.email} | ${u.id}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
