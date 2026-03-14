const User = require('./models/User');

async function check() {
    try {
        const users = await User.findAll({
            where: {
                full_name: {
                    [require('sequelize').Op.like]: '%luis buelvas%'
                }
            },
            raw: true
        });
        
        console.log('--- DUPLICATE LUIS BUELVAS CHECK ---');
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
