// api/submit.js
export const config = {
  api: {
    bodyParser: false, // Отключаем стандартный парсер, чтобы передать файл "как есть"
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Данные берутся из переменных окружения сервера
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  try {
    // Перенаправляем запрос с файлом напрямую в Telegram
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
      method: 'POST',
      headers: {
        // Передаем заголовки с типом данных (FormData)
        'content-type': req.headers['content-type'],
      },
      body: req, // Передаем входящий поток данных
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}