import React, { useRef, useState } from "react";
import ChatBox from "../../components/ChatBox/ChatBox";
import Conversation from "../../components/Coversation/Conversation";
import NavIcons from "../../components/NavIcons/NavIcons";
import "./Chat.css";
import { useEffect } from "react";
import { getAllRoom, createRoom } from "../../api/RoomRequests";
import { getAllUser } from "../../api/UserRequests";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { logout } from "../../actions/AuthActions";
import { Button, Modal, Form, Input, message } from "antd";

const { Search } = Input;

const Chat = () => {
  const socket = useRef();
  const { user } = useSelector((state) => state.authReducer.authData);
  const dispatch = useDispatch();

  const [rooms, setRooms] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [sendMessage, setSendMessage] = useState(null);
  const [receivedMessage, setReceivedMessage] = useState(null);

  const handleLogOut = () => {
    dispatch(logout());
  };

  useEffect(() => {
    const getRooms = async () => {
      try {
        const { data } = await getAllRoom(user._id);
        setRooms(data);
      } catch (error) {
        console.log(error);
      }
    };
    getRooms();
  }, [user._id]);

  // Connect to Socket.io
  useEffect(() => {
    socket.current = io("ws://localhost:8800");
    socket.current.emit("new-user-add", user._id);
    socket.current.on("get-users", (users) => {
      setOnlineUsers(users);
    });
  }, [user]);

  // Send Message to socket server
  useEffect(() => {
    if (sendMessage !== null) {
      socket.current.emit("send-message", sendMessage);
      console.log(sendMessage);
    }
  }, [sendMessage]);

  useEffect(() => {
    if (currentChat) {
      socket.current.emit("join-room", currentChat._id);
    }
  }, [currentChat]);

  // Get the message from socket server
  useEffect(() => {
    socket.current.on("recieve-message", (data) => {
      console.log(data);
      setReceivedMessage(data);
    });
  }, []);

  const checkOnlineStatus = (chat) => {
    const chatMember = chat.members.find((member) => member !== user._id);
    const online = onlineUsers.find((user) => user.userId === chatMember);
    return online ? true : false;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    console.log("Success:", values);
    await createRoom({
      ...values,
      type: "multiple",
      members: [user._id],
    });
    setIsModalOpen(false);
    messageApi.success("Thêm nhóm thành công");
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const onSearch = async (value, _e, info) => {
    try {
      if (typeSearch === "user") {
        const { data } = await getAllUser(value);
        const _data = data.map((item) => ({
          _id: item._id,
          image: item.profilePicture,
          title: item.firstname + " " + item.lastname,
          members: [],
          hasRoom: false,
        }));
        setRooms(_data);
      } else {
        const { data } = await getAllRoom(user._id, value);
        setRooms(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [typeSearch, setTypeSearch] = useState("room");

  const onChangeSearch = async (e) => {
    if (e.target.value === "") {
      try {
        const { data } = await getAllRoom(user._id);
        setRooms(data);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    console.log(currentChat)
  }, [currentChat])

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <NavIcons />
        <div>
          <Button onClick={handleLogOut}>Đăng xuất</Button>
        </div>
      </div>
      <div className="Chat">
        {/* Left Side */}
        <div className="Left-side-chat">
          <div className="Chat-container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 style={{ margin: "0px 0px 0px 0px" }}>Chats</h2>
              {user.isAdmin && (
                <div style={{ cursor: "pointer" }} onClick={showModal}>
                  <span>+ Thêm nhóm mới</span>
                </div>
              )}
            </div>
            <div>
              <div
                style={{ display: "flex", gap: " 10px", marginBottom: "10px" }}
              >
                <Button
                  type={typeSearch !== "user" ? "primary" : "default"}
                  onClick={() => setTypeSearch("room")}
                >
                  Tìm nhóm
                </Button>
                <Button
                  type={typeSearch === "user" ? "primary" : "default"}
                  onClick={() => setTypeSearch("user")}
                >
                  Tìm người dùng
                </Button>
              </div>
              {typeSearch === "user" ? (
                <Search
                  placeholder="Tìm người dùng"
                  onSearch={onSearch}
                  onChange={onChangeSearch}
                />
              ) : (
                <Search
                  placeholder="Tìm nhóm chat"
                  onSearch={onSearch}
                  onChange={onChangeSearch}
                />
              )}
            </div>
            <div className="Chat-list">
              {rooms.map((room, index) => (
                <div onClick={() => setCurrentChat(room)} key={index}>
                  <Conversation
                    data={room}
                    currentUser={user._id}
                    online={checkOnlineStatus(room)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="Right-side-chat">
          <ChatBox
            chat={currentChat}
            currentUser={user._id}
            setSendMessage={setSendMessage}
            receivedMessage={receivedMessage}
          />
        </div>
      </div>

      <Modal
        title="Thêm nhóm mới"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
      >
        <Form name="basic" onFinish={onFinish} onFinishFailed={onFinishFailed}>
          <Form.Item
            label="Tên nhóm"
            name="title"
            rules={[
              {
                required: true,
                message: "Please input your username!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              {
                required: true,
                message: "Please input your description!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Ảnh đại diện nhóm"
            name="image"
            rules={[
              {
                required: true,
                message: "Please input your avatar!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Chat;
