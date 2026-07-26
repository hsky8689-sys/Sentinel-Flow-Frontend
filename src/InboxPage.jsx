import { useState, useEffect } from "react";
import { NavigationBar } from "./ProfilePage";
import { accesInbox,
         acceptFriendRequest,
         deleteFriendRequest,
         acceptProjectJoinRequest,
         declineProjectJoinRequest,
         acceptProjectInvite,
         declineProjectInvite,
         acceptFileAccessRequest,
         declineFileAccessRequest,
         acceptMoveFileAccessRequest,
         declineMoveFileAccessRequest } from "./utils/api-utlis";
import './assets/css/inboxPage.css'

async function acceptRequest(notification){
    const {id,sender_id,receiver_id,request_type} = notification;
    switch(request_type){
        case 'friend':
            return await acceptFriendRequest(id);
        case 'project':
            return await acceptProjectJoinRequest(sender_id,receiver_id);
        case 'project_invite':
            return await acceptProjectInvite(id);
        case 'file_access':
            return await acceptFileAccessRequest(sender_id,receiver_id);
        case 'move_file_access':
            return await acceptMoveFileAccessRequest(sender_id,receiver_id);
        default:
            return false;
    }
}
async function denyRequest(notification){
    const {id,sender_id,receiver_id,request_type} = notification;
    switch(request_type){
        case 'friend':
            return await deleteFriendRequest(id);
        case 'project':
            return await declineProjectJoinRequest(sender_id,receiver_id);
        case 'project_invite':
            return await declineProjectInvite(id);
        case 'file_access':
            return await declineFileAccessRequest(sender_id,receiver_id);
        case 'move_file_access':
            return await declineMoveFileAccessRequest(sender_id,receiver_id);
        default:
            return false;
    }
}

function RequestModal({request,onClose,onAccept,onDeny}){
    if(!request) return null;
    return (
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalBox" onClick={(e)=>e.stopPropagation()}>
                <button className="modalCloseBtn" onClick={onClose}>X</button>
                <p className="modalMessage">{request.target}</p>
                <div className="modalActions">
                    <button className="addBtn" onClick={()=>onAccept(request)}>Accept</button>
                    <button className="denyBtn" onClick={()=>onDeny(request)}>Deny</button>
                </div>
            </div>
        </div>
    );
}
function RequestsTable({requests,setRequests}){
    const [selectedRequest,setSelectedRequest] = useState(null);
    const handleAccept = async (notification) => {
        const response = await acceptRequest(notification);
        if(response){
            setRequests(prev => prev.filter(r => r.id !== notification.id));
            setSelectedRequest(null);
        }
    };
    const handleDeny = async (notification) => {
        const response = await denyRequest(notification);
        if(response){
            setRequests(prev => prev.filter(r => r.id !== notification.id));
            setSelectedRequest(null);
        }
    };
    return (
        <div id="inboxContentArea">
            {requests.map((notification)=>{
                const {id,target} = notification;
                return (
                    <span key={id}
                          className="inboxRequestItem"
                          onClick={()=>setSelectedRequest(notification)}
                    >
                        {target}
                    </span>
                );
            })}
            <RequestModal request={selectedRequest}
                          onClose={()=>setSelectedRequest(null)}
                          onAccept={handleAccept}
                          onDeny={handleDeny}
            />
        </div>
    );
}
function InboxPage(){
    const [requests,setRequests] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const data = await accesInbox();
            setRequests(data?.requests || []);
        };
        fetchData();
    }, []);
    return(
        <div id="inboxMainArea">
            <NavigationBar/>
            <RequestsTable requests={requests} setRequests={setRequests}/>
        </div>
    );
}
export default InboxPage