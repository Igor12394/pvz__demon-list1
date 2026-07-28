export const config = {
  api: {
    bodyParser: false, // Отключаем стандартный парсер Vercel для работы с multipart/form-data
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return res.status(500).json({ error: 'Переменные окружения Telegram не найдены в Vercel' });
    }

    // Буферизируем поток тела запроса для надежной передачи файла в Telegram API
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Отправляем сырые данные напрямую в Telegram
    const tgResponse = await fetch(`https://api.telegram.org/bot${token}/sendDocument?chat_id=${chatId}`, {
      method: 'POST',
      headers: {
        'content-type': req.headers['content-type'],
        'content-length': buffer.length.toString(),
      },
      body: buffer,
    });

    const data = await tgResponse.json();

    if (!tgResponse.ok) {
      return res.status(tgResponse.status).json({ error: data.description || 'Ошибка Telegram API' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
