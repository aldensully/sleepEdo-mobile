const dbCalls = require('./dbCalls');
const dbGetSnoozeCount = dbCalls.getSnoozeCount;
const dbGetDismissCount = dbCalls.getDismissCount;
const dbSetSnoozeCount = dbCalls.setSnoozeCount;
const dbSetDismissCount = dbCalls.setDismissCount;
const dbCleanup = dbCalls.cleanup;
const dbUpdateAlarm = dbCalls.updateAlarm;

class ServerSocket {
    constructor() {

        this.server = require('http').createServer();
        this.io = require('socket.io')(this.server, {
            cors: {
                origin: "http://localhost:19006",
                methods: ["GET", "POST"],
                allowedHeaders: ["my-custom-header"],
                credentials: true
            }
        });
        this.userTokens = {};  //keep track of current logged in users( should be in database ideally)
        this.server.listen(5001, () => { console.log('socket listening on port 5001') });
    }

    connect() {
        this.io.on('connection', async (socket) => {
            socket.join('test');
            //authenticate user token and socket
            socket.on('auth', (data) => {
                if (data.userId in this.userTokens) {   //user has not changed login sessions, likely just refreshed the page
                    console.log('found user');
                    if (this.userTokens[data.userId].token === data.token) { //token is the client token given after login
                        this.userTokens[data.userId].socketId = socket.id;   //update socket id
                        this.userTokens[data.userId].socket = socket;
                    }
                    else {  //when user logs in again, the token will be different
                        console.log('token has changed');
                        this.userTokens[data.userId].token = data.token;
                        this.userTokens[data.userId].socketId = socket.id;
                        this.userTokens[data.userId].socket = socket;
                    }
                }
                else {   //new user
                    console.log('creating user');
                    this.userTokens[data.userId] = { token: data.token, socketId: socket.id, socket: socket };
                }
            })



            socket.on('send-message', (user, message, room) => {
                if (room !== '') {
                    console.log('message: ', message);
                    socket.to(room).emit('get-message', message);
                }
                else {
                    console.log('room is empty!');
                }
            })
            socket.on('send-snooze', async (room, alarmId) => {
                const snoozeCount = parseInt(await dbGetSnoozeCount(alarmId));
                console.log('snoozeCount: ', snoozeCount + 1);
                socket.to(room).emit('get-snooze', snoozeCount + 1);
                await dbSetSnoozeCount(alarmId, snoozeCount + 1);
                // if (snoozeCount == 0) {
                //     await dbSetSnoozeCount(alarmId, snoozeCount + 1);  //increment by one
                // }
                // else if (snoozeCount == 1) {
                //     this.io.in(room).emit('snooze-begin');
                //     await dbSetSnoozeCount(alarmId, snoozeCount + 1);
                // }
            })
            socket.on('send-dismiss', async (room, alarmId) => {
                const dismissCount = parseInt(await dbGetDismissCount(alarmId));
                console.log('dismissCount: ', dismissCount + 1);
                socket.to(room).emit('get-dismiss', dismissCount + 1);
                await dbSetDismissCount(alarmId, dismissCount + 1);
                // if (dismissCount == 0) {
                //     await dbSetDismissCount(alarmId, dismissCount + 1);
                // }
                // else if (dismissCount == 1) {
                //     await dbSetDismissCount(alarmId, dismissCount + 1);  //also sets dismissState to true

                // }
            })

            //when user changes vote 
            socket.on('dismiss-decrement', async (room, alarmId) => {
                const dismissCount = parseInt(await dbGetDismissCount(alarmId));
                socket.to(room).emit('get-dismiss', dismissCount - 1);
                await dbSetDismissCount(alarmId, dismissCount - 1);
            })
            socket.on('snooze-decrement', async (room, alarmId) => {
                const snoozeCount = parseInt(await dbGetSnoozeCount(alarmId));
                socket.to(room).emit('get-snooze', snoozeCount - 1);
                await dbSetSnoozeCount(alarmId, snoozeCount - 1);
            })
        });
    }

    tellClients(data) {
        console.log('in serverSocket.js, tellclients(), trying to get sockets and emit alarm');
        if (data.userCount == 2) {  //2 users in alarm
            console.log('found 2 users', data.user1, data.user2);
            const sock1 = this.userTokens[data.user1].socket;
            const sock2 = this.userTokens[data.user2].socket;
            sock1.join(data.roomId);
            sock2.join(data.roomId);
            sock1.emit('triggered', data.roomId, data.alarmId);
            sock2.emit('triggered', data.roomId, data.alarmId);
        }
        else if (data.userCount == 1) { //only 1 user
            // console.log('found only one user');
            // const sockSolo = this.userTokens[data.user1].socket;
            // sockSolo.join(data.roomId);
            // sockSolo.emit('triggered', data.roomId, data.alarmId);
            console.log('only 1 user in alarm, we will figure out this logic later');
        }
        else {
            console.log('didnt find any users in alarm: ', data.alarmId);
        }
    }

    async createAlarmSnooze(alarm) {
        this.io.in(alarm.roomId).emit('snooze-begin');
        const time = new Date();
        time.setHours(time.getHours() - 4);
        time.setMinutes(time.getMinutes() + 10);
        time.setSeconds(0);
        time.setMilliseconds(0);
        dbUpdateAlarm({ alarmId: alarm.alarmId, alarmTime: time, snoozeCount: 0, dismissCount: 0 });
    }

    async sessionOver(alarm) {
        this.io.in(alarm.roomId).emit('room-disconnect');
        console.log("disconnected users from room");
    }


    bothDismissed(room) {
        console.log('both users have hit dismiss');
        this.io.in(room).emit('dismiss-begin');  //to both clients
    }
}
const Socket = new ServerSocket();
module.exports = Socket;