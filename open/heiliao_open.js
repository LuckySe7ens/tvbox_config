import { Crypto, load, _ } from './lib/cat.js';

//黑料网发布页 https://hl44.co
let siteUrl ='https://cnsuy.mgtyvoya.com';
let siteKey = '';
let siteType = 0;
let headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
};
let imgObj = {};

async function request(reqUrl, postData, post) {

    let res = await req(reqUrl, {
        method: 'get',
        headers: headers,
        //data: postData || {},
        //postType: post ? 'form' : '',
    });

    let content = res.content;
    return content;
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    if (cfg.ext) {
        siteUrl = cfg.ext;
    }
}

async function home(filter) {
    const $ = load(await request(siteUrl));
    let classes = _.map($('a.slider-item'), item => {
        let typeId = $(item).attr('href').replace('.html', '');
        if (typeId === '/') typeId = '/category/0';
        return {
            type_id: typeId,
            type_name: $($(item).find('span')).text(),
        }
    });
    
    return JSON.stringify({
        class: classes,
        //filters: filters,
    });
}

async function homeVod() {
}

async function category(tid, pg, filter, ext) {
    if (!pg) pg = 1;
    if (pg <= 0) pg = 1;
    let url = `${siteUrl}/${tid}/${pg}.html`;
    const videos = await getVideos(url);
    //console.log('videos', videos);
    return JSON.stringify({
        list: videos,
        page: pg,
        limit: videos.length,
    });
}

async function detail(id) {
    try {
        const url = siteUrl + id;
        const $ = load(await request(url));
        const content = $('div.detail-page > div > p:nth-child(3)').text();
        const playUrls = _.map($('div.dplayer'), (item, idx) => {
            const videoUrl = JSON.parse($(item).attr('config')).video.url;
            return `${idx+1}$${videoUrl}`;
        }).join('#');
        let vod = {
            vod_content: content,
            vod_play_from: 'Leospring',
            vod_play_url: playUrls,
        };
        
        return JSON.stringify({
            list: [vod],
        });
    } catch (e) {
    console.log('err', e);
    }
    return null;
}

async function search(wd, quick, pg) {
    let url = siteUrl + '/index/search_article';
    if (!pg) pg = 1;
    if (pg <= 0) pg = 1;
    let res = await req(url, {
        method: 'post',
        headers: headers,
        data: {
            word: wd,
            page: pg,
        },
        postType: 'form',
    });
    let content = JSON.parse(res.content).data.list;
    const videos = _.map(content, item => {
        return {
            vod_id: `/archives/${item.id}.html`,
            vod_name: item.title,
            vod_pic: item.thumb,
            vod_remarks: item.created_date,
        };  
    });
    //console.log('content', content);
    return JSON.stringify({
        list: videos,
        page: pg,
        limit: videos.length,
    });
}

async function play(flag, id, flags) {
    return JSON.stringify({
        parse: 0,
        url: id,
    });
}

async function getVideos(url) {
    let $ = load(await request(url));
    let videos = [];
    imgObj = {};
    const js2Base = await js2Proxy(true, siteType, siteKey, 'img/', {});
    _.forEach($('a.cursor-pointer'), (item, idx) => {
        if(!(url.indexOf('/category/0') > 0 && idx == 0)) {
            const vod_id = $(item).attr('href');
            
            const vod_name = $($(item).find('div.title')).text();
            const vod_pic = $($(item).find('img')).attr('src');
            
            if (vod_id.startsWith('/archives') && vod_name) {
                imgObj[vod_id] = vod_pic;
                //console.log('vid', vod_name);
                videos.push({
                    vod_id: vod_id,
                    vod_name: vod_name,
                    vod_pic: js2Base + base64Encode(vod_id),
                })
            }
        }
    });
    return videos;
    
}

async function proxy(segments, headers) {
    let what = segments[0];
    let url = base64Decode(segments[1]);
    if (what == 'img') {
        if(url.startsWith('http')) {
            var resp = await req(url, {
                buffer: 2,
                headers: {
                    Referer: 'https://api.douban.com/',
                    'User-Agent': MOBILE_UA,
                },
            });
            return JSON.stringify({
                code: resp.code,
                buffer: 2,
                content: picdecrypt(resp.content),
                headers: resp.headers,
            });
        } else {
            return JSON.stringify({
                code: 200,
                buffer: 2,
                content: imgObj[url].replace(/^data:image\/\w+;base64,/,''),
                headers: {},
            });
        }
    }
    return JSON.stringify({
        code: 500,
        content: '',
    });
}

 //aes解密
 function picdecrypt(str, keyStr, ivStr) {
    const key = Crypto.enc.Utf8.parse(keyStr);
    var decrypt = Crypto.AES.decrypt(str, key, {
        iv: Crypto.enc.Utf8.parse(ivStr),
        mode: Crypto.mode.CBC,
        padding: Crypto.pad.Pkcs7
    });
    return Crypto.enc.Base64.stringify(decrypt).toString();
 }

function base64Encode(text) {
    return Crypto.enc.Base64.stringify(Crypto.enc.Utf8.parse(text));
}

function base64Decode(text) {
    return Crypto.enc.Utf8.stringify(Crypto.enc.Base64.parse(text));
}


export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        homeVod: homeVod,
        category: category,
        detail: detail,
        play: play,
        search: search,
        proxy: proxy,
    };
}