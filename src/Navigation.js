import React from 'react'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { Icon } from 'native-base'
import Home from './screens/Home'
import Location from './screens/Location'
import Post from './screens/Post'

const colors = {
    white: '#f3f5f7',
    black: '#1f1f1f',
    grey: '#c5c5c5',
}


const NavigationApp = createBottomTabNavigator(
    {
        Home: {
            screen: Home,
            navigationOptions: {
                tabBarLabel: "Home",
                tabBarIcon: ({ tintColor }) => (
                    <Icon
                        type='FontAwesome5'
                        name='home'
                        style={{ color: tintColor, fontSize: 23 }}
                    />
                ),
            }
        },

        Post: {
            screen: Post,
            navigationOptions: {
                tabBarLabel: "Post",
                tabBarIcon: ({ tintColor }) => (
                    <Icon
                        type='FontAwesome5'
                        name='newspaper'
                        style={{ color: tintColor, fontSize: 23 }}
                    />
                )
            }
        },

        Location: {
            screen: Location,
            navigationOptions: {
                tabBarLabel: "Location",
                tabBarIcon: ({ tintColor }) => (
                    <Icon
                        type='FontAwesome5'
                        name='map-marker-alt'
                        style={{ color: tintColor, fontSize: 23 }}
                    />
                ),
            }
        }
    },

    {
        tabBarOptions: {
            activeTintColor: '#649eff',
            inactiveTintColor: colors.grey,
            style: {
                backgroundColor: 'white',
                borderTopWidth: 0,
                shadowOffset: { width: 5, height: 3 },
                shadowColor: 'black',
                shadowOpacity: 0.5,
                elevation: 5,
            },
        }
    }
)


const Navigation = createAppContainer(
    createSwitchNavigator(
        {
            NavigationApp
        },

        {
            headerMode: 'none'
        }
    )
)


export default Navigation