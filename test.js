const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const google = require('google-it');
const { createAudioFile } = require('simple-tts-mp3');
const { promises } = require('dns');
const { resolve } = require('path');
const { rejects } = require('assert');
const { send } = require('process');

const client = new Client({
    puppeteer: { headless: true, args: ['--no-sandbox'] },
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('Client is ready!');

    // const media = await MessageMedia.fromFilePath('./output.mp3');
    // const image = await MessageMedia.fromUrl('https://via.placeholder.com/350x150.png');
    // client.sendMessage('6289514334091@c.us', media)
});
client.on('message', async message => {
    if (message.body.split(',')[0] === '/create_audio') {
        await createAudioFile(message.body.split(',')[1], 'output', 'id');
        message.reply('waiting create audio....');
        setTimeout(() => {
            const media = MessageMedia.fromFilePath('./output.mp3');
            message.reply(media);
        }, 3000);

    }
});
client.initialize();
