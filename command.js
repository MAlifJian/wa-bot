const{MessageType,
    WAPresenceData,
    Mimetype,
    MessageOptions} = require("@adiwajshing/baileys")
// Module
const {exec} = require("child_process")
const fs = require("fs");
const axios = require('axios');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const ytdl = require("ytdl-core");
ffmpeg.setFfmpegPath(ffmpegPath);

// Database Config
let ban = JSON.parse(fs.readFileSync("./dbs/banList.json"));
const statusBot = JSON.parse(fs.readFileSync("./dbs/status.json"));

//Function Import
const {fetcher, getBuffer} = require('./lib/fetcher.js')
const {getRandom} = require('./lib/function.js')

// Prefix
const prefix = '.';


// Function
function fancyTimeFormat(duration)
{   
    // Hours, minutes and seconds
    var hrs = Math.floor(duration/3600);
    var mins = Math.floor((duration % 3600) / 60);
    var secs = Math.floor(duration%60);

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;

    return ret;
} 
exports.command = async function command(alf,cht,date){
    // Online Time
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

        //pengecekan data pengirim
        const pengirim = cht.key.remoteJid;
        // MSG object
        const msg = {
            reply : (texts) =>{
                alf.sendMessage(pengirim, texts, text,{quoted: cht})
            },
            custom : (texts,type,option) => {
                alf.sendMessage(pengirim, texts, type, option);
            }
        };
        // Baca Pesan
        alf.chatRead(pengirim,"read");
        // Pembagian class nomor pengirim
        const isGroup = pengirim.endsWith('@g.us');
        const sender = isGroup ? cht.participant : cht.key.remoteJid;
        const isOwner = (sender === '6289624835956@s.whatsapp.net' || sender === "6285850057390@s.whatsapp.net");
        const isBanned = ban.banList.includes(sender);
        if (cht.message.conversation === ".off" && isOwner) {
            statusBot.status = false;
            fs.writeFileSync("./dbs/status.json", JSON.stringify(statusBot));
        }else if (cht.message.conversation === ".on" && isOwner) {
            statusBot.status = true;
            fs.writeFileSync("./dbs/status.json", JSON.stringify(statusBot));
        }
        // Pengecekan bot ON/OFF
        if (!statusBot.status) return;

        //Declaratioon

        let texts,status,members;

        const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType;

        const groupMetadata = isGroup ? await alf.groupMetadata(pengirim) : '';
        const groupMembers = isGroup ? groupMetadata.participants : "";
        let isAdmin = isGroup ? await groupMembers.findIndex((f,i) => {if (f.jid === sender && f.isAdmin === true) return true}) : false;
        isAdmin = isAdmin > 0 ? true : false;
        // console.log(JSON.parse(JSON.stringify(cht).replace('quotedM', 'm').message.extendedTextMessage.contextInfo));
        //Body message
        const type = Object.keys(cht.message)[0];
        const ephemerallMsg = type === 'ephemeralMessage' ? 'TRUE' : 'FALSE';
        const menu = `༺ *MENU ALF  BOT* ༻
│───────BOT───────│
Prefix: *.*
Online: ${timeOnline}

│──────Group──────│
Name: *${groupMetadata.subject}*
Members: *${groupMembers.length}*
Ephemeral Message: *${ephemerallMsg}*

│──────Menu───────│
> *Owner*
.bc
> *Info Bot*
.info
.runtime
.menu
> *Admin*
.kick
.tagall
.hidetag
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
                await msg.reply(texts)
                break;
            case 'menu':
                await msg.reply(menu);
            break;
            case 'runtime':
                texts = `${nowHours} Jam ${nowMinutes} Menit ${nowSecond} Detik`;
                await msg.custom(texts,text)
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
                await msg.custom(texts,extendedText, {contextInfo : {mentionedJid : members} });
                console.log(`Pesan Tagall Terkirim}`);
                break;
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
                await msg.custom(texts ,extendedText, {contextInfo : {mentionedJid : members} });
                console.log("Pesan Hidetag Terkirim");
                break;
            //Admin Case
            case 'kick':
                if(!isGroup ) return;
                if(!isAdmin || !isOwner){
                    return await msg.reply(`Hanya Untuk Admin`);
                }
                var target = isQuoted ? JSON.parse(JSON.stringify(cht).replace('quotedM','m')).message.extendedTextMessage.contextInfo.participant : `${body.slice(7)}@s.whatsapp.net`;
                await alf.groupRemove(pengirim, [`${target}`]);
            break;
            case 'add':
                if(!isGroup) return;
                if(!isAdmin || !isOwner){
                    return await msg.reply(`Hanya Untuk Admin`);
                }
                var target = isQuoted ? JSON.parse(JSON.stringify(cht).replace('quotedM','m')).message.extendedTextMessage.contextInfo.participant : `${body.slice(7)}@s.whatsapp.net`;
                await alf.groupAdd(pengirim, [`${target}`]);
                console.log("Success Add")
            break;
            // Ban Case
            case 'ban' :
                if(!isGroup) return;
                if(!isAdmin && !isOwner){
                      return await msg.reply("Hanya Admin");
                }
                    
                var number = body.slice(5) === ''? JSON.parse(JSON.stringify(cht).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo.participant : `${body.slice(5).replace('@', '')}@s.whatsapp.net`;
                if(!ban.banList.includes(number)){
                    await ban.banList.push(number);
                    fs.writeFileSync('./dbs/banList.json', JSON.stringify(ban));
                }
                await msg.reply("Nomor Terbanned")  
            break;
            case 'unban' :
                if(!isGroup) return;
                if(!isAdmin && !isOwner) return await msg.reply("Hanya Admin");
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
                await msg.custom(texts, text, {quoted : cht,contextInfo : {mentionedJid : members }});
            break;
            //Media Case
            case 'ytmp4':
                try{
                    if(!isGroup) return await msg.reply('Hanya Di Group');
                    var url = await `${body.slice(7)}`;
                    var info = await ytdl.getInfo(url);
                    var format = await ytdl.chooseFormat(info.formats, {quality : '18'});
                    var duration = await fancyTimeFormat(info.videoDetails.lengthSeconds);
                    await msg.reply(`⏳Tunggu Sedang Di Proses`);
                    buffer = await getBuffer(format.url);
                    await msg.custom(buffer, video, {quoted : cht,mimetype : 'video/mp4',filename : `${info.videoDetails.title}.mp4`,thumbnail: fs.readFileSync('./thumb.jpeg'),caption : `Title : ${info.videoDetails.title}\n\nChannel: ${info.videoDetails.author.name}\n\nDuration: ${duration}\n\nUploaded: ${info.videoDetails.uploadDate}\n\nDownload Completed ✅`});
                }catch(err){
                    console.log(err);
                    await msg.reply('❌ Ada Error Coba Contact Owner')
                }
                break;
            case 'ytmp3':
                if(!isGroup) return await msg.reply('Hanya Di Group');
                var url = await body.slice(7);
                try{
                    var info = await ytdl.getInfo(url);
                    var format = await ytdl.chooseFormat(info.formats, {quality : '18'});
                    var duration = await fancyTimeFormat(info.videoDetails.lengthSeconds);
                    await msg.reply('⏳Tunggu Sedang Di Proses');
                    var infomp3 = `Title : ${info.videoDetails.title}\n\nChannel: ${info.videoDetails.author.name}\n\nDuration: ${duration}\n\nUploaded: ${info.videoDetails.uploadDate}\n\n⏳ Mengganti ke MP3`;
                    buffer = await getBuffer(format.url);
                    var namaM4a = await getRandom(".m4a");
                    var namaMP3 = await getRandom(".mp3");
                    fs.writeFile(namaM4a,buffer, async () => {
                        await msg.custom(fs.readFileSync('thumb.jpeg'), image, {quoted : cht,caption : infomp3})
                        ;
                        exec(`ffmpeg -i ${namaM4a} -c:a libmp3lame -q:a 8 ${namaMP3}`, async (err,stdout) => {
                            if (err) {
                                return console.log(err);
                            }
                            await fs.unlinkSync(namaM4a);
                            buffer = await fs.readFileSync(namaMP3);

                            await msg.custom(buffer, audio, {mimetype : 'audio/mp4',quoted : cht,filename : namaMP3,ptt : true});
                            await fs.unlinkSync(namaMP3);
                        });
                        console.log("Completed");
                       
                    })
                    
                    
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
                var namaGambar = await getRandom('.png');
                await alf.sendMessage(pengirim, '⏳Tunggu Sedang Di Proses', extendedText, {quoted : cht});
                await ffmpeg(`./${gambar}`)
                    .input(gambar)
                    .on('error', err =>{
                        console.log(`Error : ${err}`);
                    })
                    .on('end',async () => {
                        try{
                        var buffGambar = await fs.readFileSync(namaGambar);
                        console.log(buffGambar);
                        await alf.sendMessage(pengirim, buffGambar, image, {quoted : cht});
                        fs.unlinkSync(namaGambar)
                        fs.unlinkSync(gambar);
                        }catch (err){
                          msg.reply(err)
                        };
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
}