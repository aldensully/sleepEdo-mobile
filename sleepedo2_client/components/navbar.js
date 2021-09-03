import { TouchableOpacity, StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Coin from 'react-native-vector-icons/FontAwesome5';
import React from 'react';

export default function Navbar(props) {

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => props.onChangePage("Store")} style={styles.button}>
        <Icon color="#e1e1e1" name="shopping-outline" size={25} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => props.onChangePage("Home")} style={styles.button} >
        <Icon color="#e1e1e1" name="clock-outline" size={25} />
      </TouchableOpacity>
      <Coin color="#C7F0DB" name="coins" style={{ marginLeft: 60 }} size={15} />
      <Text style={{ color: '#C7F0DB', marginLeft: 6 }}>+150</Text>
      <TouchableOpacity onPress={() => props.onChangePage("Profile")} style={styles.profilebutton}>
        <Icon color="#e1e1e1" name="account-circle-outline" size={25} />
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
    backgroundColor: 'grey',
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
})