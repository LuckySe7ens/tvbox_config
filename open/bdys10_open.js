import { Crypto, load, _, html } from './lib/cat.js';

//let siteUrl ='https://www.yjys01.com';
let siteUrl = 'https://www.xlys01.com';
let siteKey = '';
let siteType = 0;
let headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    'Referer': siteUrl + '/'
};

async function request(reqUrl, postData, post) {

    let res = await req(reqUrl, {
        method: post ? 'post' : 'get',
        headers: headers,
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
        type_id: '0',
        type_name: '电影',
    },{
        type_id: '1',
        type_name: '剧集'}];
    let filterObj = await genFilterObj();
    return JSON.stringify({
        class: classes,
        filters: filterObj
    });
}

async function homeVod() {
}

async function category(tid, pg, filter, ext) {
    if (!pg) pg = 1;
    if (pg <= 0) pg = 1;

    let type = ext['type'];
    let year = ext['year'];
    let area = ext['area'];
    let url = `${siteUrl}${type}/${pg}?type=${tid}`;
    if (area) {
        url = url + '&area=' + area;
    }
    if(year) {
        url = url + '&year=' + year;
    }
    
    let videos = await getVideos(url);
    return JSON.stringify({
        list: videos,
        page: pg,
    });
}

async function detail(id) {
    try {
        const html = await request(siteUrl + id);
        let $ = load(html);
        let content = '该影视由leospring采集分享，公众号【蚂蚁科技杂谈】，请勿传播分享，仅供技术学习使用，请在学习后24小时内删除；由此产生的任何法律风险自行承担，与本作者无关！' + $('#synopsis > div.card-body').text();
        let director = _.map($('div.col.mb-2 > p:nth-child(2) > a'), (n) => {
            return $(n).text();
        }).join(' ');
        let actor = _.map($('div.col.mb-2 > p:nth-child(4) > a'), (n) => {
            return $(n).text();
        }).join(' ');
        const playNameUrls = _.map($('#play-list > div > a'), item => {
            return $(item).text() + '$' + $(item).attr('href').split(';')[0];
        }).join('#');

        const downloadList = _.map($('#download-list > tr'), item => {
            return $($(item).find('td')[1]).text() + '$'+ $($(item).find('td:nth-child(3) > a')[0]).attr('href').split(';')[0];
        }).join('#');

        const torrentList = _.map($('#torrent-list > ul > li > div > div > a'), item => {
            return $(item).attr('download') + '$' + $(item).attr('href').split(';')[0];
        }).join('#');
        
        const video = {
            vod_play_from: '直链$$$磁力',
            vod_play_url: playNameUrls + '$$$' + downloadList,
            vod_content: content,
            vod_director: director,
            vod_actor: actor,
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
    // let url = siteUrl + '/index.php?m=vod-search';
    // const html = await request(url, {wd: wd}, true);
    // const $ = load(html);
    // let data = $('#data_list > li');
    // let videos = _.map(data, (n) => {
    //     let id = $($(n).find('div.pic > a')[0]).attr('href');
    //     let pic = $($(n).find('div.pic > a > img')[0]).attr('data-src');
    //     let name = $($(n).find(' span.sTit')[0]).text();
    //     return {
    //         vod_id: id,
    //         vod_name: name,
    //         vod_pic: pic,
    //         vod_remarks: '',
    //     };
    // });
    // return JSON.stringify({
    //     list: videos,
    // });
}

async function play(flag, id, flags) {
    if(id.endsWith('.torrent')) {
        return JSON.stringify({
            parse: 0,
            url: siteUrl + id,
        });
    }

    if(id.startsWith('ed2k://') || id.startsWith('magnet:')) {
        return JSON.stringify({
            parse: 0,
            url: id,
        });
    }


    let playUrl = siteUrl + id;
    const html = await request(playUrl);
    const $ = load(html);
    let pid='176078';
    for(const n of $('script')) {
        if($(n).text().indexOf("var pid = ") >= 0) {
            pid = $(n).text().split("var pid = ")[1].split(";")[0];
        }
    }
    //console.log('pid', pid);
    let dt = new Date().getTime();
    //dt = 1709977071948;
    //2ed1ccdea49c0fa7e1af0f8507378f0a
    //2ed1ccdea49c0fa7e1af0f8507378f0a
    let md5Data = Crypto.MD5(pid + '-' + dt).toString().toLowerCase();
    //console.log('md5', md5Data);
    let key = Crypto.enc.Utf8.parse(md5Data.substring(0, 16));
    //console.log('key', key);
    let encData = Crypto.AES.encrypt(pid + '-' + dt, key, {
        mode: Crypto.mode.ECB,
        padding: Crypto.pad.Pkcs7
    });
    //"+OvtZJce3mznh0+NjhWgl4Nv6KAPToTft1c01+nUYi4="
    //C0ERRC3eRyA5Q/LbZ6sGyv3K1vxT8EPOIXIqWk8XZEw=
    //console.log(encData + '');
    let sg = encData.ciphertext.toString(Crypto.enc.Hex).toUpperCase();
    //console.log('sg', sg);
    let url = `${siteUrl}/lines?t=${dt}&sg=${sg}&pid=${pid}`;
    //console.log('url', url);
    let res = await req(url, {
        method: 'get',
        headers: headers,
    })
    playUrl = JSON.parse(res.content).data.url3.split(',')[0];
    //console.log('url', res.content);
    return JSON.stringify({
        parse: 0,
        url: playUrl,
    });
    return JSON.stringify({
        parse: 1,
        url: playUrl,
    });
}

function base64Decode(text) {
    return Crypto.enc.Utf8.stringify(Crypto.enc.Base64.parse(text));
}

async function genFilterObj() {
    const url = siteUrl + '/s/all';
    const html = await request(url);
    const $ = load(html);
    let types = _.map($('dl:nth-child(2) > dd > a'), item => {
        return {
            'v': $(item).attr('href').split(';')[0],
            'n': $(item).text(),
        }
    });
    let areas = _.map($('dl:nth-child(3) > dd > a'), item => {
        return {
            'n': $(item).text(),
            'v': $(item).text().replace('不限',''),
        }
    });
    let years = _.map($('dl:nth-child(4) > dd > a'), item => {
        return {
            'n': $(item).text(),
            'v': $(item).text().replace('不限',''),
        }
    });

    return {
        '0': [{'key': 'type', 'name': '类型', 'init': '/s/all','value': types}, 
            {'key': 'area', 'name': '地区', 'value': areas}, 
            {'key': 'year', 'name': '年份', 'value': years}
        ], 
        '1': [{'key': 'type', 'name': '类型', 'init': '/s/all', 'value': types}, 
            {'key': 'area', 'name': '地区', 'value': areas}, 
            {'key': 'year', 'name': '年份', 'value': years}
        ], 
    };
}

async function getVideos(url) {
    const html = await request(url);
    const $ = load(html);
    const cards = $('div.card.card-sm.card-link')
    let videos = _.map(cards, (n) => {
        let id = $($(n).find('a')[0]).attr('href').split(';')[0];
        let name = $($(n).find('h3')[0]).text();
        let pic = $($(n).find('img')[0]).attr('src');
        let remarks = $($(n).find('span')[0]).text().trim();
        return {
            vod_id: id,
            vod_name: name,
            vod_pic: pic,
            vod_remarks: remarks,
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
