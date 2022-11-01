import * as dotenv from 'dotenv';
import HttpServer from './socket-server';
// Config environment variables
dotenv.config();

// Run app
const port = parseInt(process.env.PORT || '3000');
HttpServer.listen(port, () => console.log('Server is listening on port ' + port));
