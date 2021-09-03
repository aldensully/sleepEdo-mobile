import React, { useState } from 'react';
import { TouchableOpacity, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Topbar(props) {

    function storeClick() {
        props.navigation.navigate('Store');
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={storeClick} style={styles.button}>
                <Text style={styles.buttonText}>Store</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        height: 40,
        maxHeight: 60,
        width: '100%',
        backgroundColor: 'skyblue'
    },
    button: {
        width: 80,
        height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E94560',
        borderRadius: 5,
        marginLeft: 30
    },
    buttonText: {
        fontSize: 15,
        color: '#e1e1e1'
    }
})