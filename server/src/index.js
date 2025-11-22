const config = require('./config/env');
const connectDatabase = require('./config/database');
const app = require('./app');
const ensureAdminAccount = require('./utils/ensureAdminAccount');

async function bootstrap() {
  await connectDatabase();
  await ensureAdminAccount();

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}

bootstrap();
