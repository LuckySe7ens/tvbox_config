import { Crypto, load, _ } from './lib/cat.js';
// siteUrl = 'http://proxy.liushiquan.eu.org/https://www.libhd.com';
let siteUrl = 'https://www.libhd.com';
let siteKey = '';
let siteType = 0;
let headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Redmi K30 Build/SKQ1.210908.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/96.0.4664.104 Mobile Safari/537.36',
    'Sec-Fetch-Site': 'cross--site',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Dest': 'iframe',
};

async function request(reqUrl, postData, get) {

    let res = await req(reqUrl, {
        method: get ? 'get' : 'post',
        headers: headers,
        data: postData || {},
        postType: get ? '' : 'form',
        timeout: 15000,
    });

    let content = res.content;
    return content;
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    if(cfg['ext']) {
        siteUrl = cfg['ext'];
    }
}

async function home(filter) {
    let classes = [{
        type_id: '1',
        type_name: '电影',
    },{
        type_id: '2',
        type_name: '剧集',
    },{
        type_id: '3',
        type_name: '综艺',
    },{
        type_id: '4',
        type_name: '动漫',
    }];
    let filterObj = genFilterObj();
    return JSON.stringify({
        class: classes,
        filters: filterObj
    });
}

async function homeVod() {
    let videos = await getVideos(siteUrl);
    return JSON.stringify({
        list: videos,
    });
}

async function category(tid, pg, filter, extend) {
    if (!pg) pg = 1;
    if (pg <= 0) pg = 1;
    let url = siteUrl + '/vodshow/' + tid + '-';
    if(extend['area'] && extend['area'].length > 0) {
        url += extend['area'];
    }
    url += '--';
    if(extend['type'] && extend['type'].length > 0) {
        url += extend['type'];
    }
    url += '-----';
    if (pg > 1) {
        url +=  pg;
    }
    url += '---';
    if(extend['year'] && extend['year'].length > 0) {
        url += extend['year'];
    }
    url += '.html';

    let videos = await getVideos(url);
    return JSON.stringify({
        list: videos,
        page: pg,
    });
}

async function detail(id) {
    try {
        const html = await request(siteUrl + id);
        const $ = load(html);

        let content = $('div#height_limit').text();
        let playFroms = [];
        let playUrls = [];
        let tabs = $('a.swiper-slide');
        
        let cards = $('ul.anthology-list-play');
        for(let i=0;i<tabs.length;i++) {
            let tname = $(tabs[i]).text();
            playFroms.push(tname.trim());
            let nameUrls = _.map($(cards[i]).find('li > a'), (n) => {
                return $(n).text() + '$' + $(n).attr('href');
            });
            playUrls.push(nameUrls.join('#'));
        }
        const video = {
            vod_play_from: playFroms.join('$$$'),
            vod_play_url: playUrls.join('$$$'),
            vod_content: content,
        };
        const list = [video];
        const result = { list };
        return JSON.stringify(result);
    } catch (e) {
       //console.log('err', e);
    }
    return null;
}

async function search(wd, quick, pg) {
    let url = siteUrl + '/vodsearch/-------------.html?wd=' + wd;
    let videos = await getVideos(url);
    return JSON.stringify({
        list: videos,
    });
}

async function play(flag, id, flags) {
    let playUrl = siteUrl + id;
    const html = await request(playUrl);
    const $ = load(html);
    for(const n of $('script')) {
        if($(n).text().indexOf('player_aaaa=') > 0) {
            let url = JSON.parse($(n).text().split('player_aaaa=')[1])['url'];
            if(url) {
                playUrl = url;
            }
            if (url.indexOf('libhd') == 0) {
                playUrl = await getTx(url);
            }
            if (url.indexOf('alip.speechless.pw') > 0) {
                playUrl = await getFx(url);
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

function genFilterObj() {
    return {
        '1': [{
            key: 'type',
            name: '类型', 
            value: [{n:'全部',v:''},{n:'喜剧',v:'喜剧'},{n:'爱情',v:'爱情'},{n:'恐怖',v:'恐怖'},{n:'动作',v:'动作'},{n:'科幻',v:'科幻'},{n:'剧情',v:'剧情'},{n:'战争',v:'战争'},{n:'警匪',v:'警匪'},{n:'犯罪',v:'犯罪'},{n:'动画',v:'动画'},{n:'奇幻',v:'奇幻'},{n:'武侠',v:'武侠'},{n:'冒险',v:'冒险'},{n:'枪战',v:'枪战'}]
        },{
            key: 'area',
            name: '地区', 
            value: [{n:'全部',v:''},{n:'大陆',v:'大陆'},{n:'香港',v:'香港'},{n:'台湾',v:'台湾'},{n:'美国',v:'美国'},{n:'法国',v:'法国'},{n:'英国',v:'英国'},{n:'日本',v:'日本'},{n:'韩国',v:'韩国'},{n:'德国',v:'德国'},{n:'泰国',v:'泰国'},{n:'印度',v:'印度'},{n:'意大利',v:'意大利'},{n:'西班牙',v:'西班牙'},{n:'加拿大',v:'加拿大'},{n:'其他',v:'其他'}]
        },{
            key: 'year',
            name: '年份', 
            value: [{n:'全部',v:''},{n:'2024',v:'2024'},{n:'2023',v:'2023'},{n:'2022',v:'2022'},{n:'2021',v:'2021'},{n:'2020',v:'2020'},{n:'2019',v:'2019'},{n:'2018',v:'2018'},{n:'2017',v:'2017'},{n:'2016',v:'2016'},{n:'2015',v:'2015'},{n:'2014',v:'2014'},{n:'2013',v:'2013'},{n:'2012',v:'2012'},{n:'2011',v:'2011'},{n:'2010',v:'2010'}]
        }],
        '2':[{
            key: 'type',
            name: '类型', 
            value: [{n:'全部',v:''},{n:'古装',v:'古装'},{n:'战争',v:'战争'},{n:'青春偶像',v:'青春偶像'},{n:'喜剧',v:'喜剧'},{n:'家庭',v:'家庭'},{n:'犯罪',v:'犯罪'},{n:'动作',v:'动作'},{n:'奇幻',v:'奇幻'},{n:'剧情',v:'剧情'},{n:'历史',v:'历史'},{n:'经典',v:'经典'},{n:'乡村',v:'乡村'},{n:'情景',v:'情景'},{n:'商战',v:'商战'},{n:'网剧',v:'网剧'}]
        },{
            key: 'area',
            name: '地区', 
            value: [{n:'全部',v:''},{n:'内地',v:'内地'},{n:'韩国',v:'韩国'},{n:'香港',v:'香港'},{n:'台湾',v:'台湾'},{n:'日本',v:'日本'},{n:'美国',v:'美国'},{n:'泰国',v:'泰国'},{n:'英国',v:'英国'},{n:'新加坡',v:'新加坡'},{n:'其他',v:'其他'}]
        },{
            key: 'year',
            name: '年份', 
            value: [{n:'全部',v:''},{n:'2024',v:'2024'},{n:'2023',v:'2023'},{n:'2022',v:'2022'},{n:'2021',v:'2021'},{n:'2020',v:'2020'},{n:'2019',v:'2019'},{n:'2018',v:'2018'},{n:'2017',v:'2017'},{n:'2016',v:'2016'},{n:'2015',v:'2015'},{n:'2014',v:'2014'},{n:'2013',v:'2013'},{n:'2012',v:'2012'},{n:'2011',v:'2011'},{n:'2010',v:'2010'}]
        }],
        '3':[{
            key: 'type',
            name: '类型', 
            value: [{n:'全部',v:''},{n:'选秀',v:'选秀'},{n:'情感',v:'情感'},{n:'访谈',v:'访谈'},{n:'播报',v:'播报'},{n:'旅游',v:'旅游'},{n:'音乐',v:'音乐'},{n:'美食',v:'没事'},{n:'纪实',v:'纪实'},{n:'曲艺',v:'曲艺'},{n:'生活',v:'生活'},{n:'游戏互动',v:'游戏互动'},{n:'财经',v:'财经'},{n:'求职',v:'求职'}]
        },{
            key: 'area',
            name: '地区', 
            value: [{n:'全部',v:''},{n:'内地',v:'内地'},{n:'港台',v:'港台'},{n:'日韩',v:'日韩'},{n:'欧美',v:'欧美'}]
        },{
            key: 'year',
            name: '年份', 
            value: [{n:'全部',v:''},{n:'2024',v:'2024'},{n:'2023',v:'2023'},{n:'2022',v:'2022'},{n:'2021',v:'2021'},{n:'2020',v:'2020'},{n:'2019',v:'2019'},{n:'2018',v:'2018'},{n:'2017',v:'2017'},{n:'2016',v:'2016'},{n:'2015',v:'2015'},{n:'2014',v:'2014'},{n:'2013',v:'2013'},{n:'2012',v:'2012'},{n:'2011',v:'2011'},{n:'2010',v:'2010'}]
        }],
        '4':[{
            key: 'type',
            name: '类型', 
            value: [{n:'全部',v:''},{n:'情感',v:'情感'},{n:'科幻',v:'科幻'},{n:'热血',v:'热血'},{n:'推理',v:'推理'},{n:'搞笑',v:'搞笑'},{n:'冒险',v:'冒险'},{n:'萝莉',v:'萝莉'},{n:'校园',v:'校园'},{n:'动作',v:'动作'},{n:'机战',v:'机战'},{n:'运动',v:'运动'},{n:'战争',v:'战争'},{n:'少年',v:'少年'},{n:'少女',v:'少女'},{n:'社会',v:'社会'}]
        },{
            key: 'area',
            name: '地区', 
            value: [{n:'全部',v:''},{n:'国产',v:'国产'},{n:'日本',v:'日本'},{n:'欧美',v:'欧美'},{n:'其他',v:'其他'}]
        },{
            key: 'year',
            name: '年份', 
            value: [{n:'全部',v:''},{n:'2024',v:'2024'},{n:'2023',v:'2023'},{n:'2022',v:'2022'},{n:'2021',v:'2021'},{n:'2020',v:'2020'},{n:'2019',v:'2019'},{n:'2018',v:'2018'},{n:'2017',v:'2017'},{n:'2016',v:'2016'},{n:'2015',v:'2015'},{n:'2014',v:'2014'},{n:'2013',v:'2013'},{n:'2012',v:'2012'},{n:'2011',v:'2011'},{n:'2010',v:'2010'}]
        }],
    };
}

async function getVideos(url) {
    const html = await request(url);
    const $ = load(html);
    const cards = $('div.public-list-bj > a.public-list-exp')
    let videos = _.map(cards, (n) => {
        let id = n.attribs['href'];
        let name = n.attribs['title'] || $($(n).find('img')[0]).attr('alt').replaceAll('封面图', '');
        let pic = $($(n).find('img')[0]).attr('data-src');
        let remarks = $($(n).find('span.public-list-prb')[0]).text().trim();
        return {
            vod_id: id,
            vod_name: name,
            vod_pic: pic,
            vod_remarks: remarks,
        };
    });
    return videos;
}

async function getTx(url) {
    const html = await request(siteUrl + '/play/?url=' + url);
    const $ = load(html);
    for(const n of $('script')) {
        if($(n).text().indexOf('config = ') > 0) {
            let data = JSON.parse($(n).text().split('config = ')[1].split(';')[0]);
            let key = data['key'];
            let time = data['time'];

            const res = await request(siteUrl+'/play/API.php', {'url': url, 'time': time, 'key': key}, false);
            return JSON.parse(res)['url'];
        }
    }
}

async function getFx(url) {
    let res = await req(url, {
        method: 'get',
        headers: headers
    });

    let html = res.content;
    const $ = load(html);
    for(const n of $('script')) {
        if($(n).text().indexOf('result_v2') > 0) {
            let data = JSON.parse($(n).text().split('result_v2 = ')[1].split(';')[0])['data'];
            return getFxUrl(data);
        }
    }
    return url;
}

function getFxUrl(data) {
    let arr = data.split('').reverse();
	let res='';
	for(let i=0;i<arr.length;i = i+2) {
		let s = arr[i] + arr[i+1];
		let idx = parseInt(s, 0x10);
		res += String.fromCharCode(idx);
	}
    let index = (res.length - 0x7) / 0x2;
    let start = res.substring(0x0, index);

    let end = res.substring(index + 0x7);
	return start + end;
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