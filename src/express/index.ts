import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import router from './router';

//@ts-ignore
const app = express();

app.set('views', 'src/views');
app.set('view engine', 'ejs');

app.use(express.static('src/public'));
app.use(express.json());
//@ts-ignore
app.use(cookieParser());
app.use(router);

export default app;
