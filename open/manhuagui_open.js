import { Crypto, _, load } from './lib/cat.js';
import { LZString } from './lib/lz_string.js';

let key = 'manhuagui';
let HOST = 'https://www.manhuagui.com';

let siteKey = '';
let siteType = 0;

let prefixMap = {};
const VOLUME_KEY_TELECOM = 'tel';
const VOLUME_KEY_TELECOM1 = 'tel2';
const VOLUME_KEY_UNICOM = 'uni';
const VOLUME_KEY_UNICOM1 = 'uni1';
const VOLUME_KEY_UNICOM2 = 'uni2';
const VOLUME_KEY_UNICOM3 = 'uni3';

const PC_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36';

async function request(reqUrl) {
    let resp = await req(reqUrl, {
        headers: {
            'User-Agent': PC_UA,
        },
    });
    return resp.content;
}

// cfg = {skey: siteKey, ext: extend}
async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;

    initKeys();

    String.prototype.splic = function(f) {
        const data = LZString.decompressFromBase64(this);
        return data.split(f);
    }
}

function initKeys() {
    prefixMap[VOLUME_KEY_TELECOM] = {
        key: 'eu',
        name: '电信',
    };
    prefixMap[VOLUME_KEY_TELECOM1] = {
        key: 'eu1',
        name: '电信1',
    };
    prefixMap[VOLUME_KEY_UNICOM] = {
        key: 'us',
        name: '联通',
    };
    prefixMap[VOLUME_KEY_UNICOM1] = {
        key: 'us1',
        name: '联通1',
    };
    prefixMap[VOLUME_KEY_UNICOM2] = {
        key: 'us2',
        name: '联通2',
    };
    prefixMap[VOLUME_KEY_UNICOM3] = {
        key: 'us3',
        name: '联通3',
    };
}

async function home(filter) {
    const classes = [{'type_id':'all','type_name':'漫画大全'}];
    const filterObj = {
        'all':[{'key':'area','name':'地区','init':'','value':[{'n':'全部','v':''},{'n':'日本','v':'japan'},{'n':'港台','v':'hongkon'},{'n':'其它','v':'other'},{'n':'欧美','v':'europe'},{'n':'内地','v':'china'},{'n':'韩国','v':'korea'}]},{'key':'genre','name':'剧情','init':'','value':[{'n':'全部','v':''},{'n':'热血','v':'rexue'},{'n':'冒险','v':'maoxian'},{'n':'魔幻','v':'mohuan'},{'n':'神鬼','v':'shengui'},{'n':'搞笑','v':'gaoxiao'},{'n':'萌系','v':'mengxi'},{'n':'爱情','v':'aiqing'},{'n':'科幻','v':'kehuan'},{'n':'魔法','v':'mofa'},{'n':'格斗','v':'gedou'},{'n':'武侠','v':'wuxia'},{'n':'机战','v':'jizhan'},{'n':'战争','v':'zhanzheng'},{'n':'竞技','v':'jingji'},{'n':'体育','v':'tiyu'},{'n':'校园','v':'xiaoyuan'},{'n':'生活','v':'shenghuo'},{'n':'励志','v':'lizhi'},{'n':'历史','v':'lishi'},{'n':'伪娘','v':'weiniang'},{'n':'宅男','v':'zhainan'},{'n':'腐女','v':'funv'},{'n':'耽美','v':'danmei'},{'n':'百合','v':'baihe'},{'n':'后宫','v':'hougong'},{'n':'治愈','v':'zhiyu'},{'n':'美食','v':'meishi'},{'n':'推理','v':'tuili'},{'n':'悬疑','v':'xuanyi'},{'n':'恐怖','v':'kongbu'},{'n':'四格','v':'sige'},{'n':'职场','v':'zhichan'},{'n':'侦探','v':'zhentan'},{'n':'社会','v':'shehui'},{'n':'音乐','v':'yinyue'},{'n':'舞蹈','v':'wudao'},{'n':'杂志','v':'zazhi'},{'n':'黑道','v':'heidao'}]},{'key':'age','name':'受众','init':'','value':[{'n':'全部','v':''},{'n':'少女','v':'shaonv'},{'n':'少年','v':'shaonian'},{'n':'青年','v':'qingnian'},{'n':'儿童','v':'ertong'},{'n':'通用','v':'tongyong'}]},{'key':'year','name':'年份','init':'','value':[{'n':'全部','v':''},{'n':'2024年','v':'2024'},{'n':'2023年','v':'2023'},{'n':'2022年','v':'2022'},{'n':'2021年','v':'2021'},{'n':'2020年','v':'2020'},{'n':'2019年','v':'2019'},{'n':'2018年','v':'2018'},{'n':'2017年','v':'2017'},{'n':'2016年','v':'2016'},{'n':'2015年','v':'2015'},{'n':'2014年','v':'2014'},{'n':'2013年','v':'2013'},{'n':'2012年','v':'2012'},{'n':'2011年','v':'2011'},{'n':'2010年','v':'2010'},{'n':'00年代','v':'200x'},{'n':'90年代','v':'199x'},{'n':'80年代','v':'198x'},{'n':'更早','v':'197x'}]},{'key':'letter','name':'字母','init':'','value':[{'n':'全部','v':''},{'n':'A','v':'A'},{'n':'B','v':'B'},{'n':'C','v':'C'},{'n':'D','v':'D'},{'n':'E','v':'E'},{'n':'F','v':'F'},{'n':'G','v':'G'},{'n':'H','v':'H'},{'n':'I','v':'I'},{'n':'J','v':'J'},{'n':'K','v':'K'},{'n':'L','v':'L'},{'n':'M','v':'M'},{'n':'N','v':'N'},{'n':'O','v':'O'},{'n':'P','v':'P'},{'n':'Q','v':'Q'},{'n':'R','v':'R'},{'n':'S','v':'S'},{'n':'T','v':'T'},{'n':'U','v':'U'},{'n':'V','v':'V'},{'n':'W','v':'W'},{'n':'X','v':'X'},{'n':'Y','v':'Y'},{'n':'Z','v':'Z'},{'n':'0-9','v':'0-9'}]},{'key':'status','name':'进度','init':'','value':[{'n':'全部','v':''},{'n':'连载','v':'lianzai'},{'n':'完结','v':'wanjie'}]},{'key':'sort','name':'排序','init':'index','value':[{'n':'最新发布','v':'index'},{'n':'最新更新','v':'update'},{'n':'热气最旺','v':'view'},{'n':'评分最高','v':'rate'}]}],
    };
    return JSON.stringify({
        class: classes,
        filters: filterObj,
    });
}

async function category(tid, pg, filter, extend) {
    if (pg == 0) pg = 1;
    const area = getFilterUrlPart(extend, 'area');
    const genre = getFilterUrlPart(extend, 'genre');
    const age = getFilterUrlPart(extend, 'age');
    const year = getFilterUrlPart(extend, 'year');
    const letter = getFilterUrlPart(extend, 'letter');
    const status = getFilterUrlPart(extend, 'status');
    let path1 = `${area}${genre}${age}${year}${letter}${status}`;
    path1 = path1.replace(/_$/, '');
    const sort = getFilterUrlPart(extend, 'sort');
    let path2 = sort;
    if (pg > 1) {
        path2 += `p${pg}`;
    }
    path2 = path2.replace(/_$/, '');
    let path = '';
    if (!_.isEmpty(path1)) {
        path += `/${path1}`;
    }
    if (!_.isEmpty(path2)) {
        path += `/${path2}.html`;
    }
    if (_.isEmpty(path)) {
        path = '/';
    }
    const link = HOST + `/list${path}`;
    const html = await request(link);
    const $ = load(html);
    const list = $('.book-list > #contList > li');
    const books = _.map(list, (item) => {
        const $item = $(item);
        const $cover = $item.find('.bcover');
        const $img = $cover.find('img:first');
        const $remark = $item.find('.updateon em:first');
        let src = $img.attr('src');
        if (_.isEmpty(src)) {
            src = $img.attr('data-src');
        }
        return {
            book_id: $cover.attr('href').replace(/\/comic\/(.*)\//, '$1'),
            book_name: $cover.attr('title'),
            book_pic: 'https:' + src,
            book_remarks: $remark.text(),
        };
    });
    const hasMore = $('.pager-cont a:contains(下一页)').length > 0;
    return {
        page: pg,
        pagecount: hasMore ? pg + 1 : pg,
        list: books,
    };
}

function getFilterUrlPart(extend, part) {
    let result = '';
    if (extend[part]) {
        result = extend[part] + '_';
    }
    return result;
}

async function detail(id) {
    const html = await request(HOST + `/comic/${id}/`);
    const $ = load(html);
    const book = {
        book_name: $('.book-title').text().trim(),
        book_year: $('.detail-list span:contains(出品年代) a').text().trim(),
        book_area: $('.detail-list span:contains(漫画地区) a').text().trim(),
        book_director: $('.detail-list span:contains(漫画作者) a').text().trim(),
        book_content: $('#intro-all').text().trim(),
    };
    const list = $('.chapter-list a');
    const keys = _.keys(prefixMap);
    const urls = _.map(keys, (key) => {
        const volume = prefixMap[key].key;
        return _.map(list, (item) => {
            const $item = $(item);
            const title = $item.attr('title');
            const href = $item.attr('href');
            return title + '$' + href + '|' + volume;
        }).join('#');
    }).join('$$$');
    const volumes = _.map(keys, (key) => {
        return prefixMap[key].name;
    }).join('$$$');
    book.volumes = volumes;
    book.urls = urls;

    return {
        list: [book],
    };
}

async function play(flag, id, flags) {
    try {
        const info = id.split('|');
        const path = info[0];
        const volumeKey = info[1];
        const html = await request(HOST + path);
        const matches = html.match(/\[\"\\x65\\x76\\x61\\x6c\"\]\((.*)\)/);
        const js = 'var result =' + matches[1] + ';result';
        const data = eval(js);
        const configs = data.match(/SMH\.imgData\((.*?)\)/);
        const json = JSON.parse(configs[1]);
        const jsBase = await js2Proxy(true, siteType, siteKey, 'img/', {});
        const content = _.map(json.files, (file) => {
            const playUrl = `https://${volumeKey}.hamreus.com${json.path}${file}?e=${json.sl.e}&m=${json.sl.m}`;
            return jsBase + base64Encode(playUrl);
        });
        return {
            content: content,
        };
    } catch (e) {
        console.debug('error: ' + e);
        return {
            content: '',
        };
    }
}

function base64Encode(text) {
    return Crypto.enc.Base64.stringify(Crypto.enc.Utf8.parse(text));
}

function base64Decode(text) {
    return Crypto.enc.Utf8.stringify(Crypto.enc.Base64.parse(text));
}

async function proxy(segments, headers) {
    const what = segments[0];
    const url = base64Decode(segments[1]);
    if (what == 'img') {
        const resp = await req(url, {
            buffer: 1,
            shared: 1,
            headers: {
                'User-Agent': PC_UA,
                Referer: HOST,
            },
        });
        delete resp.headers['transfer-encoding'];
        if (resp.headers['content-encoding'] == 'gzip') {
            delete resp.headers['content-encoding'];
        }
        return {
            code: resp.code,
            buffer: 3,
            content: resp.content,
            headers: resp.headers,
        };
    }
    return {
        code: 500,
        content: '',
    };
}

async function search(wd, quick, pg) {
    if (pg == 0) pg = 1;
    let page = '';
    if (pg > 1) {
        page = `_p${pg}`;
    }
    const link = HOST + `/s/${encodeURIComponent(wd)}${page}.html`;
    const html = await request(link);
    const $ = load(html);
    const list = $('.book-result li.cf');
    const books = _.map(list, (item) => {
        const $item = $(item);
        const $cover = $item.find('.book-cover');
        const $a = $cover.find('a:first');
        const $img = $cover.find('img:first');
        const $remark = $item.find('.book-score .score-avg strong:first');
        let src = $img.attr('src');
        if (_.isEmpty(src)) {
            src = $img.attr('data-src');
        }
        return {
            book_id: $a.attr('href').replace(/\/comic\/(.*)\//, '$1'),
            book_name: $a.attr('title'),
            book_pic: 'https:' + src,
            book_remarks: $remark.text(),
        };
    });
    const hasMore = $('.pager-cont a:contains(下一页)').length > 0;
    return {
        page: pg,
        pagecount: hasMore ? pg + 1 : pg,
        list: books,
    };
}

export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        category: category,
        detail: detail,
        play: play,
        proxy: proxy,
        search: search,
    };
}
