const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const axios = require('axios')
const openAI_API = axios.create({
    baseURL: process.env.OPEN_AI_URL,
    headers: {'Authorization': `Bearer ${process.env.OPEN_AI_TOKEN}`}
  });

const bot = new TelegramBot(process.env.BOT_TOKEN);

let chatHistory = {};

// Set the bot to use webhooks
bot.setWebHook(`${process.env.WEBHOOK_URL || 'https://37f3-37-19-199-205.ngrok.io'}/${process.env.BOT_TOKEN}`);


const app = express();


app.use(bodyParser.json());

// Define a route for handling incoming webhook requests from the Telegram API
app.post(`/${process.env.BOT_TOKEN}`, async (req, res) => {
    const chatId = req.body.message.chat.id;
    // Get the last 10 messages from history
    let messages = chatHistory.chatId || [];

    if (messages.length > 10) messages.shift();


    // Process the update received from the Telegram API
    const latestMessage = {role: "user", content: req.body.message.text};
    messages.push(latestMessage);
    chatHistory.chatId = messages;

    const response = await openAI_API.post('/chat/completions', {
        model: "gpt-3.5-turbo",
        messages
    });


    bot.sendMessage(chatId, response.data.choices[0].message.content);
    res.sendStatus(200);
  });

// Start the Express server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
