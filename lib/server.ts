import * as dotenv from 'dotenv';
import app from "./app";
// initialize configuration
dotenv.config({ path: __dirname + '/.env' })

const PORT = process.env.SERVER_PORT;
app.listen(PORT, () => {
    console.log('Express server listening on port ' + PORT);
})