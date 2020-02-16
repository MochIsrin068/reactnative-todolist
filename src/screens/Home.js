import React from 'react'
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, TextInput, AsyncStorage, FlatList, Dimensions } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { Container, Content, CheckBox, Body, Icon, Card, Right } from 'native-base'


const isAndroid = Platform.OS == "android";
const viewPadding = 10;

export default class Home extends React.Component {
    state = {
        toogle: [],
        tasks: [],
        text: ""
    };

    changeTextHandler = text => {
        this.setState({ text: text });
    };

    addTask = () => {
        let notEmpty = this.state.text.trim().length > 0;

        if (notEmpty) {
            this.setState(
                prevState => {
                    let { tasks, text } = prevState;
                    return {
                        tasks: tasks.concat({ key: tasks.length, text: text }),
                        text: ""
                    };
                },
                () => Tasks.save(this.state.tasks)
            );

            this.state.toogle = [...this.state.toogle, false]
            this.setState({
                toogle: this.state.toogle
            })

        } else {
            alert('Text Input Cannot Empty')
        }
    };

    deleteTask = async (i) => {
        try {
            this.setState(
                prevState => {
                    let tasks = prevState.tasks.slice();

                    tasks.splice(i, 1);

                    return { tasks: tasks };
                },
                () => Tasks.save(this.state.tasks)
            );

            this.state.toogle.splice(i, 1)
            this.setState({
                toogle: this.state.toogle
            })

            await AsyncStorage.setItem('CHECKED', JSON.stringify(this.state.toogle))
        } catch (error) {
            console.log('Terjadi Error Disini')
        }

    };


    addCheckedData = async () => {
        try {
            await AsyncStorage.setItem('CHECKED', JSON.stringify(this.state.toogle))
        } catch (error) {
            console.log("Ada Error")
        }
    }

    getItemChecked = async () => {
        try {
            // await AsyncStorage.clear()
            const itemChecked = await AsyncStorage.getItem('CHECKED')
            if (itemChecked !== null) {
                this.setState({
                    toogle: JSON.parse(itemChecked)
                })
            }

            console.log(`item data : ${JSON.parse(itemChecked)}`)

        } catch (error) {
            console.log(error)
        }
    }

    componentDidMount() {
        this.getItemChecked()
        Tasks.all(tasks => this.setState({ tasks: tasks || [] }));
    }



    render() {
        return <Container>
            <StatusBar backgroundColor="#649eff" />
            <View style={styles.header}>
                <Text style={styles.headerText}>TO DO LIST</Text>
                <Text style={styles.headerSubText}>Record what You will do</Text>
                <View style={styles.sizedBox}></View>
            </View>
            <View style={styles.cardTextField}>
                <TextInput
                    style={styles.textInput}
                    onChangeText={this.changeTextHandler}
                    value={this.state.text}
                    placeholder="Add Tasks"
                />
                <TouchableOpacity style={styles.addBtn} onPress={this.addTask}>
                    <Icon name="add" />
                </TouchableOpacity>
            </View>

            <View style={styles.sizedBox}></View>
            <View style={styles.sizedBox}></View>
            <Content>
                <ScrollView>
                    <View style={styles.cardTodo}>

                        <FlatList
                            // style={styles.list}
                            data={this.state.tasks}
                            renderItem={({ item, index }) =>

                                <View style={styles.container}>
                                    <View style={styles.rowContainer}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (this.state.toogle[index]) {
                                                    this.state.toogle[index] = false
                                                    this.setState({
                                                        toogle: this.state.toogle
                                                    })
                                                    this.addCheckedData()
                                                } else {
                                                    this.state.toogle[index] = true
                                                    this.setState({
                                                        toogle: this.state.toogle
                                                    })
                                                    this.addCheckedData()
                                                }

                                            }}
                                        >
                                            <Icon
                                                name={this.state.toogle[index] ? 'checkmark-circle' : 'radio-button-off'}
                                                style={{ paddingLeft: 10, color: '#649eff' }}
                                            />
                                        </TouchableOpacity>

                                        <Text
                                            style={[
                                                styles.text,
                                                {
                                                    opacity: this.state.toogle[index] ? 0.5 : 1.0,
                                                    textDecorationLine: this.state.toogle[index] ? 'line-through' : 'none',
                                                    color: this.state.toogle[index] ? '#90b9ff' : '#649eff'
                                                }
                                            ]}
                                        >
                                            {item.text}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPressOut={() => this.deleteTask(index)}>
                                        <Icon type='FontAwesome5' name='trash-alt' style={{ color: '#ff5050', fontSize: 16,  paddingRight: 10 }} />
                                    </TouchableOpacity>
                                </View>
                            }

                            ListEmptyComponent={
                                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                    <Text>Oops! You don't have any Tasks</Text>
                                </View>
                            }
                        />
                    </View>
                </ScrollView>
            </Content>
        </Container>
    }

}

let Tasks = {
    convertToArrayOfObject(tasks, callback) {
        return callback(
            tasks ? tasks.split("||").map((task, i) => ({ key: i, text: task })) : []
        );
    },
    convertToStringWithSeparators(tasks) {
        return tasks.map(task => task.text).join("||");
    },
    all(callback) {
        return AsyncStorage.getItem("TASKS", (err, tasks) =>
            this.convertToArrayOfObject(tasks, callback)
        );
    },
    save(tasks) {
        AsyncStorage.setItem("TASKS", this.convertToStringWithSeparators(tasks));
    }
};

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
    addBtn: {
        backgroundColor: "#fff",
        width: '13%',
        paddingRight: 10,
        paddingLeft: 10,
        borderRadius: 4,
        elevation: 6,
        paddingVertical: 8,
        alignItems: "center",
        justifyContent: "center"
    },
    textInput: {
        // height: 40,
        paddingRight: 10,
        borderRadius: 4,
        paddingLeft: 10,
        paddingVertical: 8,
        borderColor: "gray",
        backgroundColor: "#fff",
        borderWidth: isAndroid ? 0 : 1,
        elevation: 6,
        width: "85%"
    },
    container: {
        borderBottomColor: '#90b9ff',
        borderBottomWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    text: {
        color: '#4F50DC',
        fontSize: 14,
        marginVertical: 12,
        paddingLeft: 10
    },

    rowContainer: {
        flexDirection: 'row',
        width: width / 2,
        alignItems: 'center'
    },
    cardTodo: {
        paddingHorizontal: 10
    },
    headerSubText: {
        color: "#fff"
    },
    sizedBox: {
        height: 16
    },
    cardTextField: {
        position: "absolute",
        top: 100,
        marginHorizontal: 10,
        left: 0,
        right: 0,
        // elevation: 8,
        // backgroundColor: "#fff",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    headerText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold"
    },
    header: {
        backgroundColor: "#649eff",
        paddingTop: 20,
        padding: 10,
        height: 140,
        alignItems: "center"
    }
})
