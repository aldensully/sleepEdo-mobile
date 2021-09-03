import React, { useState, useEffect, useContext, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, Text, TextInput, View } from 'react-native';
import { SocketContext } from './socket';


export default function AlarmTriggeredModal(props) {
    const [snoozeCount, setSnoozeCount] = useState(0);
    const [dismissCount, setDismissCount] = useState(0);
    const [partner, setPartner] = useState('Rainbow69');
    const [timeLeft, setTimeLeft] = useState(10);
    const [myVote, setMyVote] = useState('');

    const socket = useContext(SocketContext);

    const room = props.room;
    const alarmId = props.alarmId;

    useEffect(() => {
        socket.on('get-snooze', (count) => {
            console.log(count);
            setSnoozeCount(count);
        })
        socket.on('get-dismiss', (count) => {
            console.log(count);
            setDismissCount(count);
        })
    }, [socket])

    function snooze() {
        if (myVote == '') {
            socket.emit('send-snooze', room, alarmId);
            setSnoozeCount(snoozeCount + 1);
        }
        else if (myVote == 'dismiss') {
            socket.emit('dismiss-decrement', room, alarmId);
            socket.emit('send-snooze', room, alarmId);
            setDismissCount(dismissCount - 1);
            setSnoozeCount(snoozeCount + 1);
        }
        setMyVote('snooze');
    }
    function dismiss() {
        if (myVote == '') {
            socket.emit('send-dismiss', room, alarmId);
            setDismissCount(dismissCount + 1);
        }
        else if (myVote == 'snooze') {
            socket.emit('snooze-decrement', room, alarmId);
            socket.emit('send-dismiss', room, alarmId);
            setSnoozeCount(snoozeCount - 1);
            setDismissCount(dismissCount + 1);
        }
        setMyVote('dismiss');
    }
    function mute() {
        props.onMute;
    }

    function timesUp() {
        resetStuff();
        props.onSetAlarmTriggered();
    }

    return (
        <View style={styles.container}>
            <View style={styles.topbar}>
                <Text style={{ fontSize: 15 }}>You and {partner}</Text>
                <Text style={{ fontSize: 20, marginLeft: 60 }}>{timeLeft} secs left</Text>
            </View>
            <View style={styles.voteButtonContainer}>
                <TouchableOpacity onPress={snooze} style={styles.snoozeButton}>
                    <Text style={{ fontSize: 25 }}>Vote Snooze</Text>
                    <Text style={{ fontSize: 25 }}>{snoozeCount}/2</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={dismiss} style={styles.dismissButton}>
                    <Text style={{ fontSize: 25 }}>Vote Get Up</Text>
                    <Text style={{ fontSize: 25 }}>{dismissCount}/2</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={mute} style={styles.muteButton}>
                <Text style={{ fontSize: 35 }}>Mute Audio</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        width: '90%',
        height: '50%',
        position: 'relative',
        zIndex: 5,
        borderRadius: 15,
        marginTop: 30,
    },
    topbar: {
        width: '100%',
        height: 40,
        backgroundColor: 'white',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomWidth: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 10
    },
    voteButtonContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '50%',
        backgroundColor: 'white'
    },
    snoozeButton: {
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    dismissButton: {
        width: '50%',
        height: '100%',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1
    },
    muteButton: {
        width: '100%',
        height: '35%',
        backgroundColor: 'white',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopColor: '#222',
        borderTopWidth: 1
    }

})