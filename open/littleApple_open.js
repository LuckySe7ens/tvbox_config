import { Crypto, load, _ } from './lib/cat.js';

let siteUrl ='http://tipu.xjqxz.top';
let siteKey = '';
let siteType = 0;


let headers = {
    'token2' : 'enxerhSl0jk2TGhbZCygMdwoKqOmyxsk/Kw8tVy4dsRBE1o1xBhWhoFbh98=',
    'token': 'RXQbgQKl3QkFZkIPGwGvH5kofvCokkkn/a893wC2IId7HQFmy0Eh24osz555X12xGVFxQLTaGuBqU/Y7KU4lStp4UjR7giPxdwoTOsU6R3oc4yZZTQc/yTKh1mH3ckZhx6VsQCEoFf6q',
    'version': 'XPGBOX com.phoenix.tv1.3.3',
    'user_id': 'XPGBOX',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    'screenx': '1280',
    'screeny': '720',
}

function getHeaders() {
    headers['timestamp'] = Math.floor(Date.now() / 1e3);
    headers['hash'] = Crypto.MD5('||||DC6FFCB55FA||861824127032820||12702720||Asus/Asus/ASUS_I003DD:7.1.2/20171130.376229:user/release-keysXPGBOX com.phoenix.tv1.3.3'+headers['timestamp']).toString().toLowerCase().substring(8,12);
    return headers;
}

async function request(reqUrl, postData, post) {
    let res = await req(reqUrl, {
        method: post ? 'post' : 'get',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
            'Referer': 'http://tipu.xjqxz.top/'
        },
        data: postData || {},
        postType: post ? 'form' : '',
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
    let classes = [{
        type_id: '1',
        type_name: '电影',
    },{
        type_id: '2',
        type_name: '电视'
    },{
        type_id: '3',
        type_name: '综艺'
    },{
        type_id: '4',
        type_name: '动漫'
    },{
        type_id: '35',
        type_name: '直播'
    }];
    let filterObj = await genFilterObj();
    return JSON.stringify({
        class: classes,
        //filters: filterObj
    });
}

async function homeVod() {
}

async function category(tid, pg, filter, ext) {
    if (!pg) pg = 1;
    if (pg <= 0) pg = 1;
    let clazz = ext['class'];
    let year = ext['year'];
    let area = ext['area'];
    let url = `${siteUrl}/api.php/v2.vod/androidfilter10086?page=${pg}&type=${tid}`;
    if(clazz) {
        url = url + '&class=' + clazz;
    }
    if (area) {
        url = url + '&area=' + area;
    }
    if(year) {
        url = url + 'year=' + year;
    }
    console.log(url);
    let videos = await getVideos(url);
    return JSON.stringify({
        list: videos,
        page: pg,
    });
}

async function detail(id) {
    try {
        const data = JSON.parse(await request(siteUrl + '/api.php/v3.vod/androiddetail2?vod_id=' + id)).data;

        const playNameUrls = _.map(data.urls, item => {
            return item.key + '$' + item.url;
        }).join('#');
        
        const video = {
            vod_play_from: 'Leospring',
            vod_play_url: playNameUrls,
            vod_content: 'leospring 公众号【蚂蚁科技杂谈】' + data.content,
            vod_director: data.director,
            vod_actor: data.actor,
            vod_year: data.year,
            vod_area: data.area,
            vod_type: data.className,
        };
        const list = [video];
        const result = { list };
        return JSON.stringify(result);
    } catch (e) {
    console.log('err', e);
    }
    return null;
}

async function search(wd, quick, pg) {
    let url = siteUrl + `/api.php/v2.vod/androidsearch10086?page=${pg}&wd=${wd}`;
    let videos = await getVideos(url);
    return JSON.stringify({
        list: videos,
    });
}

async function play(flag, id, flags) {
    return JSON.stringify({
        parse: 0,
        url: 'http://c.xpgtv.net/m3u8/' + id + '.m3u8',
        header: getHeaders(),
    });
}

function base64Decode(text) {
    return Crypto.enc.Utf8.stringify(Crypto.enc.Base64.parse(text));
}

async function genFilterObj() {
    
    return {
        '1': [{'key': 'class', 'name': '类型','value': []}, 
            {'key': 'area', 'name': '地区', 'value': []}, 
            {'key': 'year', 'name': '年份', 'value': []}
        ], 
        '2': [{'key': 'class', 'name': '类型', 'value': []}, 
            {'key': 'area', 'name': '地区', 'value': []}, 
            {'key': 'year', 'name': '年份', 'value': []}
        ], 
    };
}

async function getVideos(url) {
    const data = JSON.parse(await request(url)).data;
    let videos = _.map(data, (n) => {
        return {
            vod_id: n.id,
            vod_name: n.name,
            vod_pic: n.pic,
            vod_remarks: n.updateInfo,
        };
    });
    return videos;
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
    };
}