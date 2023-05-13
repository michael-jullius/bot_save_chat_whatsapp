const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const google = require('google-it');
const { createAudioFile } = require('simple-tts-mp3');

const client = new Client({
    puppeteer: { headless: true, args: ['--no-sandbox'] },
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('message', async message => {
    const data = fs.readFileSync('./data.json');
    const jsonData = JSON.parse(data);
    if (message.body.split(',')[0] === '/get_message') {
        const chat = jsonData.filter((data) => data.date === message.body.split(',')[1]);
        const chatMessages = chat.map((data) => `${data.date} - ${data.from}: ${data.body}`).join('\n');
        message.reply(chatMessages);
    } else if (message.body.split(',')[0] === '/search') {
        google({ query: `${message.body.split(',')[1]}` })
            .then((results) => {
                let chatMessages = '';
                results.forEach((result) => {
                    chatMessages += `Title: ${result.title}\n`;
                    chatMessages += `Link: ${result.link}\n\n`;
                });
                message.reply(chatMessages);
            })
            .catch((err) => {
                message.reply('gagal searching');
            });
    } else if (message.body.split('|')[0] === '/create_audio') {
        await createAudioFile(`${message.body.split('|')[1]}`, 'output', 'id');
        message.reply('waiting create audio....');
        setTimeout(() => {
            const media = MessageMedia.fromFilePath('./output.mp3');
            message.reply(media);
        }, 2000);
    } else {
        const { timestamp, body, from, deviceType } = message;
        const today = new Date(timestamp * 1000);
        const date = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}:${today.getHours() + 7}:${today.getMinutes()}`;
        const chat = {
            date,
            from,
            body,
            deviceType
        }

        jsonData.push(chat);
        fs.writeFileSync('data.json', JSON.stringify(jsonData));
    }
});

client.on('ready', () => {
    client.sendMessage('62895600904600@c.us', 'bot running');
    console.log('Client is ready!');
});

client.initialize();
