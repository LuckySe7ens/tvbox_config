import { Crypto, load, _ } from './lib/cat.js';

let siteKey = '';
let siteType = 0;
const PC_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36';

let host = 'https://www.91panta.cn/';
let headers = {
    'User-Agent': PC_UA,
    'Referer': 'https://yun.139.com'
};

async function request(reqUrl, data, header, method) {
    let res = await req(reqUrl, {
        method: method || 'get',
        data: data || '',
        headers: header || headers,
        postType: method === 'post' ? 'form-data' : '',
        timeout: 10000,
    });
    return res.content;
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
}

async function home(filter) {
    let $ = load(await request(host));
    let classes = _.map($('#tabNavigation > a.tab'),item =>{
        return {
            type_id: $(item).attr('href'),
            type_name: $(item).text().trim(),
        }
    });
    return JSON.stringify({
        class: classes,
    });
}

async function category(tid, pg, filter, extend) {
    let $ = load(await request(host + tid + '&page=' + pg));
    let list = _.map($('.topicList > .topicItem'), item => {
        let pic = $(item).find('a.avatarLink img').attr('src');
        let picDoc = $(item).find('.detail .tm-m-photos-thumb');
        if (picDoc.length > 0) {
            pic = $(picDoc).find('li').attr('data-src');
        }
        let contentDoc = $(item).find('.content > h2 > a');
        return {
            vod_id: contentDoc.attr('href'),
            vod_name: contentDoc.text(),
            vod_pic: host + pic,
        }
    });
    return JSON.stringify({
        page: pg,
        pagecount: 9999,
        list: list,
    });
    
}

async function detail(id) {
    let $ = load(await request(host + id));
    let fid = $('.topicContent > p > strong > a').text().split('?')[1];
    let content = $('.topicContent > p > span').text().split('\n');
    //console.log(content);
    let vod = {
        vod_id: id,
        vod_director: content[0].split(':')[1],
        vod_actor: content[2].split(':')[1],
        type_name: content[3].split(':')[1],
        vod_area: content[4].split(':')[1],
        vod_lang: content[5].split(':')[1],
        vod_content: content[10],
    };
    let playUrls = [];
    let ret = await getVideoInfo(fid);
    while (!ret.data.coLst && ret.data.caLst) {
        ret = await getVideoInfo(fid, ret.data.caLst[0].path);
    }
    if (ret.data.coLst) {
        _.forEach(ret.data.coLst, item => {
            if(item.coType == 3) {
                playUrls.push(item.coName + '$' + item.presentURL);
            }
        })
    }
    playUrls.sort();
    vod.vod_play_from = '移动网盘';
    vod.vod_play_url = playUrls.join('#');
    return JSON.stringify({
        list: [vod],
    });
}

async function play(flag, id, flags) {
    return JSON.stringify({
        parse: 0,
        url: id,
    });
}

function D(e) {
    let x = Crypto.enc.Utf8.parse("PVGDwmcvfs1uV3d1");
    let a = JSON.stringify(e)
        , s = Crypto.enc.Utf8.parse(a);
        //var t = Crypto.lib.WordArray.random(16), n = "";
        let t = x, n = ''; 
    n = Crypto.AES.encrypt(s, x, {
        iv: t,
        mode: Crypto.mode.CBC,
        padding: Crypto.pad.Pkcs7
    });
    return Crypto.enc.Base64.stringify(t.concat(n.ciphertext))
}

function I(e) {
    let x = Crypto.enc.Utf8.parse("PVGDwmcvfs1uV3d1");
    let t = Crypto.enc.Base64.parse(e.replaceAll(' ',''))
        , n = t.clone()
        , i = n.words.splice(4);
    n.init(n.words),
    t.init(i);
    let o = Crypto.enc.Base64.stringify(t)
        , a = Crypto.AES.decrypt(o, x, {
        iv: n,
        mode: Crypto.mode.CBC,
        padding: Crypto.pad.Pkcs7
    })
        , s = a.toString(Crypto.enc.Utf8);
    return s.toString();
}

async function getVideoInfo(link, fid) {
    let url = 'https://share-kd-njs.yun.139.com/yun-share/richlifeApp/devapp/IOutLink/getOutLinkInfoV6';
    let params = {
        "getOutLinkInfoReq":{
            "account":"",
            "linkID": link,
            "passwd":"",
            "caSrt":0,
            "coSrt":0,
            "srtDr":1,
            "bNum":1,
            "pCaID": fid || "root",
            "eNum":200
        }
    }
    //console.log(D(params));
    let res = await req(url, {'body': D(params), 'headers':{
        'X-Deviceinfo': '||3|12.27.0|safari|13.1.2|1||macos 10.15.6|1324X381|zh-cn|||',
        'hcy-cool-flag': '1',
        'Authorization': '',
        'Content-Type': 'application/json'
    }, 'method':'post');
    return JSON.parse(I(res.content));
}

export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        //homeVod: homeVod,
        category: category,
        detail: detail,
        play: play,
        //search: search,
        //validCode: validCode,
        //proxy: proxy,
    };
}
