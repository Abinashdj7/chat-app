export const getSenderFull=(loggedUser:any,users:any) => {
    return users[0].id===loggedUser?._id?users[1]:users[0]
}
export const getSender=(loggedUser:any,users:any) => {
    if(Array.isArray(users)){
        //return users[0]?.id===loggedUser?._id?users[1].name:users[0].name
        const otherUser = users.find(user => user.id !== loggedUser?._id);
        return otherUser ? otherUser.name : "Unknown sender";
    }
    else if(!Array.isArray(users) && users){
        return users.name || "Unknown sender"
    }
    else{
        return "Unknown sender"
    }
}
export const isSameSender=(messages:any,m:any,i:any,userId:any) => {
    return(
        i<messages.length-1 &&
        (messages[i+1].sender._id!==m.sender._id ||
            messages[i+1].sender._id===undefined) &&
            messages[i].sender._id!==userId
    )
}
export const isLatestMessage=(messages:any,i:any,userId:any) => {
    return(
        i===messages.length-1 &&
        messages[messages.length-1].sender._id!==userId &&
        messages[messages.length-1].sender._id
    )
}
export const isSameSenderMargin=(messages:any,m:any,i:any,userId:any) => {
    if(i<messages.length-1 && 
        messages[i+1].sender._id===m.sender._id &&
        messages[i].sender._id!==userId){
            return 33;
        }
    else if(
        i<messages.length-1 &&
        messages[i+1].sender._id===m.sender._id &&
        messages[i].sender._id!==userId
    ){
        return 0;
    }
    else{
        return "auton"
    }
}
export const isSameUser=(messages:any,m:any,i:any)  => {
    return(i>0 && messages[i-1].sender._id===m.sender._id)
}   