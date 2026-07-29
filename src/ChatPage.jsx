import { useState, useEffect, useRef } from "react";
import { NavigationBar } from "./ProfilePage";
import { loadUserConversations, loadChatMessages, sendMessage } from "./utils/api-utlis";
import './assets/css/chatPage.css'

const PAGE_SIZE = 20;
const WS_URL = `${import.meta.env.VITE_API_URL.replace(/^http/, 'ws')}/ws/chat/`;

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
    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior:'smooth'});
    }, [messages]);

    if(!conversation){
        return <div id="conversationView"><p className="noConversationSelected">Select a conversation</p></div>;
    }
    return (
        <div id="conversationView">
            <div id="conversationViewHeader">
                <span className="conversationViewName">{conversation.name}</span>
            </div>
            <div id="messagesArea">
                {messages.map((message,index)=>(
                    <ChatMessage key={message.id ?? index}
                                 message={message}
                                 isOwnMessage={String(message.sender_id) === String(currentUserId)}
                    />
                ))}
                <div ref={messagesEndRef}/>
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
    const [pageNumber,setPageNumber] = useState(0);
    const [messagePageNumber,setMessagePageNumber] = useState(1);
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
            const merged = page === 0 ? data.content : [...prev, ...data.content];
            return [...merged].sort((a,b) => new Date(b.last_message) - new Date(a.last_message));
        });
        setCurrentUserId(data.user_id);
        setIsLoadingMore(false);
    };

    useEffect(() => {
        fetchConversations(pageNumber);
    }, []);

    const selectedConversationIdRef = useRef(null);
    useEffect(() => {
        selectedConversationIdRef.current = selectedConversationId;
    }, [selectedConversationId]);

    useEffect(() => {
        const socket = new WebSocket(WS_URL);
        socket.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            if(payload.event !== 'new_message') return;
            if(String(payload.conversation_id) === String(selectedConversationIdRef.current)){
                setMessages(prev => [...prev, payload]);
            }else{
                setConversations(prev => {
                    const updated = prev.map(c =>
                        String(c.id) === String(payload.conversation_id)
                            ? {...c, last_message: payload.timestamp}
                            : c
                    );
                    return [...updated].sort((a,b) => new Date(b.last_message) - new Date(a.last_message));
                });
            }
        };
        return () => {
            socket.close();
        };
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

    const handleSelectConversation = async (id) => {
        setSelectedConversationId(id);
        setMessages([]);
        setMessagePageNumber(1);
        const content = await loadChatMessages(id,1,PAGE_SIZE);
        if(content){
            setMessages(content);
        }
    };

    const handleSend = async () => {
        if(newMessage.trim() === '' || !selectedConversation) return;
        const content = newMessage.trim();
        setNewMessage('');
        await sendMessage(content,selectedConversationId);
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