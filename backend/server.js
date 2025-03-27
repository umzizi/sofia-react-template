const dotenv = require("dotenv");
require("dotenv").config();
dotenv.config();

console.log("환경변수 로드 완료");

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*", // 모든 대역 허용
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// MySQL 연결
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
module.exports = db;

db.connect((err) => {
  if (err) {
    console.error("MySQL 연결 실패:", err);
    process.exit(1);
  }
  console.log("MySQL 연결 성공!");
});

// 이메일 형식 검증 함수
const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

//비밀번호 검사 함수 (최소 8자, 영문 + 숫자 포함)
const validatePassword = (password) => {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
    password
  );
};

// 새로운 채팅 세션 생성 API
app.post("/api/chat/session", (req, res) => {
  const { userEmail, sessionId } = req.body;

  if (!userEmail || !sessionId) {
    return res.status(400).json({ message: "이메일과 세션 ID가 필요합니다." });
  }

  const timestamp = new Date();

  const query = `
    INSERT INTO conversations (user_email, session_id, user_message, bot_message, timestamp)
    VALUES (?, ?, '', '', ?)
  `;

  db.query(query, [userEmail, sessionId, timestamp], (err, result) => {
    if (err) {
      console.error("채팅 세션 생성 오류:", err);
      return res.status(500).json({ message: "서버 오류 발생" });
    }

    return res.status(201).json({
      success: true,
      message: "새로운 채팅 세션이 생성되었습니다.",
      data: {
        userEmail,
        sessionId,
        createdAt: timestamp,
        messages: [],
      },
    });
  });
});

// 사용자의 모든 채팅방 목록 조회 API (세션 ID만 반환)
app.get("/api/chat/sessions/:userEmail", (req, res) => {
  const { userEmail } = req.params;

  const query = `
    SELECT session_id
    FROM (
      SELECT session_id, MAX(timestamp) as latest
      FROM conversations
      WHERE user_email = ?
      GROUP BY session_id
    ) AS sessions
    ORDER BY latest DESC
  `;

  db.query(query, [userEmail], (err, results) => {
    if (err) {
      console.error("채팅 세션 목록 조회 오류:", err);
      return res
        .status(500)
        .json({ success: false, message: "서버 오류 발생" });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "채팅 세션이 없습니다.",
      });
    }

    res.status(200).json({
      success: true,
      userEmail: userEmail,
      chatSessions: results.map((row) => ({
        sessionId: row.session_id,
      })),
    });
  });
});

// mysql 특정 세션의 대화 가져오기 API
app.get("/api/chat/messages/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ message: "sessionId가 필요합니다." });
  }

  const query = `
    SELECT user_email, user_message, bot_message, timestamp
    FROM conversations
    WHERE session_id = ?
    ORDER BY timestamp ASC
  `;

  db.query(query, [sessionId], (err, results) => {
    if (err) {
      console.error("채팅 메시지 조회 오류:", err);
      return res.status(500).json({ message: "서버 오류 발생" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "채팅 기록이 없습니다." });
    }

    const userEmail = results[0].user_email;

    // 메시지들을 하나의 배열로 정리
    const messages = [];
    results.forEach((row) => {
      if (row.user_message) {
        messages.push({
          sender: "user",
          text: row.user_message,
          timestamp: row.timestamp,
        });
      }
      if (row.bot_message) {
        messages.push({
          sender: "bot",
          text: row.bot_message,
          timestamp: row.timestamp,
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "세션 메시지 조회 성공",
      sessionId: sessionId,
      data: {
        userEmail,
        messages,
      },
    });
  });
});

// Mysql 메시지 저장 API
app.post("/api/chat/message", (req, res) => {
  const { sessionId, userEmail, sender, text } = req.body;

  if (!sessionId || !userEmail || !sender || !text) {
    return res.status(400).json({
      success: false,
      message: "sessionId, userEmail, sender, text는 필수입니다.",
    });
  }

  const timestamp = new Date();

  if (sender === "user") {
    // 사용자 메시지 저장 (INSERT)
    const insertQuery = `
      INSERT INTO conversations (user_email, user_message, bot_message, timestamp, session_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [userEmail, text, "", timestamp, sessionId];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error("MySQL 사용자 메시지 저장 오류:", err);
        return res
          .status(500)
          .json({ success: false, message: "서버 오류 발생" });
      }

      res.status(201).json({
        success: true,
        message: "사용자 메시지 저장 완료!",
        data: { sessionId, userEmail, sender, text, timestamp },
      });
    });
  } else if (sender === "bot") {
    // 가장 최근 user_message에 대해 봇 응답 업데이트 (UPDATE)
    const updateQuery = `
      UPDATE conversations
      SET bot_message = ?, timestamp = ?
      WHERE session_id = ? AND user_email = ?
      ORDER BY unique_id DESC
      LIMIT 1
    `;
    const values = [text, timestamp, sessionId, userEmail];

    db.query(updateQuery, values, (err, result) => {
      if (err) {
        console.error("MySQL 봇 응답 저장 오류:", err);
        return res
          .status(500)
          .json({ success: false, message: "서버 오류 발생" });
      }

      res.status(200).json({
        success: true,
        message: "봇 응답 저장 완료!",
        data: { sessionId, userEmail, sender, text, timestamp },
      });
    });
  } else {
    return res
      .status(400)
      .json({ success: false, message: "sender 값이 잘못되었습니다." });
  }
});

// 사용자의 모든 채팅이 비었을 경우 DB에서 삭제
app.delete("/api/chat/cleanup/:userEmail", async (req, res) => {
  const { userEmail } = req.params;

  try {
    const userChats = await ChatMessage.find({ userEmail });

    if (userChats.length === 0) {
      await ChatMessage.deleteMany({ userEmail }); // 모든 채팅 데이터 삭제
      return res.status(200).json({
        success: true,
        message: "사용자의 모든 채팅이 삭제되었습니다.",
        userEmail: userEmail,
        deleted: true,
      });
    }

    res.status(200).json({ message: "채팅이 남아있어 삭제하지 않습니다." });
  } catch (error) {
    console.error("채팅 정리 오류:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

// 회원가입 API
app.post("/api/signup", async (req, res) => {
  const { email, password, name, position, department, team, part } = req.body;

  if (!email || !password || !name || !position || !department) {
    return res.status(400).json({ message: "모든 필드를 입력하세요." });
  }
  if (!validateEmail(email)) {
    return res
      .status(400)
      .json({ message: "유효한 이메일 형식을 입력하세요." });
  }

  if (!validatePassword(password)) {
    return res
      .status(400)
      .json({ message: "비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다." });
  }

  try {
    // 이메일 중복 검사
    db.query(
      "SELECT email FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ message: "데이터베이스 오류" });

        if (results.length > 0) {
          return res
            .status(409)
            .json({ message: "이미 사용 중인 이메일입니다." });
        }

        // 비밀번호 해싱 후 저장
        const hashedPassword = await bcrypt.hash(password, 10);
        const query =
          "INSERT INTO users (email, password_hash, name, position, department, team, part, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";

        db.query(
          query,
          [
            email,
            hashedPassword,
            name,
            position,
            department,
            team || null,
            part || null,
          ],
          (err, result) => {
            if (err) {
              console.error("❗ MySQL 쿼리 에러:", err);
              return res.status(500).json({ message: "데이터베이스 오류" });
            }
            res.status(201).json({ message: "회원가입 성공!" });
          }
        );
      }
    );
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 로그인 API
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("받은 email:", email);

  if (!email || !password) {
    return res.status(400).json({ message: "이메일과 비밀번호를 입력하세요." });
  }

  try {
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
      console.log("db쿼리 실행됨");
      if (err) {
        console.error("MYSQL 쿼리 에러:", err);
        return res.status(500).json({ message: "데이터베이스 오류" });
      }
      console.log("🔍 쿼리 결과:", results);
      if (results.length === 0) {
        console.warn("⚠️ 이메일 없음");
        return res.status(404).json({ message: "가입되지 않은 이메일입니다." });
      }

      const user = results[0];
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "비밀번호가 일치하지 않습니다." });
      }
      res.status(200).json({
        message: "로그인 성공!",
        user: {
          email: user.email,
          name: user.name,
          position: user.position,
          department: user.department,
          team: user.team,
          part: user.part,
        },
      });
    });
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});
// 기본 경로 처리 (서버 상태 확인)
app.get("/", (req, res) => {
  res.send("🚀 서버가 정상적으로 작동 중입니다!");
});
// 서버 실행
app.listen(PORT, "0.0.0.0", () => {
  console.log(`서버가 http://192.168.80.2:${PORT} 에서 실행 중입니다.`);
});

//27017 방화벽 허용: netsh advfirewall firewall add rule name="MongoDB" dir=in action=allow protocol=TCP localport=27017

//CMD
//mongosh "mongodb://admin:strongPassword123@localhost:27017/admin"
//사용자 확인
//db.runCommand({ connectionStatus: 1 }).authInfo
//chatDB 사용자 로그인
//use chatDB
//db.auth("smec", "smec4800")

//mongodb 관리자 계정으로 접속
//mongosh -u admin -p strongPassword123 --authenticationDatabase admin

//chatDB 애플리케이션 계정으로 접속
//mongosh -u smec -p smec4800 --authenticationDatabase chatDB

//DB 저장 확인
//db.chatmessages.find().pretty()

//대쉬보드 선택 안되는 문제 :: 개발자 도구 콘솔
//document.querySelector("iframe").remove();
