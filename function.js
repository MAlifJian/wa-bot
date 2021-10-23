exports.getRandom = getRandom = (ext) =>{
    return `ALFBot${Math.floor(Math.random() * 10000)}${ext}`;
}
const webp = require('webp-converter');
webp.grant_permission()
console.log(this.getRandom('.png'))
const result = webp.webpmux_add('ALFBot2521.webp','image_profile.webp','icc',logging="-v");
// const result = webp.dwebp("ALFBot2521.webp","ALFBot2521.jpg","-o",logging="-v");
result.then((res) => {
    console.log(res);
})