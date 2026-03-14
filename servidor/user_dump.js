const User = require('./models/User');

async function check() {
    try {
        const users = await User.findAll({ raw: true });
        console.log('--- USER DUMP ---');
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
