FROM node:22-alpine

WORKDIR /app

# 先複製 package.json
COPY package*.json .

# 安裝依賴 （會被 cache）
RUN npm install

# 複製其他檔案
COPY . .

# 聲明 port
EXPOSE 3000

CMD ["node", "app.js"]
