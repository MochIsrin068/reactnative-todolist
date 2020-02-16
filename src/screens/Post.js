import React from 'react'
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, TextInput, ActivityIndicator, AsyncStorage } from 'react-native'
import { ScrollView, FlatList } from 'react-native-gesture-handler'
import { Container, Content } from 'native-base'

export default class Post extends React.Component {
    constructor() {
        super()

        this.state = {
            postData: [],
            isLoading: true,
            title: '',
            body: '',
            newPost: []
        }
    }

    async componentDidMount() {
        try {
            const getNewPost = await AsyncStorage.getItem('NEWPOST')
            fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
                .then(res => res.json())
                .then(jsonData => this.setState({
                    postData: getNewPost == null ? jsonData : [...JSON.parse(getNewPost), ...jsonData],
                    isLoading: false,
                    newPost: getNewPost == null ? [] : [...JSON.parse(getNewPost)]
                }))
        } catch (error) {
            console.log(error)
        }
    }

    postData = async () => {
        try {
            fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                body: JSON.stringify(
                    {
                        title: this.state.title,
                        body: this.state.body,
                        userId: 1
                    }
                ),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            })
                .then(response => response.json())
                .then(json => {
                    console.log(json)
                    this.state.newPost = [json, ...this.state.newPost]
                    this.setState({
                        postData: [...this.state.newPost, ...this.state.postData]
                    })
                    AsyncStorage.setItem('NEWPOST', JSON.stringify(this.state.newPost))
                })
        } catch (error) {
            console.log("Terjadi Error")
        }
    }

    header = () => (
        <View style={styles.header}>
            <Text style={styles.headerText}>NEWS POST</Text>
            <Text style={styles.headerSubText}>Read all Your favorite articles and You can also add Your article</Text>
            <View style={styles.sizedBox}></View>
            <View style={styles.sizedBox}></View>
            <View style={styles.cardTextField}>
                <TextInput
                    onChangeText={val => this.setState({ title: val })}
                    placeholder="Type Title Here"
                />
            </View>
            <View style={styles.sizedBox}></View>
            <View style={styles.cardTextField}>
                <TextInput
                    onChangeText={val => this.setState({ body: val })}
                    placeholder="Type Body Here"
                />
            </View>
            <View style={styles.sizedBox}></View>
            <TouchableOpacity style={styles.btnAdd} onPress={() => this.postData()}>
                <Text>POST</Text>
            </TouchableOpacity>
        </View>
    )


    renderItem = (data) => <View style={styles.itemPost}>
        <Text style={styles.titlePost}>{data.item.title}</Text>
        <View style={styles.sizedBox} />
        <Text numberOfLines={2} ellipsizeMode='tail' style={styles.bodyPost}>{data.item.body}</Text>
    </View>

    render() {
        if (this.state.isLoading) {
            return (<Container>
                <StatusBar backgroundColor="#649eff" />
                {this.header()}
                <View style={styles.loadingIndicator}><ActivityIndicator size="large" /></View>
            </Container>
            )
        } else {
            return (<Container>
                <StatusBar backgroundColor="#649eff" />
                {this.header()}
                <Content style={styles.content}>
                    <ScrollView>
                        <FlatList
                            data={this.state.postData}
                            renderItem={item => this.renderItem(item)}
                        />
                    </ScrollView>
                </Content>
            </Container>
            )
        }
    }
}

const styles = StyleSheet.create({
    loadingIndicator: {
        justifyContent: "center",
        alignItems: "center"
    },
    bodyPost: {

    },
    titlePost: {
        fontWeight: "bold"
    },
    itemPost: {
        backgroundColor: "#f1f1f1",
        marginBottom: 10,
        padding: 10,
        borderRadius: 4
    },
    btnAdd: {
        backgroundColor: "#ddd",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        padding: 10,
        elevation: 10
    },
    content: {
        padding: 10
    },
    headerSubText: {
        color: "#fff",
        textAlign: "center"
    },
    sizedBox: {
        height: 8
    },
    cardTextField: {
        // elevation: 8,
        backgroundColor: "#fff",
        paddingHorizontal: 10,
        borderRadius: 4,
    },
    headerText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center"
    },
    header: {
        backgroundColor: "#649eff",
        paddingTop: 20,
        padding: 10,
    }
})