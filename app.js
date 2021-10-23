const {
    WAConnection,
    MessageType,
    WAPresenceData,
    Mimetype,
	MessageOptions
} = require("@adiwajshing/baileys");
const qr = require('qrcode-terminal');
const fs = require("fs");
const axios = require('axios');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const ytdl = require("ytdl-core");
ffmpeg.setFfmpegPath(ffmpegPath);
//Function Import
const {fetcher, getBuffer} = require('./lib/fetcher.js')
const {getRandom} = require('./lib/function.js')

// Timer
const date = new Date();

const startHours = date.getHours();
const startMinutes = date.getMinutes();
const startSecond = date.getSeconds();

console.log(`${date.getTime()} ${startHours} Jam ${startMinutes} Menit`);
// Database Config
let ban = JSON.parse(fs.readFileSync("./dbs/banList.json"));

async function start(){
    const alf = new WAConnection();
    alf.version = [2, 2119, 6];
    const prefix = '.';
    if(fs.existsSync('./session.json')){
        alf.loadAuthInfo('./session.json');
        console.log("Login Menggunakan Session")
    }
    alf.on('open',() => {
        const session = alf.base64EncodedAuthInfo();
        console.log(`Selamat Datang ${alf.user.name}`);
        fs.writeFileSync('./session.json' , JSON.stringify(session))
    })
    alf.on('chats-received', async ({hasNewChats}) => {
        console.log(`has new chats ${hasNewChats} chat:${alf.chats.get.name}`);
    })
    alf.on('chat-update', async (cht) => {
        const nowDate = new Date();
        const online = nowDate.getTime() - date.getTime();

        const nowSecond = Math.floor((online % (1000 * 60))/ 1000);
        const nowMinutes = Math.floor((online % (1000 * 60 * 60)) / (1000 * 60));
        const nowHours = Math.floor((online % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const timeOnline = `${nowHours} Jam ${nowMinutes} Menit ${nowSecond} Detik`;
        try {
            if (!cht.hasNewMessage) return;
            let nama = '';
            if (cht.presences) {
                Object.values(cht.presences).forEach( s => {nama = s.name;console.log(nama)});
            }
            cht = cht.messages.all()[0];

            //Declaratioon
            let texts,status,members;

            const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType;
            //pengecekan data pengirim
            const pengirim = cht.key.remoteJid;
            const isGroup = pengirim.endsWith('@g.us');
            const sender = isGroup ? cht.participant : cht.key.remoteJid;
            const isBanned = ban.banList.includes(sender);
            const groupMetadata = isGroup ? await alf.groupMetadata(pengirim) : '';
            const groupMembers = isGroup ? groupMetadata.participants : "";
            let isAdmin = isGroup ? await groupMembers.findIndex((f,i) => {if (f.jid === sender && f.isAdmin === true) return true}) : false;
            // console.log(JSON.parse(JSON.stringify(cht).replace('quotedM', 'm').message.extendedTextMessage.contextInfo));
            isAdmin = isAdmin > 0 ? true : false;
            const isOwner = sender === '6289624835956@s.whatsapp.net';
            //Body message
            const type = Object.keys(cht.message)[0];
            const ephemerallMsg = type === 'ephemeralMessage' ? 'TRUE' : 'FALSE';
            const menu = `༺ *MENU ALF  BOT* ༻
│──────BOT───────│
Prefix: *.*
Online: ${timeOnline}

│──────Group──────│
Name: *${groupMetadata.subject}*
Members: *${groupMembers.length}*
Ephemeral Message: *${ephemerallMsg}*

│──────Menu──────│
> *Admin*
.kick
.tagall
.hidetag
.infoall
.add

> *Media*
.sticker
.toimg
.ytmp4
.ytmp3

> *Menu Ban*
.ban
.banlist
.unban
`

            const isQuoted = type === 'extendedTextMessage' ? true : false;
            console.log(type);
            body = (type === 'conversation' && cht.message.conversation) ? cht.message.conversation : (type == 'imageMessage') && cht.message.imageMessage.caption ? cht.message.imageMessage.caption : (type == 'videoMessage') && cht.message.videoMessage.caption ? cht.message.videoMessage.caption : (type == 'extendedTextMessage') && cht.message.extendedTextMessage.text ? cht.message.extendedTextMessage.text : (type == 'ephemeralMessage' ) ? cht.message.ephemeralMessage.message.extendedTextMessage.text : '';
            if (body === 'bot'){
                    texts = 
                    `────────────────────────\nOwner         : Alif Jian\nContact       : wa.me/+6289624835956\nDescription : Hubungi Owner Untuk Menu Baru,Bot Masih Dalam Pengembangan\n\n
                         *ALF BOT*\n
                    ────────────────────────
                             `;
                    await alf.sendMessage(pengirim, texts, text,{quoted: cht});
            }
            const command = body.startsWith(prefix) ? body.slice(1).trim().split(" ")[0].toLowerCase() : '';
            console.log(`Perintah Dari Nama: ${nama}\nPerintah:${body}\nGroup: ${groupMetadata.subject}`);
            if(isBanned) return;
            switch (command) {
            //About Bot
                case 'info':
                    texts = 
                    `────────────────────────\nOwner         : Alif Jian\nContact       : wa.me/+6289624835956\nDescription : Hubungi Owner Untuk Menu Baru,Bot Masih Dalam Pengembangan\n\n
                         *ALF BOT*\n
                    ────────────────────────
                             `;
                    await alf.sendMessage(pengirim, texts, text,{quoted: cht});
                    break;
                case 'menu':
                    await alf.sendMessage(pengirim,menu,text);
                break;
            //Tag Case
                case 'tagall' :
                    if(!isGroup) return;
                    if(!isAdmin && !isOwner) return;
                    if(isBanned) return;
                    texts = '*ALF  BOT*\n';
                    members = [];
                    groupMembers.forEach(m => {
                        members.push(m.jid);
                        texts += `@${m.jid.replace("@s.whatsapp.net", "")}\n`;
                    })
                    texts += "*ALF BOT*";
                    status = await alf.sendMessage(pengirim, texts,extendedText, {contextInfo : {mentionedJid : members} })
                    console.log(`Pesan Tagall Terkirim dengan ID ${status.key}`)
                    break;
                case 'infoall':
                    texts = '*INFOALL:*\n'
                case 'hidetag':
                    if(!isGroup) return;
                    if(!isAdmin && !isOwner) return;
                    if(isBanned) return;
                    texts = `${body.slice(9)}`;
                    console.log()
                    members = [];
                    groupMembers.forEach(m => {
                        members.push(m.jid);
                    })
                    await alf.sendMessage(pengirim, texts ,extendedText, {contextInfo : {mentionedJid : members} })
                    console.log("Pesan Hidetag Terkirim dengan ID ");
                    break;
                //Admin Case
                case 'kick':
                    if(!isGroup ) return;
                    if(!isAdmin || !isOwner){
                        return await alf.sendMessage(pengirim, `Hanya Untuk Admin`,text,{quoted: cht});
                    }
                    var target = isQuoted ? JSON.parse(JSON.stringify(cht).replace('quotedM','m')).message.extendedTextMessage.contextInfo.participant : `${body.slice(7)}@s.whatsapp.net`;
                    await alf.groupRemove(pengirim, [`${target}`]);
                break;
                case 'add':
                    if(!isGroup) return;
                    if(!isAdmin || !isOwner){
                        return await alf.sendMessage(pengirim, `Hanya Untuk Admin`,text,{quoted: cht});
                    }
                    var target = isQuoted ? JSON.parse(JSON.stringify(cht).replace('quotedM','m')).message.extendedTextMessage.contextInfo.participant : `${body.slice(7)}@s.whatsapp.net`;
                    console.log(target)
                    await alf.groupAdd(pengirim, [`${target}`]);
                break;
                // Ban Case
                case 'ban' :
                    if(!isGroup) return;
                    if(isAdmin || isOwner){
                        var number = body.slice(5) === ''? JSON.parse(JSON.stringify(cht).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo.participant : `${body.slice(5).replace('@', '')}@s.whatsapp.net`;
                        if(!ban.banList.includes(number)){
                            await ban.banList.push(number);
                            fs.writeFileSync('./dbs/banList.json', JSON.stringify(ban));
                        }
                        console.log(`Nomor TerBanned ${number}`);    
                    }else{
                        return await alf.sendMessage(pengirim, "Hanya Admin",text,{quoted: cht});;  
                    } 
                break;
                case 'unban' :
                    if(!isGroup) return;
                    if(!isAdmin) return await alf.sendMessage(pengirim, "Hanya Admin",text,{quoted: cht});
                    var number = body.slice(5) === ''? JSON.parse(JSON.stringify(cht).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo.participant : `${body.slice(5).replace('@', '')}@s.whatsapp.net`;
                    number = await ban.banList.findIndex((f) => f === number);
                    ban.banList.splice(number,1);
                    fs.writeFileSync('./dbs/banList.json', JSON.stringify(ban));
                break;
                case 'banlist':
                    if(!isGroup) return;
                    texts = 'List Anak Nakal\n';
                    members = []
                    ban.banList.forEach(m => {
                        members.push(m);
                        texts += `@${m.replace("@s.whatsapp.net", '')}\n`;
                    })
                    await alf.sendMessage(pengirim, texts, text, {quoted : cht,contextInfo : {mentionedJid : members }})
                break;
                //Media Case
                case 'ytmp4':
                    try{

                        if(!isGroup) return await alf.sendMessage(pengirim, 'Hanya Di Group', extendedText, {quoted : cht});
                        var url = await `${body.slice(7)}`;
                        var info = await ytdl.getInfo(url);
                        var format = await ytdl.chooseFormat(info.formats, {quality : '18'});
                        await alf.sendMessage(pengirim, `⏳Tunggu Sedang Di Proses`, extendedText, {quoted : cht});
                        buffer = await getBuffer(format.url);
                        await alf.sendMessage(pengirim, buffer, video, {quoted : cht,mimetype : 'video/mp4',filename : `${info.videoDetails.title}.mp4`,thumbnail: fs.readFileSync('./thumb.jpeg'),caption : `Title : ${info.videoDetails.title}\n\nChannel: ${info.videoDetails.author.name}\n\nUploaded: ${info.videoDetails.uploadDate}\n\nDownload Completed ✅`});
                    }catch(err){
                        console.log(err);
                        await alf.sendMessage(pengirim, '❌ Ada Error Coba Contact Owner', extendedText, { quoted : cht})
                    }
                    break;
                case 'ytmp3':
                    // if(!isGroup) return await alf.sendMessage(pengirim, 'Hanya Di Group', extendedText, {quoted : cht});
                    var url = await body.slice(7);
                    try{
                        await alf.sendMessage(pengirim, '⏳Tunggu Sedang Di Proses', extendedText, {quoted : cht});
                        var urlM = await fetcher(`https://michaelbelgium.me/ytconverter/convert.php?youtubelink=${url}`,{method : 'get'});
                        console.log(urlM);
                        infomp3 = `╭─「 *TIMELINE PLAY MP3* 」\n│ *• Judul:* ${urlM.title}\n│ *•Link:* ${urlM.file}\n│\n│ *TUNGGU SEBENTAR LAGI DIKIRIM*\n│ *MOHON JANGAN SPAM YA BEB*\n╰─────────────────────`
                        buffer = await getBuffer(urlM.file);
                        console.log(buffer)
                        await alf.sendMessage(pengirim, fs.readFileSync('thumb.jpeg'), image, {quoted : cht,caption : infomp3});
                        await alf.sendMessage(pengirim, buffer, audio, {mimetype : 'audio/mp4',quoted : cht,filename : `${urlM.title}.mp3`,ptt : true});
                    }catch(err){
                        console.log(err)
                        await alf.sendMessage(pengirim, '❌ Ada Error Coba Contact Owner', extendedText, { quoted : cht})
                    }
                break;
                case "stiker":
                case 'sticker':
                    var encmedia = isQuoted ? JSON.parse(JSON.stringify(cht).replace('quotedM','m')).message.extendedTextMessage.contextInfo : cht;
                    var gambar = await alf.downloadAndSaveMediaMessage(encmedia);
                    var namaGambar = getRandom('.webp');
                    await alf.sendMessage(pengirim, '⏳Tunggu Sedang Di Proses', extendedText, {quoted : cht});
                    await ffmpeg(`./${gambar}`)
                        .input(gambar)
                        .on('error', err =>{
                            console.log(`Error : ${err}`);
                        })
                        .on('end',async () => {
                            console.log('Selesai Membuat Sticker');
                            await alf.sendMessage(pengirim, fs.readFileSync(namaGambar), sticker, {quoted : cht});
                            fs.unlinkSync(namaGambar);
                            fs.unlinkSync(gambar);
                        })
                        .addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
                        .toFormat('webp')
                        .save(namaGambar)
                break;
                case'toimg':
                case 'image':
                    var encmedia = JSON.parse(JSON.stringify(cht).replace('quotedM','m')).message.extendedTextMessage.contextInfo;
                    var gambar = await alf.downloadAndSaveMediaMessage(encmedia);
                    var namaGambar = getRandom('.png');
                    await alf.sendMessage(pengirim, '⏳Tunggu Sedang Di Proses', extendedText, {quoted : cht});
                    await ffmpeg(`./${gambar}`)
                        .input(gambar)
                        .on('error', err =>{
                            console.log(`Error : ${err}`);
                        })
                        .on('end',async () => {
                            var buffGambar = await fs.readFileSync(namaGambar);
                            console.log('Selesai Membuat Gambar');
                            await alf.sendMessage(pengirim, buffGambar, image, {quoted : cht});
                            fs.unlinkSync(namaGambar);
                            fs.unlinkSync(gambar);
                        })
                        .output(namaGambar)
                        .run();
                break;
                default:
                    break;
            }
            console.log(command);
        } catch (error) {
         console.log(error);   
        }
    });
    alf.connect();

} 


start().catch (err => console.log("unexpected error: " + err) )