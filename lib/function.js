exports.getRandom = getRandom = (ext) =>{
    return `ALFBot${Math.floor(Math.random() * 10000)}${ext}`;
}