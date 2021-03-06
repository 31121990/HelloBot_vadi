import React, { Component } from 'react';
import { append } from 'ramda';
import ChatHeader from './ChatHeader';
import ChatList from './ChatList';
import ChatInput from './ChatInput';
import { HelloChatCaller } from './../../utils/dataController';
import { SETTINGS } from '../../settings';
import { WIDTH_CHAT_CONTAINER, HEIGHT_CHAT_CONTAINER } from '../../constants';

export default class ChatContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            heightList: 0,
            data: [],
        };

        this.onSendMessage = this.onSendMessage.bind(this);
        this.getMessageFromBot = this.getMessageFromBot.bind(this);
    }

    componentDidMount() {
        this.setState({
            heightList: this.chat.clientHeight - 140, // 140 is the sum of ChatHeader and ChatInput height
        });
    }

    onSendMessage(text) {
        this.setState(
            prevState => ({
                data: append(
                    {
                        text,
                        position: 'right',
                        delay: 0,
                        type: 'text',
                    },
                    prevState.data
                ),
            }),
            () => {
                this.getMessageFromBot(text);
            }
        );
    }

    getMessageFromBot(text) {
        HelloChatCaller.callPromise('POST', '/build/v1/dialog', {
            message: { type: 'text', content: text },
            language: SETTINGS.BOT_LANGUAGE,
            conversation_id: 42,
        }).then(res => {
            const messages = res.data.results.messages;
            for (let message of messages) {
                this.setState(prevState => ({
                    data: append(
                        {
                            text: message.content,
                            position: 'left',
                            delay: Math.floor(Math.random() * 500) + 500, // Add a delay between 500 and 1000ms
                            type: message.type,
                        },
                        prevState.data
                    ),
                }));
            }
        });
    }

    render() {
        const S = {
            container: {
                width: WIDTH_CHAT_CONTAINER,
                height: HEIGHT_CHAT_CONTAINER,
                boxShadow:
                    'rgba(0, 0, 0, 0.19) 0px 10px 30px, rgba(0, 0, 0, 0.23) 0px 6px 10px',
            },
        };
        return (
            <div ref={ref => (this.chat = ref)} style={S.container}>
                <ChatHeader />
                <ChatList
                    data={this.state.data}
                    height={this.state.heightList}
                />
                <ChatInput onSendMessage={this.onSendMessage} />
            </div>
        );
    }
}
