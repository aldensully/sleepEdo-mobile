const neo4j = require('neo4j-driver');
const driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', '123')
)

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { createChainedFunction } = require('@material-ui/core');


exports.createAccount = async function dbCreateAccount(username, password, email) {
    const session = driver.session();
    //check if username already exists
    const newUser = await session.readTransaction(txc => txc.run(`match (u:user {username:'${username}'}) return u`))
        .then(result => {
            if (result.records.length !== 0) {
                console.log('user with that username already exists');
                return { error: 'user already exists' };
            }
            else {
                return true;
            }

        }).catch((e) => {
            console.log(e);
            console.log('failed to query database for matching user...');
            return { error: '404' };
        });

    session.close();

    if (newUser == true) { //db doesnt contain a user with that username, we will create an account
        const session = driver.session();
        const hashp = await createHashedPassword(password);
        const userId = createId();
        const auth = await session.writeTransaction(txc => txc.run(`create (u:user {username: '${username}',password: '${hashp}',email: '${email}',userId: '${userId}'}) return u.userId`))
            .then(result => {
                console.log(result.records[0]._fields[0]);
                session.close();
                if (result.records[0]._fields[0]) {
                    console.log('successfully created account');
                    return { userId: result.records[0]._fields[0] };  //userId
                }
                else {
                    return { error: 'failed to create user' };
                }
            });
        session.close();
        return auth;
    }
    else {
        return newUser;
    }
}

exports.signIn = async function dbSignIn(username, password) {
    var dbresult;
    const session = driver.session();
    const foundUser = await session.readTransaction(txc => txc.run(`match (u:user {username:'${username}'}) return u`))
        .then(result => {
            if (result.records[0]) {
                dbresult = result.records[0]._fields[0].properties;
                return true;
            }
            else {
                console.log('no user data found');
                return { error: '404' };
            }
        }).catch((e) => {
            console.log(e);
            return { error: 'error' };
        });

    session.close();

    if (foundUser == true) {
        console.log('comparing: ', password, dbresult.password);
        const match = await bcrypt.compare(password, dbresult.password);
        if (match) { //successfully hashed and found matching password
            console.log('successfully signed in');
            const obj = { userId: dbresult.userId };
            return obj;
        }
        else {
            console.log('password incorrect');
            return { error: '401' };
        }
    }
    else {
        return foundUser; //will be an error from the original db query
    }
}

exports.findMatchingAlarm = async function dbFindMatchingAlarm(alarmTime, userId) {
    const session = driver.session();
    const find = await session.readTransaction(txc => txc.run(`MATCH (p:pendingAlarm {alarmTime:'${alarmTime}',user2:''}) RETURN p`)) //is there an alarm with only one user and the same time? if so return the alarmid
    session.close();
    if (find.records[0]) return find.records[0]._fields[0].properties;  //alarm object
    else return false;
    // .then(result => {
    //     if (result.records[0]) {

    //         // const foundAlarmId = result.records[0]._fields[0];
    //         // //add user to this alarm
    //         // session.writeTransaction(txc => txc.run(`MATCH (p:pendingAlarm {alarmId:'${foundAlarmId}'}) SET p.user2 = '${userId}' SET p.userCount = 2 return p`))
    //         //     .then(result => {
    //         //         if (result.records[0]) console.log(`successfully added ${userId} to alarm`);
    //         //     }).catch(e => console.log(e.message));

    //         // return { alarmId: result.records[0]._fields[0] };
    //     }
    //     else return false;
    // }).catch(e => {
    //     return { error: e.message };
    // })
    // session.close();
    // return find;
}

exports.createAlarm = async function dbCreateAlarm(alarmTime, alarmId, userId, roomId) {
    const session = driver.session();
    console.log(`creating alarm for ${userId}`)
    const canContinue = await session.readTransaction(txc => txc.run(`MATCH (p:pendingAlarms {alarmId:'${alarmId}'}) return p`))
        .then(result => {
            if (result.records[0]) return false; //there was a hit from the db with the same alarmId
            else return true;
        }).catch(e => {
            console.log(e.message);
            return { error: e.message };
        })

    session.close();

    if (canContinue == true) {
        const session2 = driver.session();
        console.log('final alarmTime is: ', alarmTime);
        const create = await session2.writeTransaction(txc => txc.run(`CREATE (p:pendingAlarm {alarmTime:'${alarmTime}',alarmId:'${alarmId}',user1:'${userId}',user2:'',userCount:'1',roomId:'${roomId}',snoozeCount:'0',snoozeState:'false',dismissCount:'0',dismissState:'false'}) return p`))
            .then(result => {
                if (result.records[0]) return true;
                else return { error: 'failed to create alarm' };
            }).catch(e => { return { error: e.message } })
        session2.close();
        return create;
    }
    else if (canContinue == false) return { error: 'duplicate alarm' };
    else if (canContinue.error) return canContinue.error;
    //can return either {error:something}, false, or true
}


exports.checkForFiringAlarm = async function dbCheckForFiringAlarm() {
    const session = driver.session();
    const now = new Date();
    //compensate for sever delay
    now.setHours(now.getHours() - 4);
    now.setSeconds(0);
    now.setMilliseconds(0);
    console.log('searching for alarm matching: ', now);
    let alarms = [];
    const res = await session.readTransaction(txc => txc.run(`MATCH (p:pendingAlarm {alarmTime: '${now.toISOString()}'}) return p`)
        .then(result => {
            if (result.records[0]) {
                console.log('found firing alarm!');

                result.records.forEach(record => {
                    alarms.push(record._fields[0].properties);
                })
            }
            else {
                return false;
            }
            return alarms;
        }))
    session.close();
    return res;
}

exports.getAlarm = async function dbGetAlarm(alarmId) {
    const session = driver.session();
    const alarm = await session.readTransaction(txc => txc.run(`Match (p:pendingAlarm {alarmId:'${alarmId}'}) return p`))
        .then(result => {
            return result.records[0]._fields[0].properties;
        })
        .catch(e => {
            return { error: e.message };
        })
    session.close();
    return alarm;
}

exports.findAlarmsUsers = async function dbFindAlarmUsers(alarmId) {
    const session = driver.session();
    //given the alarmId, query the database and return the userIds, userIds can be used to get the actual sockets(being stored in a dictionary rn)
    const userIds = await session.readTransaction(txc => txc.run(`Match (p:pendingAlarm {alarmId:'${alarmId}'}) return p`))
        .then(result => {
            const tempUsers = [];
            if (result.records[0]._fields[0].properties.user1) tempUsers.push(result.records[0]._fields[0].properties.user1);
            if (result.records[0]._fields[0].properties.user2) tempUsers.push(result.records[0]._fields[0].properties.user2);
            return tempUsers;
        }).catch(e => { return { error: e.message } })
    session.close();
    return userIds
}

exports.getSnoozeCount = async function dbGetSnoozeCount(alarmId) {
    const session = driver.session();
    const res = await session.readTransaction(txc => txc.run(`MATCH (p:pendingAlarm {alarmId: '${alarmId}'}) return p.snoozeCount`))
        .then(result => {
            if (result.records[0]) {
                return result.records[0]._fields[0];
            }
            else return { error: 'error in db query' };
        })
        .catch(e => {
            return { error: e.message }
        })
    session.close();
    return res;
}
exports.getDismissCount = async function dbGetDismissCount(alarmId) {
    const session = driver.session();
    const res = await session.readTransaction(txc => txc.run(`MATCH (p:pendingAlarm {alarmId: '${alarmId}'}) return p.dismissCount`))
        .then(result => {
            if (result.records[0]) {
                return result.records[0]._fields[0];
            }
            else return { error: 'error in db query' };
        })
        .catch(e => {
            return { error: e.message }
        })
    session.close();
    return res;
}
exports.setSnoozeCount = async function dbSetSnoozeCount(alarmId, count) {
    const session = driver.session();
    await session.writeTransaction(txc => txc.run(`MATCH (p:pendingAlarm {alarmId:'${alarmId}'}) SET p.snoozeCount = '${count}' RETURN p `))
        .catch(e => {
            console.log(e.message);
        })
    session.close();
}
exports.setDismissCount = async function dbSetDismissCount(alarmId, count) {
    const session = driver.session();
    await session.writeTransaction(txc => txc.run(`MATCH (p:pendingAlarm {alarmId:'${alarmId}'}) SET p.dismissCount = '${count}' RETURN p `))
        .catch(e => {
            console.log(e.message);
        })
    session.close();
}
exports.addUserToAlarm = async function dbAddUserToAlarm(alarmId, userId) {
    const session = driver.session();
    try {
        await session.writeTransaction(txc => txc.run(`MATCH (p:pendingAlarm {alarmId: '${alarmId}'}) SET p.user2 = '${userId}' SET p.userCount = 2 RETURN p`));
    }
    catch (e) {
        console.log('error in addusertoalarm: ', e.message);
    }
    finally {
        session.close();
    }

}
exports.updateAlarm = async function dbUpdateAlarm(alarm) {
    const session = driver.session();
    await session.writeTransaction(txc => txc.run(`MATCH (p:pendingAlarm {alarmId:'${alarm.alarmId}'}) SET p.alarmTime = '${alarm.alarmTime}'
        SET p.dismissCount = '${alarm.dismissCount}' SET p.snoozeCount = '${alarm.snoozeCount}' RETURN p`))
        .then(result => {
            if (result.records[0]) console.log('successfully updated alarm');
            else console.log('did not successfully find/update alarm');
        })
        .catch(e => {
            console.log('error: ', e.message);
        })
    session.close();
}


exports.cleanup = async function dbCleanup(alarmId) {
    console.log('should be cleaning up alarm');
}

function createId() {
    return uuidv4();
}

async function createHashedPassword(password) {
    const salt = await bcrypt.genSalt();
    const newPassword = await bcrypt.hash(password, salt);
    return newPassword;
}