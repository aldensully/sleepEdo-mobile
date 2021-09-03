import React, { useState, useEffect, useContext, useCallback } from 'react';
import { SocketContext } from './socket';
import { TouchableOpacity, StyleSheet, Text, TextInput, View, TouchableOpacityBase } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';


export default function Chatbox(props) {

    const [dismissOpen, setDismissOpen] = useState(false);
    const [dismissCount, setDismissCount] = useState(0);
    const [snoozeCount, setSnoozeCount] = useState(0);
    const [room, setRoom] = useState('');
    const [alarmId, setAlarmId] = useState('');
    const [disconnected, setDisconnected] = useState(false);
    const [modalOpen, setModalOpen] = useState(true);
    const socket = useContext(SocketContext);
    const [text, setText] = useState('');
    const [partner, setPartner] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);

    const getMessage = useCallback((message) => {
        console.log('received message: ', message);

    }, []);

    const triggered = useCallback((room, alarmId) => {
        console.log('joining room: ', room);
        setRoom(room);
        setAlarmId(alarmId);
        setModalOpen(true);
    }, []);

    const resetStuff = useCallback(() => {
        setModalOpen(false);
        setDismissOpen(true);
        setSnoozeCount(0);
        setDismissCount(0);
    }, []);

    const disconnection = useCallback(() => {
        setDisconnected(true);
        setModalOpen(false);
    }, [])


    // function decrement() {
    //     if (timeLeft > 0) setTimeLeft(timeLeft - 1);
    // }
    // setInterval(decrement, 1000);

    useEffect(() => {

        socket.on('get-message', (message) => {
            getMessage(message);
        });
        return () => {
            socket.offAny();
        }
    }, [socket, getMessage])

    function back() {
        props.navigation.navigate("Home");
    }

    function dismiss() {
        setDismissCount(dismissCount + 1);
        socket.emit('send-dismiss', room, alarmId);
        setDismissOpen(false);
    }
    function snooze() {
        setSnoozeCount(snoozeCount + 1);
        socket.emit('send-snooze', room, alarmId);   //tell other user that you hit snooze
        setDismissOpen(false);
    }

    const sendText = useCallback((e) => {
        e.preventDefault();
        socket.emit('send-message', sessionStorage.getItem('username'), text, room);   //when modal is closed this function is called
        addOutTexts(text);
        setText('');

    }, [socket, text]);

    // let dismissButton;
    // if (dismissOpen) {
    //     dismissButton =
    //         <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', position: 'relative', zIndex: 4 }}>
    //             <TouchableOpacity onPress={snooze}>
    //                 <Text>Vote Snooze {`(${snoozeCount}/2)`}</Text>
    //             </TouchableOpacity>
    //             <TouchableOpacity onPress={dismiss}>
    //                 <Text>Dismiss {`(${dismissCount}/2)`}</Text>
    //             </TouchableOpacity>
    //         </View>
    // }

    if (modalOpen) {
        return (
            <View style={styles.container}>
                <View style={styles.topbar}>
                    <TouchableOpacity onPress={back} style={styles.backButton} >
                        <IonIcon color="#e1e1e1" name="arrow-back-sharp" size={25} />
                    </TouchableOpacity>
                    <Text style={styles.topbarText}>Chat - {partner}</Text>
                    <Text style={styles.countdown}>00:{timeLeft}</Text>
                </View>
                <View style={styles.messageContainer}>
                    <View style={styles.messageOut}>
                        <Text style={styles.messageOutText}>hello there this is a message from a friend i hope you have a goood day</Text>
                    </View>
                    <View style={styles.messageOut}>
                        <Text style={styles.messageOutText}>hello there this is a message from a friend i hope you have a goood day</Text>
                    </View>
                    <View style={styles.messageOut}>
                        <Text style={styles.messageOutText}>hello there this is a message from a friend i hope you have a goood day</Text>
                    </View>
                    <View style={styles.messageOut}>
                        <Text style={styles.messageOutText}>hello there this is a message from a friend i hope you have a goood day</Text>
                    </View>
                    <View style={styles.messageOut}>
                        <Text style={styles.messageOutText}>hello there this is a message from a friend i hope you have a goood day</Text>
                    </View>
                    <View style={styles.messageOut}>
                        <Text style={styles.messageOutText}>hello there this is a message from a friend i hope you have a goood day</Text>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity>
                        <IonIcon style={{ marginLeft: 20 }} color="#e1e1e1" name="ios-gift-outline" size={25} />
                    </TouchableOpacity>
                    <TextInput style={styles.textInput} />
                    <TouchableOpacity style={styles.sendButton}>
                        <Text style={styles.sendText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    else return null;
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: '#222'
    },
    topbar: {
        width: '100%',
        height: '10%',
        backgroundColor: 'grey',
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    backButton: {
        marginLeft: 20
    },
    topbarText: {
        marginLeft: 10,
        fontSize: 20
    },
    countdown: {
        marginLeft: 40,
        fontSize: 16
    },
    messageContainer: {
        justifyContent: 'flex-end',
        backgroundColor: '#282c34',
        height: '78%',
        width: '100%',
        overflow: 'scroll',
    },
    messageOut: {
        padding: 10,
        alignSelf: 'flex-end',
        maxWidth: '60%',
        backgroundColor: 'white',
        borderRadius: 15,
        margin: 10
    },
    messageOutText: {
        fontSize: 20,
        alignSelf: 'flex-end'
    },
    messageIn: {
        fontSize: 18,
        padding: 20,
        alignSelf: 'flex-start',
    },
    messageInText: {
        fontSize: 18,
        alignSelf: 'flex-start'
    },
    bottomContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: '12%',
        backgroundColor: 'grey'
    },
    textInput: {
        width: '60%',
        height: '80%',
        maxHeight: '90%',
        backgroundColor: 'grey',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        marginLeft: 20,
        borderColor: '#fff',
        borderWidth: 2,
        margin: 5,
        padding: 10
    },
    sendButton: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'grey',
        width: '20%',
        height: '80%'
    },
    sendText: {
        fontSize: 20
    }
})