const {
    WAConnection
} = require("@adiwajshing/baileys");
const qr = require('qrcode-terminal');
const {command} = require("./command.js")
const fs = require("fs");
// Timer
const date = new Date();

async function start(){
    const alf = new WAConnection();
    alf.version = [2, 2119, 6];
    if(fs.existsSync('./session.json')){
        alf.loadAuthInfo('./session.json');
        console.log("Login Menggunakan Session")
    }
    alf.on('open',() => {
        const session = alf.base64EncodedAuthInfo();
        console.log(`Selamat Datang ${alf.user.name}`);
        fs.writeFileSync('./session.json' , JSON.stringify(session))
    })
    alf.on('chat-update', async (cht) => {
        command(alf,cht,date);
    });
    alf.connect();

} 


start().catch (err => console.log("unexpected error: " + err) )