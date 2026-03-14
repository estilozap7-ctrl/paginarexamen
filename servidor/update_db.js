const { sequelize } = require('./db');
async function run() {
  try {
    // 1. Modificar tipos de questions
    await sequelize.query(`ALTER TABLE questions MODIFY type ENUM('MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'MATCHING', 'TEXT_DEVELOPMENT') DEFAULT 'SINGLE_CHOICE'`);
    console.log("type de questions modificado");
    
    // 2. Añadir column options si no existe
    try {
        await sequelize.query(`ALTER TABLE questions ADD options TEXT NULL`);
        console.log("options de questions añadido");
    } catch(e) { console.log(e.message); }

  } catch(e) {
    console.error(e);
  }
  process.exit();
}
run();
