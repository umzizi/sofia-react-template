import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import SofiaLogo from "../../components/Icons/SofiaLogo";
import { useHistory } from "react-router-dom";
//import ReactMarkdown from "react-markdown";

const SERVER_URL = "http://192.168.80.2:5000";

const ChatGPT = () => {
  const [messages, setMessages] = useState([]); //로그인 시 기존 대화 불러오기
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [chats, setChats] = useState([]); //대화 목록
  const [currentChat, setCurrentChat] = useState(null); //현재 선택된 대화
  const [showEmail, setShowEmail] = useState(false); //이메일 표시 여부
  const [userEmail, setUserEmail] = useState(""); //이메일 상태
  const messagesEndRef = useRef(null);
  const history = useHistory();

  // 채팅 목록 불러오기 (MySQL 기반)
  const fetchChats = useCallback(async () => {
    if (!userEmail) return;

    try {
      const response = await fetch(
        `${SERVER_URL}/api/chat/sessions/${userEmail}`
      );
      const data = await response.json();

      if (
        !data.success ||
        !data.chatSessions ||
        !Array.isArray(data.chatSessions)
      ) {
        console.warn("채팅 세션 응답 이상:", data);
        setChats([]);
        return;
      }

      const chatList = data.chatSessions.map((chat) => ({
        id: chat.sessionId,
        title: `채팅 ${chat.sessionId}`, // sessionid 채팅방 list chart, 기본 제목 지정
      }));

      setChats(chatList);
      localStorage.setItem("chatList", JSON.stringify(chatList));
    } catch (error) {
      console.error("채팅 세션 불러오기 오류:", error);
      setChats([]);
    }
  }, [userEmail]);

  useEffect(() => {
    const iframe = document.querySelector("iframe");
    if (iframe) {
      iframe.remove(); // 초기 진입 시 iframe 제거
    }
  }, []);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    console.log("로컬스토리지에 저장된 이메일:", email);

    if (email) {
      setUserEmail(email);
      fetchChats(); // 채팅 세션 목록 조회

      // 메시지 조회는 저장된 세션 ID 기준으로 해야 함!
      const savedChat = localStorage.getItem("currentChat");
      if (savedChat) {
        setCurrentChat(savedChat);
        fetchMessages(savedChat); // sessionId 기준 메시지 조회
      }
    }
  }, [fetchChats]); //fetchChats 의존성 배열에 포함

  // 새로고침 후에도 마지막 채팅을 불러오기
  useEffect(() => {
    const savedChat = localStorage.getItem("currentChat"); // localStorage에서 저장된 채팅 세션 ID 가져오기
    if (savedChat) {
      setCurrentChat(savedChat); // 상태 업데이트
      fetchMessages(savedChat); // 해당 세션의 메시지 불러오기
    }
  }, []); // 빈 배열을 넣어서 페이지가 처음 로드될 때 실행되도록 설정

  // App 컴포넌트가 처음 렌더링될 때 새로운 세션 생성
  useEffect(() => {
    if (!currentChat && userEmail) {
      startNewChat();
    }
  }, [currentChat, userEmail]);

  // 특정 세션 메시지 불러오기 (MySQL: GET /api/chat/messages/:sessionId)
  const fetchMessages = async (sessionId) => {
    if (!sessionId) return;

    try {
      const response = await fetch(
        `${SERVER_URL}/api/chat/messages/${sessionId}`
      );
      const data = await response.json();

      if (data.success && data.data && Array.isArray(data.data.messages)) {
        setMessages(data.data.messages);
      } else {
        console.warn("메시지 형식 이상:", data);
        setMessages([]);
      }
    } catch (error) {
      console.error("메시지 불러오기 오류:", error);
      setMessages([]);
    }
  };

  // 새 채팅 생성 (MySQL 세션 생성)
  const startNewChat = async () => {
    if (!userEmail) return;
    const email = localStorage.getItem("userEmail");
    const newSessionId = `${Date.now()}_${email}`;

    try {
      const response = await fetch(`${SERVER_URL}/api/chat/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, sessionId: newSessionId }),
      });

      if (response.ok) {
        setChats((prevChats) => [
          { id: newSessionId, title: `채팅 ${newSessionId}` },
          ...prevChats,
        ]);
        setCurrentChat(newSessionId);
        setMessages([]);
        localStorage.setItem("currentChat", newSessionId);
      }
    } catch (error) {
      console.error("새 채팅 생성 오류:", error);
    }
  };

  //기존 대화 선택 시 메시지 가져오기
  const selectChat = (chat) => {
    setCurrentChat(chat.id); // 세션 id전달
    fetchMessages(chat.id); // 세션 메시지 불러오기기
  };

  // 사용자 입력 값 변경 핸들러
  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  // 메시지 전송 및 저장
  const handleSendMessage = async () => {
    if (userInput.trim() === "" || isBotResponding) return;

    const messageData = {
      sessionId: currentChat,
      userEmail: userEmail,
      sender: "user",
      text: userInput,
    };

    console.log("전송할 메시지:", messageData); //사용자 입력값 로그 확인

    setMessages([...messages, { sender: "user", text: userInput }]);
    setUserInput("");
    setIsBotResponding(true);

    // 현재 대화에도 메시지 추가
    try {
      const response = await fetch(`${SERVER_URL}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`❌ 서버 응답 오류: ${errorData.message}`);
      }

      const result = await response.json();
      console.log("✅ 서버 응답:", result);
    } catch (error) {
      console.error("💥 메시지 전송 실패:", error.message);
    }

    fetchChatResponse();
  };

  // FASTAPI 서버로 일반 응답 데이터를 요청하는 함수
  const fetchChatResponse = async () => {
    try {
      setIsBotResponding(true);

      // "..." 애니메이션 메시지 추가 (단 하나만 유지)
      setMessages((prevMessages) => {
        const hasTypingMessage = prevMessages.some(
          (msg) => msg.id === "typing"
        );
        if (hasTypingMessage) return prevMessages;
        return [...prevMessages, { id: "typing", sender: "bot", text: "." }];
      });

      // "..." 애니메이션 (점 개수 변경)
      let dots = ".";
      const typingInterval = setInterval(() => {
        dots = dots.length < 3 ? dots + "." : ".";
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === "typing" ? { ...msg, text: dots } : msg
          )
        );
      }, 500);

      // 서버 요청 시작
      const response = await fetch("http://192.168.80.101:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInput }),
      });

      clearInterval(typingInterval); // "..." 애니메이션 중지

      const data = await response.json();
      if (!data.message) {
        throw new Error("Invalid response format.");
      }

      let botMessage = ""; // eslint-disable-next-line no-unused-vars
      const fullMessage = data.message; //전체 응답답

      // "..." 애니메이션 제거
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== "typing")
      );

      // 새로운 봇 메시지 추가 (스트리밍 시작)
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "" },
      ]);

      // 스트리밍 방식으로 메시지를 한 글자씩 추가
      for (let i = 0; i < fullMessage.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 30));
        botMessage += fullMessage[i];

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastMessage =
            updatedMessages[updatedMessages.length - 1]?.text || "";
          updatedMessages[updatedMessages.length - 1] = {
            sender: "bot",
            text: lastMessage + fullMessage[i],
          };
          return updatedMessages;
        });
      }

      let references = "";
      // 참고자료 링크 추가
      if (data.path && data.pages) {
        references = data.path
          .map(
            (path, i) =>
              `참고자료 ${i + 1}<br><a href="${path}.pdf#page=${data.pages[i]}" 
              target="_blank" style="color: blue; text-decoration: underline;">
              ${path} (Page ${data.pages[i]})</a><br><br>`
          )
          .join("");

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastIndex = updatedMessages.length - 1;

          if (updatedMessages[lastIndex]?.sender === "bot") {
            updatedMessages[lastIndex] = {
              sender: "bot",
              text: updatedMessages[lastIndex].text + "<br>" + references,
            };
          }

          return [...updatedMessages];
        });
      }

      //참고자료 포함 DB 저장
      const messageToSave =
        fullMessage + (references ? "<br>" + references : "");

      await fetch(`${SERVER_URL}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentChat,
          userEmail,
          sender: "bot",
          text: messageToSave, // 참고자료 포함
        }),
      });

      setIsBotResponding(false);
    } catch (error) {
      console.error("Error fetching chat response:", error);
      setIsBotResponding(false);
    }
  };

  // 전체 페이지 스크롤 제거
  useEffect(() => {
    window.scrollTo(0, 0); //새로고침 시 강제로 최상단 고정
  }, []);

  //채팅방 내부만 스크롤 이동
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100); // 약간의 딜레이 추가
    }
  }, [messages]);

  // Enter 키를 눌렀을 때 메시지를 전송하게 하는 함수
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  //이메일 표시/숨기기 토글
  const toggleEmail = () => {
    setShowEmail((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail"); // 사용자 이메일 정보 삭제
    alert("로그아웃 되었습니다.");
    window.location.href = "/login"; // 로그인 페이지로 이동 (경로는 필요에 따라 변경)
  };

  return (
    <>
      {/* 채팅 메시지 표시 영역 */}
      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.sender}`}
            dangerouslySetInnerHTML={{ __html: msg.text }}
          />
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {/* 입력창 */}
      <div className="input-container">
        <input
          type="text"
          value={userInput}
          onChange={handleUserInput}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
        />
        <button onClick={handleSendMessage} disabled={isBotResponding}>
          전송
        </button>
      </div>
    </>
  );
};

export default ChatGPT;

/*npm start -- --host 0.0.0.0*/
