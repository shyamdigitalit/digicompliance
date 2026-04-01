const dotenv = require("dotenv")
dotenv.config({ quiet: true })

const env = process.env.NODE_ENV || 'dev';
const appenv = process.env.APP_ENV || 'production';

const apiName = {
    quality: process.env.API_NAME_QAS,
    production: process.env.API_NAME_PRD,
}
const portDetails = {
    quality: process.env.PORT_QAS,
    production: process.env.PORT_PRD,
}

module.exports = {
    apps: [
        {
            name: apiName[appenv] || "ecompliance-qas-api",
            script: "index.js",
            env: {
                PORT: portDetails[appenv] || 5037,
                NODE_ENV: env || "dev",
                APP_ENV: appenv || "quality",
            }
        }
    ]
};
