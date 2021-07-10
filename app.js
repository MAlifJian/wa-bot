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
            console.log(isAdmin);
            isAdmin = isAdmin > 0 ? true : false;
            const isOwner = sender === '6289624835956@s.whatsapp.net';
            //Body message
            const type = Object.keys(cht.message)[0];
            const isQuoted = type === 'extendedTextMessage' ? true : false;
            
            body = (type === 'conversation' && cht.message.conversation) ? cht.message.conversation : (type == 'imageMessage') && cht.message.imageMessage.caption ? cht.message.imageMessage.caption : (type == 'videoMessage') && cht.message.videoMessage.caption ? cht.message.videoMessage.caption : (type == 'extendedTextMessage') && cht.message.extendedTextMessage.text ? cht.message.extendedTextMessage.text : '';
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
                    texts = `│༺*MENU ALF  BOT*༻\n┝──────BOT──────\n│\n*Prefix *.\n│\n↳.info\n│\n↳.menu\n┝─────Menu Ban─────\n│\n↳.banlist\n│\n↳.ban [tag] (only admins)\n┝─────Tag Menu─────\n│\n↳.tagall (only admin)\n│\n↳.infoall\n│\n↳.hidetag [text] (default) = (kosong)\n┝─────Media Menu─────\n│\n↳.sticker [reply image / caption gambar]\n│\n↳.ytdl [linkyt] (return mp4)`
                    await alf.sendMessage(pengirim,texts,text);
                break;
            //Tag Case
                case 'tagall' :
                    if(!isGroup) return;
                    if(!isAdmin) return;
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
                    if(isBanned) return;
                    if(texts === "") texts = `${body.slice(9)}`;
                    members = [];
                    groupMembers.forEach(m => {
                        members.push(m.jid);
                    })
                    status = await alf.sendMessage(pengirim, texts ,extendedText, {contextInfo : {mentionedJid : members} })
                    console.log("Pesan Hidetag Terkirim dengan ID " + status.key);
                    break;
                //Admin Case
                case 'kick':
                    if(!isGroup) return;
                    if(isAdmin || isOwner){
                        var target = `${body.slice(7)}`;
                        await alf.sendMessage(pengirim, `Kata Kata Terakhirnya Bang @${target}`, extendedText, {contextInfo : {mentionedJid : [`${target}@s.whatsapp.net`]}})
                        await alf.groupRemove(pengirim, [`${target}@s.whatsapp.net`]);
                    }else{
                        await alf.sendMessage(pengirim, `Hanya Untuk Admin`,text,{quoted: cht});
                    }
                case 'add':
                    if(!isGroup) return;
                    if(isAdmin || isOwner){
                        var target = isQuoted ? JSON.parse(JSON.stringify(cht).replace('quotedM','m')).message.extendedTextMessage.contextInfo : `${body.slice(7)}`;
                        await alf.groupAdd(pengirim, [`${target}@s.whatsapp.net`]);
                        await alf.sendMessage(pengirim, `Hiya Kena Culik`)
                    }else{
                        await alf.sendMessage(pengirim, `Hanya Untuk Admin`,text,{quoted: cht});
                    }
                break;
                break;
                // Ban Case
                case 'ban' :
                    if(!isGroup) return;
                    console.log(isAdmin)
                    if(isAdmin || isOwner){
                        console.log(isAdmin);
                        var number = isQuoted ? JSON.parse(JSON.stringify(cht).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo: `${body.slice(5).replace('@', '')}@s.whatsapp.net`;
                        await ban.banList.push(number);
                        fs.writeFileSync('./dbs/banList.json', JSON.stringify(ban));
                        console.log(`Nomor TerBanned ${number}`);    
                    }else{
                        return await alf.sendMessage(pengirim, "Hanya Admin",text,{quoted: cht});;  
                    } 
                break;
                case 'unban' :
                    if(!isGroup) return;
                    if(!isAdmin) return await alf.sendMessage(pengirim, "Hanya Admin",text,{quoted: cht});
                    var number = `${body.slice(7).replace('@', '')}@s.whatsapp.net`;
                    number = await ban.banList.findIndex((f) => f === number);
                    if(number === -1) return await alf.sendMessage(pengirim, "Tag Setelah Perintah\nContoh:\n.unban @orangnya",text,{quoted: cht})
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
                        await alf.sendMessage(pengirim, '⏳Tunggu Sedang Di Proses', extendedText, {quoted : cht});
                        buffer = await getBuffer(format.url);
                        await alf.sendMessage(pengirim, buffer, video, {quoted : cht,mimetype : 'video/mp4',filename : `${info.videoDetails.title}.mp4`,caption : `Title : ${info.videoDetails.title}\n\nChannel: ${info.videoDetails.author.name}\n\nUploaded: ${info.videoDetails.uploadDate}\n\nDownload Completed ✅`});
                    }catch{
                        await alf.sendMessage(pengirim, '❌ Ada Error Coba Contact Owner', extendedText, { quoted : cht})
                    }
                    break;
                case 'ytmp3':
                    // if(!isGroup) return await alf.sendMessage(pengirim, 'Hanya Di Group', extendedText, {quoted : cht});
                    try{
                        var url = await body.slice(7);
                        await alf.sendMessage(pengirim, '⏳Tunggu Sedang Di Proses', extendedText, {quoted : cht});
                        var urlM = await fetcher(`http://zekais-api.herokuapp.com/ytmp3?url=${url}`,{method : 'get'});
                        console.log(urlM);
                        infomp3 = `╭─「 *TIMELINE PLAY MP3* 」\n│ *• Judul:* ${urlM.title}\n│ *• Channel:* ${urlM.channel}\n│ *•Size:* ${urlM.size}\n│ *•Link:* ${urlM.result}\n│\n│ *TUNGGU SEBENTAR LAGI DIKIRIM*\n│ *MOHON JANGAN SPAM YA BEB*\n╰─────────────────────`
                        bufferG = await getBuffer(urlM.thumb);
                        buffer = await getBuffer(urlM.result);
                        console.log('Sudah Terdownload')
                        await alf.sendMessage(pengirim, bufferG, image, {quoted : cht,caption : infomp3});
                        await alf.sendMessage(pengirim, buffer, audio, {mimetype : 'audio/mp4',quoted : cht,filename : `lagu.mp3`,ptt : true});
                    }catch(err){
                        console.log(err)
                        await alf.sendMessage(pengirim, '❌ Ada Error Coba Contact Owner', extendedText, { quoted : cht})
                    }
                break;
                case 'sticker':
                    const encmedia = isQuoted ? JSON.parse(JSON.stringify(cht).replace('quotedM','m')).message.extendedTextMessage.contextInfo : cht;
                    var gambar = await alf.downloadAndSaveMediaMessage(encmedia);
                    await alf.sendMessage(pengirim, '⏳Tunggu Sedang Di Proses', extendedText, {quoted : cht});
                    await ffmpeg(`./${gambar}`)
                        .input(gambar)
                        .on('error', err =>{
                            console.log(`Error : ${err}`);
                        })
                        .on('end',async () => {
                            console.log('Selesai Membuat Sticker');
                            await alf.sendMessage(pengirim, fs.readFileSync('./cobaa.webp'), sticker, {quoted : cht});
                            fs.unlinkSync('./cobaa.webp');
                            fs.unlinkSync(gambar);
                        })
                        .addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
                        .toFormat('webp')
                        .save('cobaa.webp')
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