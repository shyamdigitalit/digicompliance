import Agenda from "agenda";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

let agenda;

const dbUrlConn = String(process.env.ONLN_DBURL)
const appenv = process.env.APP_ENV || 'quality';
const env = process.env.NODE_ENV || 'dev';
const dbUrl = appenv === 'production'
    ? (env === 'live' ? (console.log('Live (Production Server)'), `${dbUrlConn}ecomplianceprddb?appName=ecomplianceapp`) : (console.log('Dev (Production Server)'), `${dbUrlConn}ecompliancedb?appName=ecomplianceapp`))
    : (env === 'live' ? (console.log('Live (Quality Server)'), `${dbUrlConn}ecomplianceqasdb?appName=ecomplianceapp`) : (console.log('Dev (Quality Server)'), `${dbUrlConn}ecompliancedb?appName=ecomplianceapp`));


export const initAgenda = async () => {
    if (agenda) return agenda;

    agenda = new Agenda({
        db: {
            address: dbUrl,
            collection: "agendajobs",
        },
        processEvery: "2 seconds",
    });

    await agenda.start();
    // console.log(agenda);
    agenda.on("ready", () => console.log("Agenda ready"));
    agenda.on("error", err => console.error("Agenda error", err));
    agenda.on("start", job => {
        console.log("✅ Agenda started");
        console.log("JOB STARTED:", job.attrs.name);
    });

    return agenda;
};
