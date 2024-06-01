import { Crypto, load, _ } from './lib/cat.js';

let siteUrl ='https://www.netflixgc.com';
let siteKey = '';
let siteType = 0;

async function request(reqUrl, postData, post) {
    let res = await req(reqUrl, {
        method: post ? 'post' : 'get',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
            'Referer': 'https://www.netflixgc.com/',
            'Cookie': 'PHPSESSID=74h3p611tq5nkjbucrglrg28dc; ecPopup=1; _funcdn_token=ca318ea4ba70eccba54bc930f0e488f31bee12e114f4dc919faca81f18af3fdb'
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
        type_name: '动漫'
    }];
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
    let clazz = ext['class'];
    let year = ext['year'];
    let area = ext['area'];
    let typeId = ext['type'] || tid;
    let classId = ext['class'] || '';
    let yearId = ext['year'] || '';
    let url = `${siteUrl}/index.php/api/vod`;
    let dt = Math.floor(Date.now() / 1e3);
    let params = {
        type: typeId,
        class: classId,
        area: '',
        lang: '',
        version: '',
        state: '',
        letter:'',
        page: pg,
        time: dt,
        key: Crypto.MD5('DS' + dt + 'DCC147D11943AF75').toString().toLowerCase(),
        year: yearId,
    };
    let res = JSON.parse(await request(url, params, true));
    //console.log('res', res);
    return JSON.stringify({
        list: res.list,
        page: res.page,
        pagecount: res.pagecount,
        total: res.total,
        limit: res.limit,
    });
}

async function detail(id) {
    try {
        const html = await request(siteUrl + `/detail/${id}.html`);
        const $ = load(html);
        const director = _.map($('div.slide-info.hide:nth-child(3) > a'), n => {
            return $(n).text();
        }).join(' ');
        const actor = _.map($('div.slide-info.hide:nth-child(4) > a'), n => {
            return $(n).text();
        }).join(' ');
        const type = _.map($('div.slide-info.hide:nth-child(5) > a'), n => {
            return $(n).text();
        }).join(' ');
        const playFroms = _.map($('a.swiper-slide'), n => {
            return $(n).text().trim();
        }).join('$$$');
        const playUrls = _.map($('div.anthology-list-box.none'), n => {
            return _.map($(n).find('li > a'), item => {
                return $(item).text() + '$' + $(item).attr('href');
            }).join('#');
        }).join('$$$');
        const content = $('div.text.cor3').text();
        const video = {
            vod_play_from: playFroms,
            vod_play_url: playUrls,
            vod_content: 'leospring 公众号【蚂蚁科技杂谈】' + content,
            vod_director: director,
            vod_actor: actor,
            vod_type: type,
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
    let url = siteUrl + `/vodsearch/-------------.html?wd=${wd}`;
    const html = await request(url);
    const $ = load(html);
    const videos = _.map($('a.public-list-exp'), n => {
        return {
            vod_id: $(n).attr('href').replace('/detail/','').replace('.html',''),
            vod_name: $($(n).find('img')).attr('alt').replace('封面图',''),
            vod_pic: $($(n).find('img')).attr('data-src'),
            vod_remarks: $($(n).find('span.public-list-prb')).text(),
        }
    });
    return JSON.stringify({
        list: videos,
    });
}

async function play(flag, id, flags) {
    let url = siteUrl + id;
    const playUrl = await getPlayaaaaUrl(url);
    const realUrl = await getRealUrl(playUrl);
    return JSON.stringify({
        parse: 0,
        url: realUrl,
    });
}

async function getPlayaaaaUrl(url) {
    const html = await request(url);
    const $ = load(html);
    const js = JSON.parse($('script:contains(player_aaaa)').html().replace('var player_aaaa=',''));
    let playUrl = js.url;
    if (js.encrypt == 1) {
        playUrl = unescape(playUrl);
    } else if (js.encrypt == 2) {
        playUrl = unescape(base64Decode(playUrl));
    }
    return playUrl;
}

async function getRealUrl(url) {
    const html = await request('https://cjbfq.netflixgc.com/player/ec.php?code=netflix&if=1&url=' + url, {
        'Referer': 'https://www.netflixgc.com/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        'Upgrade-Insecure-Requests': '1'
    });
    //console.log('html', html);
    const $ = load(html);
    const configData = JSON.parse($('script:contains(ConFig = )').html().replace('let ConFig =', '').replace(',box = $("#player"),lg = ConFig.lg;',''));
    //console.log(configData);

    const encData = configData.url;
    //console.log('encData', encData);
    return aesDecode(encData, '2890' + configData.config.uid + 'tB959C', '2F131BE91247866E');
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

function base64Decode(text) {
    return Crypto.enc.Utf8.stringify(Crypto.enc.Base64.parse(text));
}

function genFilterObj() {
    return {
        '1': [{'key': 'type', 'name': '类型','value': [{n:'全部', v:''},{n:'美影', v: '6'},{n:'韓影',v:'7'},{n:'日影',v:'8'},{n:'英影',v:'9'},{n:'泰影',v:'10'},{n:'歐影',v:'11'},{n:'台影',v:'12'}]}, 
        {'key': 'class', 'name': '地区', 'value': [{n:'全部', v:''},{n:'喜劇', v:'喜剧'},{n:'愛情', v:'爱情'},{n:'恐怖', v:'恐怖'},{n:'動作', v:'动作'},{n:'科幻', v:'科幻'},{n:'劇情', v:'剧情'},{n:'戰争', v:'战争'},{n:'警匪', v:'警匪'},{n:'犯罪', v:'犯罪'},{n:'奇幻', v:'奇幻'},{n:'冒險', v:'冒险'},{n:'槍戰', v:'枪战'},{n:'恐怖', v:'恐怖'},{n:'懸疑', v:'悬疑'},{n:'驚悚', v:'惊悚'},{n:'經典', v:'经典'},{n:'文藝', v:'文艺'},{n:'曆史', v:'历史'}]}, 
            {'key': 'year', 'name': '年份', 'value': [{n:'全部', v:''},{n:'2024', v:'2024'},{n:'2023', v:'2023'},{n:'2022', v:'2022'},{n:'2021', v:'2021'},{n:'2020', v:'2020'},{n:'2019', v:'2019'},{n:'2018', v:'2018'},{n:'2017', v:'2017'},{n:'2016', v:'2016'},{n:'2015', v:'2015'},{n:'2014', v:'2014'}]}
        ],
        '2': [{'key': 'type', 'name': '类型', 'value': [{n:'全部', v:''},{n:'美劇', v: '13'},{n:'韓劇',v:'14'},{n:'日劇',v:'15'},{n:'英劇',v:'16'},{n:'泰劇',v:'20'},{n:'歐劇',v:'21'},{n:'台劇',v:'22'}]}, 
            {'key': 'class', 'name': '地区', 'value': [{n:'全部', v:''},{n:'古裝', v:'古装'},{n:'戰争', v:'战争'},{n:'喜劇', v:'喜剧'},{n:'家庭', v:'家庭'},{n:'犯罪', v:'犯罪'},{n:'動作', v:'动作'},{n:'奇幻', v:'奇幻'},{n:'劇情', v:'剧情'},{n:'曆史', v:'历史'},{n:'經典', v:'经典'},{n:'情景', v:'情景'},{n:'商戰', v:'商战'},{n:'其他', v:'其他'}]}, 
            {'key': 'year', 'name': '年份', 'value': [{n:'全部', v:''},{n:'2024', v:'2024'},{n:'2023', v:'2023'},{n:'2022', v:'2022'},{n:'2021', v:'2021'},{n:'2020', v:'2020'},{n:'2019', v:'2019'},{n:'2018', v:'2018'},{n:'2017', v:'2017'},{n:'2016', v:'2016'},{n:'2015', v:'2015'},{n:'2014', v:'2014'}]}
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