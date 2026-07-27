import { useState, useEffect } from "react";
import { NavigationBar } from "./ProfilePage";
import { loadUserConversations } from "./utils/api-utlis";
import './assets/css/chatPage.css'

const PAGE_SIZE = 20;

function ConversationHeader({conversation,isActive,onClick}){
    const {name} = conversation;
    return (
        <div className={`conversationHeaderItem${isActive ? ' activeConversation' : ''}`}
             onClick={onClick}
        >
            <span className="conversationHeaderName">{name}</span>
        </div>
    );
}
function ConversationsList({conversations,selectedId,onSelect,onScroll}){
    return (
        <div id="conversationsList" onScroll={onScroll}>
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
                <span className="conversationViewName">{conversation.name}</span>
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
    const [currentUserId,setCurrentUserId] = useState(null);
    const [pageNumber,setPageNumber] = useState(1);
    const [hasMoreConversations,setHasMoreConversations] = useState(true);
    const [isLoadingMore,setIsLoadingMore] = useState(false);

    const fetchConversations = async (page) => {
        if(!hasMoreConversations || isLoadingMore) return;
        setIsLoadingMore(true);
        const data = await loadUserConversations(page,PAGE_SIZE);
        if(!data){
            setIsLoadingMore(false);
            return;
        }
        if(data.content.length === 0){
            setHasMoreConversations(false);
            setIsLoadingMore(false);
            return;
        }
        setConversations(prev => {
            const merged = page === 1 ? data.content : [...prev, ...data.content];
            return [...merged].sort((a,b) => new Date(b.last_message) - new Date(a.last_message));
        });
        setCurrentUserId(data.user_id);
        setIsLoadingMore(false);
    };

    useEffect(() => {
        fetchConversations(1);
    }, []);

    const handleConversationsScroll = (e) => {
        const el = e.target;
        const reachedBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 5;
        if(reachedBottom && hasMoreConversations && !isLoadingMore){
            const nextPage = pageNumber + 1;
            setPageNumber(nextPage);
            fetchConversations(nextPage);
        }
    };

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
                                    onScroll={handleConversationsScroll}
                />
            </div>
        </div>
    );
}
export default ChatPage