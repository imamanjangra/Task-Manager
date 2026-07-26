import 'dotenv/config';

import { app } from "./app.js";
import "./db/index.js";
import { env } from './validators/env.validator.js';

const PORT = env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});