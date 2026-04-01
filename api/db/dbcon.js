import dotenv from 'dotenv';
dotenv.config({ quiet: true });
import mongoose from 'mongoose';

const dbUrlConn = process.env.ONLN_DBURL
// const dbUrlConn = process.env.OFFLN_DBURL
const appenv = process.env.APP_ENV || 'quality';
const env = process.env.NODE_ENV || 'dev';

const dbUrl = appenv === 'production'
    ? (env === 'live' ? (console.log('Live (Production Server)'), `${dbUrlConn}ecomplianceprddb?appName=ecomplianceapp`) : (console.log('Dev (Production Server)'), `${dbUrlConn}ecompliancedb?appName=ecomplianceapp`))
    : (env === 'live' ? (console.log('Live (Quality Server)'), `${dbUrlConn}ecomplianceqasdb?appName=ecomplianceapp`) : (console.log('Dev (Quality Server)'), `${dbUrlConn}ecompliancedb?appName=ecomplianceapp`));

const dbnm = appenv === 'production'
    ? (env === 'live' ? (console.log('Live (Production Server)'), 'ecomplianceprddb') : (console.log('Dev (Production Server)'), 'ecompliancedb'))
    : (env === 'live' ? (console.log('Live (Quality Server)'), 'ecomplianceqasdb') : (console.log('Dev (Quality Server)'), 'ecompliancedb'));


mongoose.set('strictQuery', false); // Disable strict query mode

const mongoConn = async () => {
    try {
        await mongoose.connect(dbUrl, {
            dbName: dbnm,
            retryWrites: true,
            w: 'majority',
            ssl: true,
            maxPoolSize: 1, // Keep per-worker connections low
            minPoolSize: 1
        });
        console.log(`Worker ${process.pid}: DB Successfully Connected...`);
    } catch (error) {
        console.error(error);
        throw new Error('Database connection failed');
    }
}

export default mongoConn;