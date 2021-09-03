import React, { useState, useEffect, useContext, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ChatIcon from 'react-native-vector-icons/Ionicons';
import Coin from 'react-native-vector-icons/FontAwesome5';
import DatePicker from 'react-native-modern-datepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocketContext } from './socket';
import axios from 'axios';
import Chatbox from './chatbox';
import AlarmTriggeredModal from './alarmTriggeredModal';
import Navbar from './navbar';

export default function Home(props) {

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [pickerOpen, setPickerOpen] = useState(false);
    const [active, setActive] = useState(false);
    const [turnOnNotify, setTurnOnNotify] = useState(false);
    const [activeChat, setActiveChat] = useState(false);
    const [partner, setPartner] = useState('Rainbow69');
    const [alarmTriggered, setAlarmTriggered] = useState(false);
    const [room, setRoom] = useState('');
    const [alarmId, setAlarmId] = useState('');

    const socket = useContext(SocketContext);

    useEffect(() => {
        async function em() {
            // const id = await AsyncStorage.getItem("userId");
            // const token = await AsyncStorage.getItem("token");
            const id = sessionStorage.getItem("userId");
            const token = sessionStorage.getItem("token");

            socket.emit('auth', {
                userId: id,
                token: token
            });
        }
        em();

        socket.on('triggered', (room, alarmId) => {
            console.log('triggered!!!');
            setRoom(room);
            setAlarmId(alarmId);
            setAlarmTriggered(true);  //opens up modal for dismiss, snooze,etc
        });

        socket.on('room-disconnect', () => {
            //reset stuff
        })

        socket.on('snooze-begin', () => {
            setAlarmTriggered(false);
        })
        socket.on('dismiss-begin', () => {
            setAlarmTriggered(false);
            props.navigation.navigate("Chat");
        })
        return () => {
            socket.offAny();
        }
    }, [socket])

    //------------------------------------------

    function storeClick() {
        props.navigation.navigate('Store');
    }
    function alarmsClick() {
        alert('already in alarms page');
    }
    function profileClick() {
        alert('clicked on profile');
    }

    function createAlarm() {
        setPickerOpen(false);
        setTurnOnNotify(true);
        console.log()
    }
    function cancelAlarm() {
        setActive(false);
        setPickerOpen(false);
        setTurnOnNotify(false);
    }
    function turnOn() {
        setTurnOnNotify(true);
    }

    async function confirmCreateAlarm() {
        setActive(true);
        setPickerOpen(false);
        setTurnOnNotify(false);

        //testing purposes only ->
        const now = new Date();
        now.setHours(now.getHours() - 4);
        now.setMinutes(now.getMinutes() + 1);
        now.setSeconds(0);
        now.setMilliseconds(0);
        const finalTime = now.toISOString();
        //for actual use with datepicker ->
        // const alarmString = `${date} ${time}:00`;
        // const eventTime = new Date(alarmString);
        // eventTime.setHours(eventTime.getHours() - 4);
        // const finalTime = eventTime.toISOString();

        //-------- For Mobile use ASYNC STORAGE ---------
        // const USERID = await AsyncStorage.getItem("userId");
        // const TOKEN = await AsyncStorage.getItem("token");

        //-------- For web(testing) use SessionStorage ----------
        const USERID = sessionStorage.getItem("userId");
        const TOKEN = sessionStorage.getItem("token");
        const payload = { alarmTime: finalTime, userId: USERID, token: TOKEN }
        await axios.post('http://192.168.1.181:5000/createAlarm', payload);
    }

    function muteAudio() {
        //mute the audio
    }

    //open up the date picker
    let picker;
    if (pickerOpen) picker = Picker()
    else picker = null;
    //confirm with user if they want to activate the alarm
    let activateModal;
    if (turnOnNotify) {
        if (active) activateModal = cancelAlarmModel()
        else activateModal = setAlarmModal()
    }
    else activateModal = null;
    //navigate back to chat if chat still active
    let backToChat;
    if (activeChat) backToChat = backToChatModal()
    //alarm main notification modal
    let alarmTriggeredModal;
    if (alarmTriggered) {
        alarmTriggeredModal = <AlarmTriggeredModal room={room} alarmId={alarmId} onMute={muteAudio} />;
    }
    else alarmTriggeredModal = null;

    function navigate(destination) {
        console.log("trying to go to : ", destination);
        if (destination != "Home") {
            props.navigation.navigate(destination);
        }
    }

    return (
        <View style={styles.container}>
            <Navbar onChangePage={navigate} />
            <View style={styles.mainPage}>
                {backToChat}
                {picker}
                {activateModal}
                {alarmTriggeredModal}
                <TouchableOpacity style={styles.alarmContainer} onPress={() => setPickerOpen(true)}>
                    <View style={styles.rowAlarmContainer}>
                        <Text style={styles.alarmTime}>{time == '' ? "00:00" : time}</Text>
                        <TouchableOpacity style={styles.activateButton} onPress={() => turnOn()}>
                            <Text style={{ fontSize: 20, color: '#222' }}>{active ? "active" : "Turn On"}</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize: 16, marginLeft: 40 }}>{date}</Text>
                </TouchableOpacity>
            </View>
        </View >
    )



    //----------- COMPONENT FUNCTIONS -------------------------------------------------------------

    function backToChatModal() {
        return <TouchableOpacity style={styles.backtochat} onPress={() => props.navigation.navigate("Chat")}>
            <Text style={{ color: '#222', fontSize: 18 }}>{partner}</Text>
            <ChatIcon style={{ fontSize: 30, color: '#222', marginRight: 10, marginLeft: 10 }} color="#e1e1e1" name="arrow-forward-sharp" />
        </TouchableOpacity>;
    }

    function setAlarmModal() {
        return <View style={styles.activateModal}>
            <Text style={{ fontSize: 25 }}>Set alarm for {time} on {date}?</Text>
            <View style={styles.alarmButtonsContainer}>
                <TouchableOpacity onPress={() => confirmCreateAlarm()} style={styles.setAlarmButton}>
                    <Text>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTurnOnNotify(false)} style={styles.setCloseButton}>
                    <Text>Back</Text>
                </TouchableOpacity>
            </View>
        </View>;
    }

    function cancelAlarmModel() {
        return <View style={styles.activateModal}>
            <Text style={{ fontSize: 25 }}>Cancel alarm for {time} on {date}?</Text>
            <View style={styles.alarmButtonsContainer}>
                <TouchableOpacity onPress={() => cancelAlarm()} style={styles.setAlarmButton}>
                    <Text>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTurnOnNotify(false)} style={styles.setCloseButton}>
                    <Text>Back</Text>
                </TouchableOpacity>
            </View>
        </View>;
    }

    function Picker() {
        return <>
            {/* <DatePicker
            minuteInterval={1}
            style={styles.datePicker}
            onTimeChange={(time) => setTime(time)}
            onDateChange={(date) => setDate(date)}
        /> */}
            <View style={styles.alarmButtonsContainer}>
                <TouchableOpacity onPress={() => createAlarm()} style={styles.setAlarmButton}>
                    <Text>Set</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => cancelAlarm()} style={styles.setCloseButton}>
                    <Text>Cancel</Text>
                </TouchableOpacity>
            </View>
        </>;
    }
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        marginTop: 24,
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        height: 40,
        maxHeight: 60,
        width: '100%',
        backgroundColor: '#fafbff',
    },
    mainPage: {
        backgroundColor: '#f3f3f3',
        display: 'flex',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    button: {
        width: 60,
        height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginLeft: 20,
        color: '#222'
    },
    profilebutton: {
        width: 60,
        height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginLeft: 20,
        color: '#222'
    },
    buttonText: {
        fontSize: 15,
        color: '#222'
    },
    datePicker: {
        borderRadius: 10,
        position: 'relative',
        zIndex: 4,
    },
    alarmContainer: {
        display: 'flex',
        flex: 1,
        height: 120,
        maxHeight: 120,
        width: "90%",
        backgroundColor: '#f3f3f3f',
        marginTop: 60,
        borderRadius: 10,
        position: 'absolute',
        zIndex: 1,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#222'
    },
    pickerView: {

        width: '90%',
        height: 100
    },
    setAlarmButton: {
        width: '45%',
        height: 70,
        backgroundColor: '#f3f3f3',
        color: '#222',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    setCloseButton: {
        width: '45%',
        marginLeft: 10,
        height: 70,
        backgroundColor: '#f3f3f3',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    alarmButtonsContainer: {
        marginTop: 5,
        display: 'flex',
        flexDirection: 'row',
        flex: 1
    },
    alarmTime: {
        fontSize: 60,
        alignSelf: 'flex-start',
        marginLeft: 20
    },
    rowAlarmContainer: {
        width: '100%',
        height: 80,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    activateButton: {
        marginLeft: 30,
        width: 100,
        height: 60,
        borderRadius: 10,
        backgroundColor: '#f3f3f3',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#222'
    },
    activateModal: {
        position: 'relative',
        zIndex: 5,
        marginTop: 40,
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        width: '90%',
        height: 160,
        maxHeight: 160,
        backgroundColor: '#f3f3f3',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#222'
    },
    backtochat: {
        backgroundColor: '#f3f3f3',
        width: '100%',
        height: 50,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    }
})