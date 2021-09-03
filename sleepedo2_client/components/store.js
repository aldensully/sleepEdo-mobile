import React, { useState } from 'react';
import { TouchableOpacity, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Coin from 'react-native-vector-icons/FontAwesome5';
import Navbar from './navbar';

export default function Store(props) {

    function navigate(destination) {
        if (destination != "Store") {
            props.navigation.navigate(destination);
        }
    }
    return (
        <View style={styles.container}>
            <Navbar onChangePage={navigate} />
            <View style={styles.mainPage}>
                <Text>Store screen</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        marginTop: 25
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        height: 40,
        maxHeight: 60,
        width: '100%',
        backgroundColor: '#333456'
    },
    mainPage: {
        backgroundColor: '#333456',
        display: 'flex',
        flex: 1
    },
    button: {
        width: 60,
        height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginLeft: 20,
        color: '#e1e1e1',
    },
    profilebutton: {
        width: 60,
        height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginLeft: 20,
        color: '#e1e1e1'
    },
    buttonText: {
        fontSize: 15,
        color: '#e1e1e1'
    }
})