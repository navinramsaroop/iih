import React from 'react'
import {View, Text, StyleSheet, TouchableOpacity, Linking} from 'react-native'
import {BarChart, Grid, YAxis} from 'react-native-svg-charts'

const data = [1,2,3,4,5,13,2,3,4,5,1,1,2,2,23,1,7]
const contentInset = { top: 20, bottom: 20 }

export default class Bar extends React.Component{
    
    constructor(props){
        super(props)
    }
    render(){
        return (
            <TouchableOpacity>
                <Text> Hello </Text>
            </TouchableOpacity>
        
        )
    }
}
