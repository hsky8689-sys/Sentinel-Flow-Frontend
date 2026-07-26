import { useState } from "react";
import { NavigationBar } from "./ProfilePage";
import './assets/css/chatPage.css'

function ConversationHeader({conversation,isActive,onClick}){
    const {display_name,profile_picture} = conversation;
    return (
        <div className={`conversationHeaderItem${isActive ? ' activeConversation' : ''}`}
             onClick={onClick}
        >
            {profile_picture && (
                <div className="conversationAvatar">
                    <img src={profile_picture} alt={display_name}/>
                </div>
            )}
            <span className="conversationHeaderName">{display_name}</span>
        </div>
    );
}
function ConversationsList({conversations,selectedId,onSelect}){
    return (
        <div id="conversationsList">
            {conversations.map((conversation)=>(
                <ConversationHeader key={conversation.id}
                                     conversation={conversation}
                                     isActive={conversation.id === selectedId}
                                     onClick={()=>onSelect(conversation.id)}
                />
            ))}
        </div>
    );
}
function ChatMessage({message,isOwnMessage}){
    return (
        <span className={`chatMessage ${isOwnMessage ? 'ownMessage' : 'otherMessage'}`}>
            {message.content}
        </span>
    );
}
function ConversationView({conversation,messages,currentUserId,newMessage,setNewMessage,onSend}){
    if(!conversation){
        return <div id="conversationView"><p className="noConversationSelected">Select a conversation</p></div>;
    }
    return (
        <div id="conversationView">
            <div id="conversationViewHeader">
                {conversation.display_name}
            </div>
            <div id="messagesArea">
                {messages.map((message)=>(
                    <ChatMessage key={message.id}
                                 message={message}
                                 isOwnMessage={message.sender_id === currentUserId}
                    />
                ))}
            </div>
            <div id="messageInputRow">
                <textarea id="messageInput"
                          value={newMessage}
                          onChange={(e)=>setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                />
                <button id="sendMessageBtn" onClick={onSend}>Send</button>
            </div>
        </div>
    );
}
function ChatPage(){
    const [conversations,setConversations] = useState([]);
    const [selectedConversationId,setSelectedConversationId] = useState(null);
    const [messages,setMessages] = useState([]);
    const [newMessage,setNewMessage] = useState('');
    const currentUserId = null; // TODO: pull the logged-in user's id from somewhere

    // TODO: fetch the conversations list from the backend on mount and setConversations(...)

    const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;

    const handleSelectConversation = (id) => {
        setSelectedConversationId(id);
        setMessages([]);
        // TODO: fetch the messages for conversation `id` from the backend and setMessages(...)
    };

    const handleSend = () => {
        if(newMessage.trim() === '' || !selectedConversation) return;
        const newMsg = {
            id: Date.now(),
            sender_id: currentUserId,
            content: newMessage.trim()
        };
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        // TODO: send the message to the backend for conversation `selectedConversationId`
    };

    return(
        <div id="chatMainArea">
            <NavigationBar/>
            <div id="chatContainer">
                <ConversationView conversation={selectedConversation}
                                  messages={messages}
                                  currentUserId={currentUserId}
                                  newMessage={newMessage}
                                  setNewMessage={setNewMessage}
                                  onSend={handleSend}
                />
                <ConversationsList conversations={conversations}
                                    selectedId={selectedConversationId}
                                    onSelect={handleSelectConversation}
                />
            </div>
        </div>
    );
}
export default ChatPage