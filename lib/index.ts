import * as dotenv from 'dotenv';
import app from "./app";
// initialize configuration
dotenv.config()

const PORT = process.env.PORT;
app.listen(PORT || 5000, () => {
    console.log('Express server listening on port ' + PORT);
})