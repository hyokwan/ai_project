// npm install express multer axios cors form-data

const express  = require('express');
const multer   = require('multer');
const axios    = require('axios');
const cors     = require('cors');
const FormData = require('form-data');
const path     = require('path');

const app  = express();
const port = 3000;

// FastAPI 서버 주소
const FASTAPI_URL = 'http://localhost:8000/analyze';

// 업로드된 파일을 메모리에 임시 저장 (디스크 저장 없이 바로 전달)
const storage = multer.memoryStorage();
const upload  = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 최대 10MB
    fileFilter: (req, file, cb) => {
        // 허용 이미지 형식 검사
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.indexOf(file.mimetype) !== -1) {
            cb(null, true);
        } else {
            cb(new Error('지원하지 않는 이미지 형식입니다.'));
        }
    }
});

app.use(cors());
app.use(express.json());

// public 폴더를 정적 파일 서빙 경로로 설정
app.use(express.static(path.join(__dirname, 'public')));

// ──────────────────────────────────────────────────────
// POST /analyze : 브라우저 → Node.js → FastAPI 프록시
// ──────────────────────────────────────────────────────
app.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        // 이미지 파일 존재 여부 확인
        if (!req.file) {
            return res.status(400).json({ success: false, message: '이미지 파일이 없습니다.' });
        }

        const question = req.body.question || '이 이미지에서 텍스트를 추출하고 내용을 설명해줘.';

        // FastAPI로 전달할 multipart/form-data 구성
        const formData = new FormData();
        formData.append('image', req.file.buffer, {
            filename:    req.file.originalname,
            contentType: req.file.mimetype
        });
        formData.append('question', question);

        // FastAPI 서버로 요청 전달
        const response = await axios.post(FASTAPI_URL, formData, {
            headers: formData.getHeaders(),
            timeout: 120000 // 2분 타임아웃 (AI 처리 시간 고려)
        });

        // FastAPI 응답을 그대로 브라우저에 전달
        res.json(response.data);

    } catch (err) {
        // FastAPI 서버 에러 응답 처리
        if (err.response) {
            res.status(err.response.status).json({
                success: false,
                message: err.response.data.detail || 'FastAPI 서버 오류'
            });
        } else {
            res.status(500).json({
                success: false,
                message: err.message || '서버 내부 오류'
            });
        }
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`웹 서버 실행 중: http://localhost:${port}`);
    console.log(`FastAPI 연결 대상: ${FASTAPI_URL}`);
});
