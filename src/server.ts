import { App } from '@/app';
import { ValidateEnv } from '@utils/validateEnv';
import { ReportsRoute } from './routes/reporting.route';

ValidateEnv();

const app = new App([new ReportsRoute()]);

app.listen();
