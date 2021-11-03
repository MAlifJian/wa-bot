const fs = require('fs');

const checkFile = async () => {
	try{
		const data = await JSON.parse(await fs.readFileSync(`./user/${namaFile}.json`));
		if (data.data.length >= namaFile) {
			namaFile += 100;
			fs.writeFileSync(`./user/${namaFile}.json`, JSON.stringify({data : [{}]}));
			return {status : "400" ,res : `Mengganti Data Menjadi ${namaFile}.json`, data : data.data}
		}else{
			return {status : "200", res : "Data Belum Penuh", data : data.data};
		}
	}catch(err){
		return {status : false, res: err};
	}
}

const writeData = async (info) => {
	const file = await checkFile();
	const checkUser= await (file.data.filter(e => e.jid === info.jid).length > 0);
	console.log(file.res);
	if (checkUser) {
		return {status : "403",res : "Alredy Register",data : file.data}
	}else{
		await file.data.push(info)
		await fs.writeFileSync(`./user/${namaFile}.json`, JSON.stringify({data : file.data}));
		return {status : "200", res : "Data Successfull Register"}
	}
}
const checkData = async (info) => {
	const data = await fs.readFileSync(`./user/${namaFile}.json`);
	const checkUser = await (file.data.filter(e => e.jid === info.jid).length > 0);
	if (!checkUser) {
		return {status : "403", res : "EROR code 403 : Permisson Denied\nKetik .register untuk mendaftar"}
	}
}
const showData = async jid => {
	const data = await JSON.parse(readFileSync(`./user/${namaFile}.json`)).data;
	const user = await data.filter(e => e.jid == jid)
	return user;
}
exports.writeData = writeData;
exports.checkData = checkData;
exports.showData = showData;