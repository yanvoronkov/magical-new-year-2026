# 🚀 Деплой с прокси поддержкой (2 сервиса)

Упрощенная архитектура: **Frontend** + **Backend API** как отдельные сервисы в EasyPanel.

---

## 📦 Архитектура:

```
┌─────────────────┐      HTTP      ┌──────────────────┐      Proxy      ┌─────────────┐
│   Frontend      │ ──────────────► │   Backend API    │ ──────────────► │  OpenAI API │
│  (Nginx+React)  │                 │  (Node.js+Proxy) │                 │             │
└─────────────────┘                 └──────────────────┘                 └─────────────┘
```

---

## 🔧 Шаг 1: Создайте Backend API сервис

### В EasyPanel:

1. **Create App** → **From GitHub**
2. **Settings:**

   - **Name**: `new-year-api`
   - **Repository**: `https://github.com/yanvoronkov/magical-new-year-2026`
   - **Branch**: `main`
   - **Dockerfile Path**: `./server/Dockerfile`
   - **Context**: `./server`

3. **Environment Variables:**

   ```
   VITE_OPENAI_API_KEY=sk-ваш-ключ
   PROXY_URL=http://MW6iV6zS:iGx17Uee@154.195.163.160:62616
   PORT=3001
   ```

4. **Networking:**

   - **Port**: `3001`
   - **Protocol**: HTTP

5. **Deploy!**

6. **Скопируйте URL** вашего backend (например: `https://new-year-api.yourdomain.com`)

---

## 🎨 Шаг 2: Создайте Frontend сервис

### В EasyPanel:

1. **Create App** → **From GitHub**
2. **Settings:**

   - **Name**: `new-year-frontend`
   - **Repository**: `https://github.com/yanvoronkov/magical-new-year-2026`
   - **Branch**: `main`
   - **Dockerfile Path**: `./Dockerfile`

3. **Build Arguments:**

   ```
   VITE_API_URL=https://new-year-api.yourdomain.com/api
   ```

   👆 **Замените на URL вашего backend из шага 1!**

4. **Networking:**

   - **Port**: `80`
   - **Protocol**: HTTP

5. **Domain:**

   - Привяжите ваш домен

6. **Deploy!**

---

## ✅ Проверка работы:

### Backend API:

```
https://new-year-api.yourdomain.com/health
```

Должно вернуть:

```json
{ "status": "ok", "proxy": true }
```

### Frontend:

```
https://yourdomain.com
```

Откройте консоль (F12), создайте open-карту, должны увидеть:

```
✅ Текст сгенерирован через API
✅ Голос сгенерирован через API
```

---

## 🔍 Troubleshooting:

### Backend не запускается:

- Проверьте `VITE_OPENAI_API_KEY`
- Проверьте `PROXY_URL`
- Посмотрите логи: `View Logs → Application Logs`

### Frontend не подключается к backend:

- Убедитесь что `VITE_API_URL` правильный
- Проверьте что backend доступен
- Проверьте CORS (должен быть включен в backend)

### 401 Error:

- API ключ неправильный или отсутствует

### Proxy не работает:

- Проверьте формат `PROXY_URL`
- Проверьте что прокси доступен

---

## 💡 Локальная разработка:

### Backend:

```bash
cd server
npm install
VITE_OPENAI_API_KEY=sk-key PROXY_URL=http://... node index.js
```

### Frontend:

```bash
npm install
VITE_API_URL=http://localhost:3001/api npm run dev
```

---

**Готово!** 🎉 Теперь OpenAI работает через прокси!
