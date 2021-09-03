exports.createAlarm = async function createAlarm(alarmTime, userId, token) {
    let res = await axios.post('http://192.168.1.181:5000/createAlarm', {
        alarmTime: alarmTime,
        userId: userId,
        token: token
    })
    console.log('return from createAlarm() in axiosCalls.js, res.data: ', res.data);
    return res.data;
}