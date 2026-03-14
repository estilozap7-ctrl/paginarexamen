const { sequelize } = require('./db');
async function check() {
  const [qRes] = await sequelize.query("SHOW CREATE TABLE questions");
  console.log("== QUESTIONS ==");
  console.log(Object.values(qRes[0])[1]);
  process.exit(0);
}
check();
