import { env } from './../validators/env.validator.js';
import pdg from "pg"
const {Pool} = pdg;
// import {env} from "../validators/auth.validator.js"

export const pool = new Pool({
    user : env.DB_USER,
    host : env.DB_HOST,
    database : env.DB_NAME,
    password : env.DB_PASSWORD,
    port : env.DB_PORT
})

pool.connect()
    .then(() => {
        console.log("PostgreSQL Connected Successfully");
    })
    .catch((err) => {
        console.log("Database Connection Error:", err.message);
    });

