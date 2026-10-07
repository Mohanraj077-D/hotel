const db = require('./src/db');
(async () => {
  try {
    const result = await db.query("UPDATE hotels SET image = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500' WHERE length(image) > 1000");
    console.log(`Database cleaned! Updated ${result.rowCount} rows.`);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
