import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { addMessage, getMessages } from "../../api/MessageRequests";
import { getUser } from "../../api/UserRequests";
import "./ChatBox.css";
import { format } from "timeago.js";
import InputEmoji from "react-input-emoji";
import { useSelector } from "react-redux";
import { Button } from "antd";
import { findRoom, createRoom } from "../../api/RoomRequests";

const ChatBox = ({ chat, currentUser, setSendMessage, receivedMessage }) => {
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const handleChange = (newMessage) => {
    setNewMessage(newMessage);
  };

  const { user } = useSelector((state) => state.authReducer.authData);

  // useEffect(() => {
  //   const userId = chat?.members?.find((id) => id !== currentUser);
  //   const getUserData = async () => {
  //     try {
  //       const { data } = await getUser(userId);
  //       setUserData(data);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   if (chat !== null) getUserData();
  // }, [chat, currentUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await getMessages(chat._id);
        setMessages(data);
      } catch (error) {
        console.log(error);
      }
    };

    if (chat !== null) {
      fetchMessages();
    }
  }, [chat]);

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    let message = {};
    const {
      data: { status },
    } = await findRoom({
      members: [chat._id, user._id],
    });

    if (!status) {
      const { data } = await createRoom({
        ...chat,
        type: "single",
        members: [chat._id, user._id],
      });
      message = {
        senderId: currentUser,
        text: newMessage,
        roomId: data._id,
        sender: {
          profilePicture: user.profilePicture,
          fullname: user.firstname + " " + user.lastname,
        },
      };
    } else {
      message = {
        senderId: currentUser,
        text: newMessage,
        roomId: chat._id,
        sender: {
          profilePicture: user.profilePicture,
          fullname: user.firstname + " " + user.lastname,
        },
      };
    }

    // setSendMessage({ ...message, userId: user._id });
    try {
      const { data } = await addMessage(message);
      setMessages([...messages, data]);
      setNewMessage("");
    } catch {
      console.log("error");
    }
  };

  useEffect(() => {
    if (receivedMessage !== null && receivedMessage.roomId === chat._id) {
      setMessages([...messages, receivedMessage]);
    }
  }, [receivedMessage]);

  const scroll = useRef();
  const imageRef = useRef();

  return (
    <>
      <div className="ChatBox-container">
        {chat ? (
          <>
            <div className="chat-header">
              <div className="follower">
                <div>
                  <img
                    src={chat.image}
                    alt="Profile"
                    className="followerImage"
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div className="name" style={{ fontSize: "0.9rem" }}>
                    <span>{chat.title}</span>
                    <p
                      style={{
                        fontSize: "12px",
                        margin: "5px 0px 0px 0px",
                      }}
                    >
                      {chat.description || "Thành viên"}
                    </p>
                  </div>
                </div>
                {chat.type === "multiple" && (
                  <div>
                    <Button type="primary">Thêm thành viên</Button>
                  </div>
                )}
              </div>
              <hr
                style={{
                  width: "95%",
                  border: "0.1px solid #ececec",
                  marginTop: "20px",
                }}
              />
            </div>
            {/* chat-body */}
            <div className="chat-body">
              {messages.map((message) => (
                <>
                  {message.senderId !== currentUser ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-start",
                          gap: "10px",
                        }}
                      >
                        {message.sender && (
                          <img
                            src={
                              message.sender && message.sender.profilePicture
                                ? message.sender.profilePicture
                                : process.env.REACT_APP_PUBLIC_FOLDER +
                                  "defaultProfile.png"
                            }
                            alt="avatar"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "100%",
                              objectFit: "cover",
                              backgroundColor: "#53c66e",
                            }}
                          />
                        )}
                        <div ref={scroll} className="message">
                          <span>{message.text}</span>{" "}
                          <span>{format(message.createdAt)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={{ display: "flex", justifyContent: "flex-end" }}
                      >
                        <div ref={scroll} className="message own">
                          <span>{message.text}</span>{" "}
                          <span>{format(message.createdAt)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ))}
            </div>
            {/* chat-sender */}
            <div className="chat-sender">
              <div onClick={() => imageRef.current.click()}>+</div>
              <InputEmoji value={newMessage} onChange={handleChange} />
              <div className="send-button button" onClick={handleSend}>
                Send
              </div>
              <input
                type="file"
                name=""
                id=""
                style={{ display: "none" }}
                ref={imageRef}
              />
            </div>{" "}
          </>
        ) : (
          <span className="chatbox-empty-message">
            Tap on a chat to start conversation...
          </span>
        )}
      </div>
    </>
  );
};

export default ChatBox;
