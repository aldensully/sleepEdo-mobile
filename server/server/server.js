const express = require('express');
const cors = require('cors');
var useragent = require('express-useragent');
const app = express();

app.use(cors());
app.use(useragent.express());
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({
    extended: true,
    limit: '50mb'
}))

const jwt = require('jsonwebtoken');
const short = require('short-uuid');

const dbCalls = require('./dbCalls');
const dbCreateAccount = dbCalls.createAccount;
const dbSignIn = dbCalls.signIn;
const dbCreateAlarm = dbCalls.createAlarm;
const dbFindMatchingAlarm = dbCalls.findMatchingAlarm;
const dbFindAlarmUsers = dbCalls.findAlarmsUsers;
const dbCheckForFiringAlarm = dbCalls.checkForFiringAlarm;
const dbGetAlarm = dbCalls.getAlarm;
const dbUpdateAlarm = dbCalls.updateAlarm;
const dbAddUserToAlarm = dbCalls.addUserToAlarm;

const Socket = require('./serverSocket');
Socket.connect();

//-----------------------------
const now = new Date();
const start = new Date();
start.setMinutes(now.getMinutes() + 1);
start.setSeconds(0);
start.setMilliseconds(0);
console.log('now: ', now, 'start: ', start);
const diff = start - now;
console.log('diff: ', diff);
setTimeout(serverStartLoop, diff);

function serverStartLoop() {
    console.log('starting server loop, time is: ', new Date());
    findFiringAlarm(); //first time so i dont have to wait a minute to test
    setInterval(findFiringAlarm, 60000) //for testing use 10 seconds, for production use 60
}

async function findFiringAlarm() {
    const firingAlarms = await dbCheckForFiringAlarm(); //returns array 
    if (firingAlarms) {
        firingAlarms.forEach(alarm => {
            Socket.tellClients(alarm);
            if (alarm.userCount == 2) setTimeout(() => judgement(alarm), 10000);  //set 10 second timer
            // else if (alarm.userCount == 1) judgement(alarm); //no need for a countdown theres only one user
        })
    }
    else console.log('No alarm found');

}

async function judgement(alarm) {
    const alarmState = await dbGetAlarm(alarm.alarmId);
    if (alarmState.error) console.log(alarmState.error);
    else {
        const snoozeCount = alarmState.snoozeCount;
        const dismissCount = alarmState.dismissCount;
        const userCount = alarmState.userCount;
        if (userCount == 1) {
            if (snoozeCount == 1) Socket.createAlarmSnooze(alarm);
            else if (dismissCount == 1) Socket.bothDismissed(alarm.roomId);
            else console.log('didnt find any votes');
        }
        if (userCount == 2) {
            if (dismissCount >= 1) {
                Socket.bothDismissed(alarm.roomId);
                //setCountdown for 1 minute to end session
                setTimeout(function () {
                    Socket.sessionOver(alarm);
                }, 60000);
            }
            else Socket.createAlarmSnooze(alarm);
        }
    }
}
//-----------------------------


app.post('/createaccount', async (req, res) => {
    console.log('reached me');
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const auth = await dbCreateAccount(username, password, email);
    //auth is a returned uuid which will be used in the jwt token
    console.log('returned from create account: ', auth);
    if (auth.userId) {
        //create jwt and send back with cookie
        const token = createToken(auth.userId);
        res.send({ userId: auth.userId, token: token });
    }
    else if (auth.error) {
        console.log('auth was retured with an error: ', auth);
        res.send(auth.error);
    }
});

//sign in
app.post('/signin', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const auth = await dbSignIn(username, password);

    if (auth.userId) {
        console.log('got userId from db');
        const token = createToken(auth.userId);
        res.send({ userId: auth.userId, token: token });
    }
    else if (auth.error) {
        res.send(auth);
    }
    else {
        console.log('failed to sign in')
        res.send({ error: '404' });
    }
});


app.post('/createAlarm', async (req, res) => {
    //verify user token first... eventually, not a priority right now
    const alarmTime = req.body.alarmTime;
    const userId = req.body.userId;
    const token = req.body.token;
    //                       //
    //  validate user token  //
    //                       //
    console.log('userid is : ', userId);

    const alarmId = short.generate();
    const roomId = short.generate();

    if (alarmTime && userId) {
        const match = await dbFindMatchingAlarm(alarmTime, userId);  //search for matching alarm, if found add userid to it
        if (match.alarmId) {
            dbAddUserToAlarm(match.alarmId, userId);
            console.log('added user to alarm');
        }

        else if (match == false) {  //match is either false or an error, either way we want to create a new alarm
            console.log('did not find match, creating a unique alarm now');
            const created = await dbCreateAlarm(alarmTime, alarmId, userId, roomId);  //
            if (created == true) {
                const now = new Date();
                now.setHours(now.getHours() - 4);
                const newAlarm = new Date(alarmTime); //alarm object has 'expired' sorta, a new one needs to be created with the same time
                const diff = newAlarm.getTime() - now.getTime();
                console.log('time set: ', newAlarm, 'time now: ', now);
                console.log('alarm will go off in: ', diff);


                res.send('successfully created alarm!');
            }

            else res.send(created); //will be 'false' or error
        }
        else res.send(match)
    }
    else {
        console.log('tried to create alarm but didnt receive any data');
        res.send({ error: 'error' });
    }
})


function createToken(id) {
    return jwt.sign({ id }, 'test secret')
}

app.listen(5000, () => console.log('Server is running on http://localhost:5000'));
