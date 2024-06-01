import { Crypto, load, _ } from './lib/cat.js';

let key = 'moli';
let HOST = 'https://hdmoli.pro';
let host = '';
let siteKey = '';
let siteType = 0;

const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 11; M2007J3SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045714 Mobile Safari/537.36';

async function request(reqUrl, extHeader) {
    let headers = {
        'User-Agent': MOBILE_UA,
        'Referer': HOST,
    };
    const res = await req(reqUrl, {
        method: 'get',
        headers: headers,
    });
    return res.content;
}

// cfg = {skey: siteKey, ext: extend}
async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
}

async function home(filter) {
    let classes = [{
            type_id: 1,
            type_name: '电影',
        },{
            type_id: 2,
            type_name: '剧集',
    },{
            type_id: 41,
            type_name: '动画',
    }];
    const filterObj = {
        1: [{ key: 'type', name: '类型', value: [{ n: '动作', v: '5' }, { v: '6', n: '爱情' }, { v: '7', n: '科幻' }, { v: '8', n: '恐怖' },{ n: '战争', v: '9' }, { v: '10', n: '喜剧' }, { v: '11', n: '纪录片' }, { v: '12', n: '剧情' }, { v: '30', n: '犯罪' }, { v: '32', n: '动画' }] },{ key: 'area', name: '地区', value: [{ n: '美国', v: '美国' }, { v: '韩国', n: '韩国' }, { v: '英国', n: '英国' }, { v: '日本', n: '日本' }, { v: '泰国', n: '泰国' }, { v: '中国', n: '中国' }, { v: '其他', n: '其他' }] },{ key: 'year', name: '年份', value: [{ n: '2024', v: '2024' }, { v: '2023', n: '2023' }, { v: '2022', n: '2022' }, { v: '2021', n: '2021' }, { v: '2020', n: '2020' }, { v: '2019', n: '2019' },{ n: '2018', v: '2018' }, { v: '2017', n: '2017' }, { v: '2016', n: '2016' }, { v: '2015', n: '2015' }, { v: '2014', n: '2014' }, { v: '2013', n: '2013' }, { v: 'more', n: 'more' }] }],
        2: [{ key: 'type', name: '类型', value: [{ n: '美剧', v: '15' }, { v: '16', n: '韩剧' }, { v: '13', n: '日剧' }, { v: '34', n: '英剧' },{ n: '中国', v: '14' }, { v: '29', n: '泰剧' }, { v: '39', n: '综艺' }, { v: '38', n: '其他' }] },{ key: 'area', name: '地区', value: [{ n: '美国', v: '美国' }, { v: '韩国', n: '韩国' }, { v: '英国', n: '英国' }, { v: '日本', n: '日本' }, { v: '泰国', n: '泰国' }, { v: '中国', n: '中国' }, { v: '其他', n: '其他' }] },{ key: 'year', name: '年份', value: [{ n: '2024', v: '2024' }, { v: '2023', n: '2023' }, { v: '2022', n: '2022' }, { v: '2021', n: '2021' }, { v: '2020', n: '2020' }, { v: '2019', n: '2019' },{ n: '2018', v: '2018' }, { v: '2017', n: '2017' }, { v: '2016', n: '2016' }, { v: '2015', n: '2015' }, { v: '2014', n: '2014' }, { v: '2013', n: '2013' }, { v: 'more', n: 'more' }] }],
        41: [{ key: 'type', name: '地区', value: [{ n: '日本', v: '42' }, { v: '43', n: '其他' }] },{ key: 'year', name: '年份', value: [{ n: '2024', v: '2024' }, { v: '2023', n: '2023' }, { v: '2022', n: '2022' }, { v: '2021', n: '2021' }, { v: '2020', n: '2020' }, { v: '2019', n: '2019' },{ n: '2018', v: '2018' }, { v: '2017', n: '2017' }, { v: '2016', n: '2016' }, { v: '2015', n: '2015' }, { v: '2014', n: '2014' }, { v: '2013', n: '2013' }, { v: 'more', n: 'more' }] }],

    };
    return JSON.stringify({
        class: classes,
        filters: filterObj,
    });
}

async function homeVod() {
    const $ = load(await request(HOST));
    const videos = _.map($('div.myui-vodlist__box > a'), item => {
        return {
            vod_id: $(item).attr('href'),
            vod_name: $(item).attr('title'),
            vod_pic: $(item).attr('data-original'),
            vod_remarks: $($(item).find('span.pic-text')).text().trim(),
            vod_year: $($(item).find('span.pic-tag')).text().trim(),
        }
    });
    return JSON.stringify({
        list: videos,
    });
}

async function category(tid, pg, filter, extend) {
    if (pg <= 0 || typeof (pg) == 'undefined') pg = 1;
    const type = extend['type'] ? extend['type'] : tid;
    const area = extend['area'] ? extend['area'] : '';
    const year = extend['year'] ? extend['year'] : '';
    const url = HOST + `/search.php?page=${pg}&searchtype=5&tid=${type}&area=${area}&year=${year}`;
    const $ = load(await request(url));
    const videos = _.map($('div.myui-vodlist__box > a'), item => {
        return {
            vod_id: $(item).attr('href'),
            vod_name: $(item).attr('title'),
            vod_pic: $(item).attr('data-original'),
            vod_remarks: $($(item).find('span.pic-text')).text().trim(),
            vod_year: $($(item).find('span.pic-tag')).text().trim(),
        }
    });
    return JSON.stringify({
        list: videos,
        page: pg,
        limit: 20,
        total: videos.length
    });
}

async function detail(id) {
    const url = HOST + id;
    const $ = load(await request(url));
    let playFroms = [];
    let playUrls = [];
    const playList = $('ul.myui-content__list');
    for(let i=0;i<playList.length;i++) {
        playFroms.push('leospring' + (i+1));

        playUrls.push(_.map($(playList[i]).find('a'), item => {
            return $(item).attr('title') + '$' + $(item).attr('href');
        }).join('#'))
    }
    const vod = {
        vod_id: id,
        vod_actor: _.map($('div.myui-content__detail > p:nth-child(5) > a'), item => $(item).text()).join(' '),
        vod_play_from: playFroms.join('$$$'),
        vod_play_url: playUrls.join('$$$'),
        vod_content: '该影视由leospring采集分享，公众号【蚂蚁科技杂谈】，请勿传播分享，仅供技术学习使用，请在学习后24小时内删除；由此产生的任何法律风险自行承担，与本作者无关！' + $('div.myui-panel-box > p.text-muted:nth-child(1)').text(),
    }
    return JSON.stringify({
        list: [vod],
    });
}

async function play(flag, id, flags) {
    const url = HOST + id;
    const $ = load(await request(url));
    const encUrl = $('script:contains(var now=)').html().split('var now="')[1].split('";')[0].split('|')[0];
    if(encUrl.endsWith('.mp4')) {
        return JSON.stringify({
            parse: 0,
            url: 'https://v.damoli.pro/v/' + encUrl,
            header: {
                'User-Agent': MOBILE_UA,
                'Referer': HOST,
            },
        });
    }
    let parseUrl = HOST + '/api/webvideo_ty.php?url=' + encUrl + '&type=json';
        if(encUrl.length === 32) {
        parseUrl = HOST + '/api/webvideo.php?url=' + encUrl + '&type=json';
    }
    //console.log('parseUrl', parseUrl);
    const encData = JSON.parse(await request(parseUrl)).url;
    const realUrl = DecryptUrl(encData);
    return JSON.stringify({
        parse: 0,
        url: realUrl,
    });
}

function DecryptUrl(encData) {
    const b64Data = base64Decode(encData);
    //console.log('b64Data', b64Data);
    let url = '';
    for(let i=0;i<b64Data.length;i++){
        let idx = i % 8;
        url += String.fromCharCode(b64Data.charCodeAt(i) ^ 'ItLdg666'.charCodeAt(idx));
    }
    //console.log('url', url);
    return base64Decode(url);
}

function base64Decode(text) {
    return Crypto.enc.Utf8.stringify(Crypto.enc.Base64.parse(text));
}

async function search(wd, quick) {
    let url = HOST + '/search.php?searchword=' + wd;
    const $ = load(await request(url));
    const videos = _.map($('div > a.myui-vodlist__thumb'), item => {
        return {
            vod_id: $(item).attr('href'),
            vod_name: $(item).attr('title'),
            vod_pic: $(item).attr('data-original'),
            vod_remarks: $($(item).find('span.pic-text')).text().trim(),
            vod_year: $($(item).find('span.pic-tag')).text().trim(),
        }
    });
    return JSON.stringify({
        list: videos,
        limit: 50,
    });
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