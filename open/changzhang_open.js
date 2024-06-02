import { Crypto, load, _ } from './lib/cat.js';
/**
 * 厂长资源 发布页：https://cz01.vip/
 * author：Leospring
 * 公众号：蹲街捏蚂蚁
 * 
 */
var charStr = 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789';
let COOKIE = 'PHPSESSID=' + randStr(26, true);
let siteUrl = 'https://czzy.top';
let siteKey = '';
let siteType = 0;
COOKIE = 'PHPSESSID=gbk1aeo1ron2g5bcuasbrbe0a7; cf_clearance=rfmFuox8XopyxGkTd66IrfiBPYPOLQ5nWyY5J7ydhB8-1704875087-0-2-da940062.5bc4175f.8d955f82-150.0.0';
let headers = {
    'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 13_2_3 like Mac OS X) AppleWebKit/537.36  (KHTML, like Gecko) Version/13.0 Mobile/13B14 Safari/537.36',
    'Referer': siteUrl + '/',
    'Cookie': COOKIE
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
        type_id: 'dbtop250',
        type_name: '豆瓣电影Top250',
    },{
        type_id: 'zuixindianying',
        type_name: '最新电影',
    },{
        type_id: 'benyueremen',
        type_name: '热映中',
    },{
        type_id: 'gcj',
        type_name: '国产剧',
    },{
        type_id: 'meijutt',
        type_name: '美剧',
    },{
        type_id: 'hanjutv',
        type_name: '韩剧',
    },{
        type_id: 'fanju',
        type_name: '番剧',
    },{
        type_id: 'dongmanjuchangban',
        type_name: '动漫',
    }];
    return JSON.stringify({
        class: classes,
       // filters: filterObj
    });
}

async function homeVod() {
    let url = siteUrl;
    let videos = await getVideos(url);
    return JSON.stringify({
        list: videos,
    });
}

async function category(tid, pg, filter, ext) {
    if (!pg) pg = 1;
    if (pg <= 0) pg = 1;
    let url = siteUrl + '/' + tid;
    if (pg > 1) url += '/page/' + pg;
    let videos = await getVideos(url);
    return JSON.stringify({
        list: videos,
        page: pg,
    });
}

async function detail(id) {
    try {
        const html = await request(id);
        let $ = load(html);
        let content = $('div.yp_context > p:nth-child(1)').text();
        let type = _.map($('ul.moviedteail_list > li:nth-child(1) > a'), (n) => {
            return $(n).text();
        }).join(' ');
        let area = $('ul.moviedteail_list > li:nth-child(2) > a').text();
        let year = $('ul.moviedteail_list > li:nth-child(3) > a').text();


        let director = _.map($('ul.moviedteail_list > li:nth-child(6) > span'), (n) => {
            return $(n).text();
        }).join(' ');

        let actor = _.map($('ul.moviedteail_list > li:nth-child(8) > span'), (n) => {
            return $(n).text();
        }).join(' ');
        let playUrls =  _.map($('div.paly_list_btn > a'), (n) => {
            return $(n).text() + '$' + $(n).attr('href');
        }).join('#');
        
        const video = {
            vod_play_from: 'Leospring',
            vod_play_url: playUrls,
            vod_content: content,
            vod_director: director,
            vod_actor: actor,
            vod_type: type,
            vod_area: area,
            vod_year: year,
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
    let url = siteUrl + '/xssearch?q=' + wd;
    const html = await request(url);
    if(html.indexOf('人机验证') > 0) {
        const regex = /(\d+\s*\+\s*\d+)/;
        const match = html.match(regex);
        //console.log('match', match);
        if(match) {
            let result = eval(match[1]);
            headers['Referer'] = siteUrl;
            const res = await req(url, {
                method: 'post',
                headers: headers,
                data: {'result': result},
                postType: 'form',
            });
            const $ = load(res.content);
            const cards = $('div.bt_img.mi_ne_kd> ul > li > a')
            let videos = _.map(cards, (n) => {
                let id = $(n).attr('href');
                let name = $($(n).find('img')[0]).attr('alt');
                let pic = $($(n).find('img')[0]).attr('data-original');
                let remarks = $($(n).find('div.jidi > span')[0]).text().trim();
                return {
                    vod_id: id,
                    vod_name: name,
                    vod_pic: pic,
                    vod_remarks: remarks,
                };
            });
            return JSON.stringify({
                list: videos,
            });
        }
    }
    //console.log('html', html);
    //TODO验证码处理
    let videos = await getVideos(url);
    return JSON.stringify({
        list: videos,
    });
}

async function play(flag, id, flags) {
    let playUrl = id;
    const html = await request(playUrl);
    const $ = load(html);

    const iframe = $('div.videoplay > iframe');
    if (iframe.length > 0) {
        const iframeHtml = (
            await req(iframe[0].attribs.src, {
                headers: headers,
            })
        ).content;
        //console.log('iframe', iframeHtml);
        let code = iframeHtml.split('"data":"')[1].split('"')[0]
            .split('')
            .reverse()
            .join('');
        let temp = '';
        for (let i = 0x0; i < code.length; i = i + 0x2) {
            temp += String.fromCharCode(parseInt(code[i] + code[i + 0x1], 0x10));
        }
        const playUrl = temp.substring(0x0, (temp.length - 0x7) / 0x2) + temp.substring((temp.length - 0x7) / 0x2 + 0x7);
        return JSON.stringify({
            parse: 0,
            url: playUrl,
        });
    }

    for(const n of $('script')) {
        if($(n).text().indexOf("md5.enc.Utf8") >= 0) {
            let encryptData = $(n).text().split("\n")[4];
            let strArr = encryptData.split('"');
            let data = strArr[1];
            let keyStr = strArr[3];
            let ivStr = '1234567890983456';
            // console.log('data', data);
            let res = aesDecode(data, keyStr, ivStr);
            //console.log('res', res);
            let url = res.split('url: "')[1].split('"')[0];
            if(url) {
                playUrl = url;
            }
            return JSON.stringify({
                parse: 0,
                url: playUrl,
            });
        }
        
    }
    return JSON.stringify({
        parse: 1,
        url: playUrl,
    });
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

async function getVideos(url) {
    const html = await request(url);
    const $ = load(html);
    const cards = $('div.bt_img.mi_ne_kd> ul > li > a')
    let videos = _.map(cards, (n) => {
        let id = $(n).attr('href');
        let name = $($(n).find('img')[0]).attr('alt');
        let pic = $($(n).find('img')[0]).attr('data-original');
        let remarks = $($(n).find('div.jidi > span')[0]).text().trim();
        return {
            vod_id: id,
            vod_name: name,
            vod_pic: pic,
            vod_remarks: remarks,
        };
    });
    return videos;
}

function randStr(len, withNum) {
    var _str = '';
    let containsNum = withNum === undefined ? true : withNum;
    for (var i = 0; i < len; i++) {
        let idx = _.random(0, containsNum ? charStr.length - 1 : charStr.length - 11);
        _str += charStr[idx];
    }
    return _str;
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
