const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

const client = new Client({
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
    } else {
        const { timestamp, body, from, deviceType } = message;
        const today = new Date(timestamp * 1000);
        const date = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}:${today.getHours()}:${today.getMinutes()}`;
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
    console.log('Client is ready!');
});

client.initialize();
