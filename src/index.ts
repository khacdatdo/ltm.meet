import * as dotenv from 'dotenv';
import server from './websocket/index';
// Config environment variables
dotenv.config();

// Run app
const port = parseInt(process.env.PORT || '3000');
server.listen(port, () => console.log('Server is listening on port ' + port));
