const {
    MessageType,
    WAConnection
} = require("@adiwajshing/baileys");
const qr = require('qrcode-terminal');
const {command} = require("./command.js")
const fs = require("fs");
const fetch = require("node-fetch")
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
    alf.on('group-participants-update',async (update) => {
        const ress = await fetch (await alf.getProfilePicture(update.participants[0]));
        const buff = await ress.buffer();
        if (update.action == "add") {
            try{
                const desc = await alf.groupMetadata(update.jid);
                await alf.sendMessage(update.jid, buff, MessageType.image,{contextInfo : {mentionedJid: update.participants},caption : `Selamat Datang @${update.participants[0].split("@")[0]} Semoga Betah\n*Deskripsi*: ${desc.desc}\n\n*Owner* : ${desc.descOwner}`})                
            }catch(err){
                console.log(err)
            }
            
        }else if(update.action == "remove"){
            try{
                await alf.sendMessage(update.jid, buff, MessageType.image,{contextInfo : {mentionedJid: update.participants},caption : `Selamat Jalan @${update.participants[0].split("@")[0]} Semoga Amal Ibadahnya Diterima`})
            }catch(err){
                console.log(err)
            }
        }
    })
    alf.on('chat-update', async (cht) => {
        command(alf,cht,date);
    });
    alf.connect();

} 


start().catch (err => console.log("unexpected error: " + err) )