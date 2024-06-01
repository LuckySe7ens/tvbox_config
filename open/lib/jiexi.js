import { Crypto, _ } from './cat.js';
const headers = {
    "Origin": 'https://jx.xmflv.com',
    'User_Agent': 'Mozilla/5.0 (Linux; Android 12; Redmi K30 Build/SKQ1.210908.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/96.0.4664.104 Mobile Safari/537.36',     
};
async function xmjiexi(url) {
   let t=new Date().getTime();
   let encData = sign(Crypto.MD5(t+url).toString().toLowerCase());
   //console.log(encData);
   let res = JSON.parse((await req('https://122.228.8.29:4433/xmflv.js', {
       method: 'post',
       headers: headers,
       data: {
           wap: 1,
           time: t,
           url: encodeURIComponent(url),
           key: encodeURIComponent(encData),
       },
       postType: 'form'
   })).content);
   let playUrl = aesDecode(res.url, res.aes_key, res.aes_iv);
   //console.log(playUrl);
   return {
        parse: 0, 
        url: playUrl,
        header: {
            "Origin": 'https://jx.xmflv.com',
            'User_Agent': 'Mozilla/5.0 (Linux; Android 12; Redmi K30 Build/SKQ1.210908.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/96.0.4664.104 Mobile Safari/537.36',     
        },
    }
}
//aes解密
function aesDecode(str, keyStr, ivStr) {
   const key = Crypto.enc.Utf8.parse(keyStr);
   var bytes = Crypto.AES.decrypt(str, key, {
       iv: Crypto.enc.Utf8.parse(ivStr),
       mode: Crypto.mode.CBC,
       padding: Crypto.pad.Pkcs7
   });
   return bytes.toString(Crypto.enc.Utf8);
}
function sign(a) {
   var b = Crypto.MD5(a);
   var c = Crypto.enc.Utf8.parse(b);
   var d = Crypto.enc.Utf8.parse('3cccf88181408f19');
   var e = Crypto.AES.encrypt(a, c, {
       iv: d,
       mode: Crypto.mode.CBC,
       padding: Crypto.pad.ZeroPadding
   });
   return e.toString()
}

export {
    xmjiexi
};