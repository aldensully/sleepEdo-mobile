import React, { useState, useCallback, useEffect, useContext } from 'react'
import { GiftedChat } from 'react-native-gifted-chat';
import { TouchableOpacity, StyleSheet, Text, TextInput, View, } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { SocketContext } from './socket';

export default function PreBuiltChat(props) {
    const [messages, setMessages] = useState([]);
    const [partner, setPartner] = useState('Rainbow69');
    const [timeLeft, setTimeLeft] = useState(59);
    const socket = useContext(SocketContext);

    const getMessage = useCallback((message) => {
        console.log('received message: ', message);
        const messageObj = {
            _id: Math.floor(Math.random() * 10000),
            createdAt: new Date(),
            text: message,
            user: {
                _id: 2,
                name: 'other user'
            }
        }
        setMessages(previousMessages => GiftedChat.append(previousMessages, messageObj));

        console.log('all messages: ', messages);
    }, []);

    useEffect(() => {
        socket.on('get-message', (message) => {
            getMessage(message);
        });
        socket.on('room-disconnect', () => {
            props.navigation.navigate("Home");
        })
        return () => {
            socket.offAny();
        }
    }, [socket, getMessage]);

    // function timerEnd() {
    //     alert('time is up');
    // }
    // function decrement() {
    //     if (timeLeft > 0) setTimeLeft(timeLeft - 1);
    //     else timerEnd();
    // }
    // setInterval(decrement, 1000);


    const onSend = useCallback((messages = []) => {
        console.log('sending: ', messages[0].text);
        socket.emit('send-message', sessionStorage.getItem('username'), messages[0].text, 'test');
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        console.log('messages: ', messages);
    }, [])

    return (
        <>
            <View style={styles.topbar}>
                <TouchableOpacity onPress={() => props.navigation.navigate("Home")}>
                    <IonIcon style={styles.backIcon} color="#e1e1e1" name="arrow-back-sharp" size={25} />
                </TouchableOpacity>
                <Text style={styles.topbartext}>Chat - {partner}</Text>
                <Text style={{ marginLeft: 60, fontSize: 15 }}>00:{timeLeft}</Text>
            </View>
            <GiftedChat
                messages={messages}
                onSend={message => onSend(message)}
                user={{
                    _id: 1
                }}
            />
        </>
    )
}
const styles = StyleSheet.create({
    topbar: {
        width: '100%',
        height: 60,
        marginTop: 24,
        backgroundColor: '#e1e1e1',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    backIcon: {
        marginLeft: 15,
        color: '#222'
    },
    topbartext: {
        fontSize: 20,
        marginLeft: 15,
        maxWidth: '50%',
    }
})