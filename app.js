const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { engine } = require('express-handlebars');
const morgan = require('morgan');
const router = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
// 載入日誌配置
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// 載入環境變數
dotenv.config();

// 解析請求體
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// 靜態文件服務
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// HTTP 請求日誌
app.use(morgan('dev', { stream: logger.stream }));

app.use(router);

// 404 處理
app.use(notFoundHandler);

// 錯誤處理中間件
app.use(errorHandler);

// 啟動服務器
app.listen(PORT, () => {
  logger.info(`服務器運行在 http://localhost:${PORT}`);
});

module.exports = app; 