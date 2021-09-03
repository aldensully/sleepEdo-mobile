import React, { useState } from 'react';
import { TouchableOpacity, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    async function createAccount() {
        console.log('trying to create account');
        if (password.length >= 5) {
            // let res = await axios.post('http://localhost:5000/createaccount', {
            let res = await axios.post('http://192.168.1.181:5000/createaccount', {   //using actual ip address for mobile testing
                username: username,
                password: password,
                email: email
            })
            console.log('response from server: ', res.data);

            if (res.data.error) {
                alert(res.data.error);
            }
            else {
                alert('successfully created account');
                await storeData({ username: username, userId: res.data.userId, token: res.data.token });
            }
        }
        else {
            alert('password must be longer than 5 characters');
        }
    }

    async function signIn() {
        if (password.length >= 5) {
            let res = await axios.post('http://192.168.1.181:5000/signin', {
                username: username,
                password: password,
            })
            if (res.data.error) {
                alert('error: ', res.data.error);
            }
            else if (res.data.token) {
                await storeData({ username: username, userId: res.data.userId, token: res.data.token });
            }
        }
        else {
            alert('password needs to be longer than 5 characters');
        }
    }

    async function storeData(value) {
        try {
            if (value.token) {

                // await AsyncStorage.setItem('username', value.username);
                // await AsyncStorage.setItem('userId', value.userId);
                // await AsyncStorage.setItem('token', value.token);
                sessionStorage.setItem('username', value.username);
                sessionStorage.setItem('userId', value.userId);
                sessionStorage.setItem('token', value.token);
                props.navigation.navigate('Home');
            }
            else {
                alert('could not get token from server');
            }

        } catch (e) {
            console.log(e.message);
        }
    }




    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>SleepEdo</Text>
            <TextInput
                style={styles.input}
                onChangeText={setUsername}
                placeholder="username"
                value={username}
                placeholderTextColor="grey"

            />
            <TextInput
                style={styles.input}
                onChangeText={setPassword}
                value={password}
                placeholder="password"
                placeholderTextColor="grey"
            />
            <TextInput
                style={styles.input}
                onChangeText={setEmail}
                value={email}
                placeholder="email"
                placeholderTextColor="grey"
            />
            <TouchableOpacity onPress={createAccount} style={styles.button}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={signIn} style={styles.button}>
                <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        width: 270,
        height: 60,
        margin: 12,
        borderWidth: 1,
        padding: 6,
        paddingLeft: 10,
        fontSize: 20,
        borderColor: '#e1e1e1',
        color: '#e1e1e1',
    },
    title: {
        fontSize: 50,
        color: '#e1e1e1',
        marginBottom: 60,
    },
    button: {
        width: 180,
        height: 60,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E94560',
        marginTop: 50,
        borderRadius: 50,
    },
    buttonText: {
        fontSize: 20,
        color: '#e1e1e1'
    }
});