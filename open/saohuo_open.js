import { load, _ } from 'assets://js/lib/cat.js';
//发布地址：http://shapp.us/
let key = 'saohuo';
let HOST = 'https://saohuo.tv';
let PARSE_URL = 'https://hhjx.hhplayer.com/api.php';
var charStr = 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789';
let COOKIE = 'PHPSESSID=' + randStr(26, true);
let validCheckUrl = '';
let siteKey = '';
let siteType = 0;

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';

async function request(reqUrl, method, data) {
    const res = await req(reqUrl, {
        method: method || 'get',
        headers: {
            'User-Agent': UA,
            'Referer': HOST,
            'Cookie': COOKIE
        },
        data: data,
        postType: method === 'post' ? 'form' : '',
    });
    return res.content;
}

// cfg = {skey: siteKey, ext: extend}
async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
}

async function home(filter) {
    let classes = [{'type_id':'1','type_name':'电影'},{'type_id':'2','type_name':'电视'}];
    let filterObj = {
        '1':[{'key':'class','name':'类型','init':'1','value':[{'n':'全部','v':'1'},{'n':'喜剧','v':'6'},{'n':'爱情','v':'7'},{'n':'恐怖','v':'8'},{'n':'动作','v':'9'},{'n':'科幻','v':'10'},{'n':'战争','v':'11'},{'n':'犯罪','v':'12'},{'n':'动画','v':'13'},{'n':'奇幻','v':'14'},{'n':'剧情','v':'15'},{'n':'冒险','v':'16'},{'n':'悬疑','v':'17'},{'n':'惊悚','v':'18'},{'n':'其它','v':'19'}]}],
        '2':[{'key':'class','name':'类型','init':'2','value':[{'n':'全部','v':'2'},{'n':'大陆','v':'20'},{'n':'TVB','v':'21'},{'n':'韩剧','v':'22'},{'n':'美剧','v':'23'},{'n':'日剧','v':'24'},{'n':'英剧','v':'25'},{'n':'台剧','v':'26'},{'n':'其它','v':'27'}]}],
       };

    return JSON.stringify({
        class: classes,
        filters: filterObj,
    });
}

async function homeVod() {
    const videos = await getVideos(HOST);
    return JSON.stringify({
        list: videos,
    })
}

async function category(tid, pg, filter, extend) {
    if (pg <= 0) pg = 1;
    const clazz = extend['class'] || tid;
    const link = HOST + `/list/${clazz}-${pg}.html`;
    const videos = await getVideos(link);
    return JSON.stringify({
        page: parseInt(pg),
        list: videos,
    });
}

async function detail(id) {
    const html = await request(HOST + id);
    const $ = load(html);
    const parseUrl = $('iframe').attr('src');
    const remarks = $('section.grid_box.v_info_box > p').text().split('/');
    const playFroms = _.map($('ul.from_list > li'), item => {
        return $(item).text();
    }).join('$$$');
    const playUrls = _.map($('ul#play_link > li'), list => {
        return _.map($(list).find('a'), item => {
            return $(item).text() + '$' + $(item).attr('href');
        }).join('#');
    }).join('$$$');

    const vod = {
        vod_id: id,
        vod_name: $('h1.v_title').text(),
        vod_director: remarks[remarks.length-2].replace('导演：', '').trim(),
        vod_actor: remarks[remarks.length-1].replace('主演：', '').trim(),
        vod_content: '该影视由leospring采集分享，公众号【蹲街捏蚂蚁】，请勿传播分享，仅供技术学习使用，请在学习后24小时内删除；由此产生的任何法律风险自行承担，与本作者无关！' + $('p.p_txt.show_part').text(),
        vod_play_from: playFroms,
        vod_play_url: playUrls,
    };
    
    return JSON.stringify({
        list: [vod],
    });
}

async function play(flag, id, flags) {
    const html = await request(HOST + id);
    const $ = load(html);
    const parseUrl = $('iframe').attr('src');
    const url = await getRealUrl(parseUrl);
    return JSON.stringify({
        parse: 0,
        url: url,
    });
}

async function search(wd, quick, pg) {
    try {
        let page = pg || 1;
        if (page == 0) page = 1;
        let searchURL = `${HOST}/search.php?searchword=${encodeURIComponent(wd)}`;
        let html = await request(searchURL);
        if (html.includes("请输入正确的验证码继续访问")) {
            for (let i = 0; i < 2; i++) {
                html = await validCode(`${HOST}/include/vdimgck.php`, wd);
                if (!html.includes("请输入正确的验证码继续访问")) {
                break;
                }
            }
        }
        //console.log('html', html);
        const $ = load(html);
        const items = $('ul.v_list > li > div');
        let videos = _.map(items, (it) => {
            const img = $(it).find('img:first')[0];
            const remarks = $(it).find('div.v_note').text().trim();
            return {
                vod_id: $(it).find('a:first')[0].attribs['href'],
                vod_name: $(it).find('a:first')[0].attribs.title,
                vod_pic: img.attribs['data-original'],
                vod_remarks: remarks || '',
            };
        });
        return JSON.stringify({
            list: videos,
        });
    } catch (err) {

    }
}

async function getVideos(link) {
    const html = await request(link);
    const $ = load(html);
    const items = $('ul.v_list > li > div');
    let videos = _.map(items, (it) => {
        const img = $(it).find('img:first')[0];
        const remarks = $(it).find('div.v_note').text().trim();
        return {
            vod_id: $(it).find('a:first')[0].attribs['href'],
            vod_name: $(it).find('a:first')[0].attribs.title,
            vod_pic: img.attribs['data-original'],
            vod_remarks: remarks || '',
        };
    });
    return videos;
}

async function getRealUrl(link) {
    const html = await request(link);
    // const rand =  response.match(/<iframe src="(.*?)"/);
    const url = html.match(/var url = "(.*?)";/)[1];
    const t = html.match(/var t = "(.*?)";/)[1];
    const key = html.match(/var key = "(.*?)";/)[1];
    const act = html.match(/var act = "(.*?)";/)[1];
    const play = html.match(/var play = "(.*?)";/)[1];
    const res = await req(PARSE_URL, {
        method: 'post',
        headers: {
            'User-Agent': UA,
            'Referer': link,
        },
        data: {
            url,
            t,
            key,
            act,
            play,   
        },
        postType: 'form',
    });
    const video = JSON.parse(res.content);
    let playUrl = video.url;
    if(playUrl.startsWith('/')) playUrl = 'https://hhjx.hhplayer.com' + playUrl;
    return playUrl;
}

async function validCode(url, wd) {
    try {
        //获取验证码的base64
        const res = await req(url, {
            buffer: 2,
            headers: {
                'User-Agent': UA,
                'Referer': HOST,
                'Cookie': COOKIE
            }
        });
        const response = await req('https://api.nn.ci/ocr/b64/text', {
          method: 'post',
          data: res.content,
          headers: {
            'Content-Type': 'text/plain',
          },
        });
        if(response['code'] === 200) {
            let checkRes = await request(`${HOST}/search.php?scheckAC=check&page=&searchtype=&order=&tid=&area=&year=&letter=&yuyan=&state=&money=&ver=&jq`, 'post', {
                validate: response.content,
                searchword: wd
            });
            return checkRes;
        }
      } catch (error) {
        console.error(error);
      }
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
