import { Crypto, load, _ } from './lib/cat.js';

let siteUrl = 'https://www.voflix.me';
let siteKey = '';
let siteType = 0;
let headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Referer': siteUrl + '/'
};

async function request(reqUrl, postData, get) {

    let res = await req(reqUrl, {
        method: get ? 'get' : 'post',
        headers: headers,
        data: postData || {},
        postType: get ? '' : 'form',
    });

    let content = res.content;
    return content;
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
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
    let url = siteUrl + '/label/new.html';
    let videos = await getVideos(url);
    return JSON.stringify({
        list: videos,
    });
}

async function category(tid, pg, filter, extend) {
    if (!pg) pg = 1;
    if (pg <= 0) pg = 1;
    let url = siteUrl + '/show/' + tid + '-';
    if(extend['area'] && extend['area'].length > 0) {
        url += extend['area'];
    }
    url += '-';
    if(extend['by'] && extend['by'].length > 0) {
        url += extend['by'];
    }
    url += '-';
    if(extend['class'] && extend['class'].length > 0) {
        url += extend['class'];
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

        let playFroms = _.map($('div.module-tab-item.tab-item > span'), (n) => {
            return $(n).text();
        });
        let playUrls = _.map($('div.module-play-list-content'), (n) => {
            let nameUrl = '';
            //console.log('a', $(n).find('a'));
            for(const m of $(n).find('a')) {
                if (nameUrl.length >0) nameUrl += '#';
                nameUrl += $($(m).find('span')).text() + '$' + $(m).attr('href');
            }
            return nameUrl;
        })

        let content = $('div.module-info-introduction-content > p').text();
        let director = _.map($('div.module-info-items > div:nth-child(2) > div > a'), (n) => {
            return $(n).text();
        }).join(' ');
        let actor = _.map($('div.module-info-items > div:nth-child(3) > div > a'), (n) => {
            return $(n).text();
        }).join(' ');
        const video = {
            vod_play_from: playFroms.join('$$$'),
            vod_play_url: playUrls.join('$$$'),
            vod_content: content,
            vod_director: director,
            vod_actor: actor,
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
    let data = JSON.parse(await getVideos(url));
    let videos = _.map(data, vod => {
        return {
            vod_id: vod.id,
            vod_name: vod.name,
            vod_pic: vod.pic,
            vod_remarks: '',
        };
    });
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
        '1': [{'key': 'cateId', 'name': '类型', 'value': [{'n': '全部类型', 'v': '1'}, {'n': '动作', 'v': '6'}, {'n': '喜剧', 'v': '7'}, {'n': '爱情', 'v': '8'}, {'n': '科幻', 'v': '9'}, {'n': '恐怖', 'v': '10'}, {'n': '剧情', 'v': '11'}, {'n': '战争', 'v': '12'}, {'n': '动画', 'v': '23'}]}, {'key': 'class', 'name': '剧情', 'value': [{'n': '全部剧情', 'v': ''}, {'n': '喜剧', 'v': '喜剧'}, {'n': '爱情', 'v': '爱情'}, {'n': '恐怖', 'v': '恐怖'}, {'n': '动作', 'v': '动作'}, {'n': '科幻', 'v': '科幻'}, {'n': '剧情', 'v': '剧情'}, {'n': '战争', 'v': '战争'}, {'n': '警匪', 'v': '警匪'}, {'n': '犯罪', 'v': '犯罪'}, {'n': '动画', 'v': '动画'}, {'n': '奇幻', 'v': '奇幻'}, {'n': '武侠', 'v': '武侠'}, {'n': '冒险', 'v': '冒险'}, {'n': '枪战', 'v': '枪战'}, {'n': '恐怖', 'v': '恐怖'}, {'n': '悬疑', 'v': '悬疑'}, {'n': '惊悚', 'v': '惊悚'}, {'n': '经典', 'v': '经典'}, {'n': '青春', 'v': '青春'}, {'n': '文艺', 'v': '文艺'}, {'n': '微电影', 'v': '微电影'}, {'n': '古装', 'v': '古装'}, {'n': '历史', 'v': '历史'}, {'n': '运动', 'v': '运动'}, {'n': '农村', 'v': '农村'}, {'n': '儿童', 'v': '儿童'}, {'n': '网络电影', 'v': '网络电影'}]}, {'key': 'area', 'name': '地区', 'value': [{'n': '全部地区', 'v': ''}, {'n': '中国大陆', 'v': '中国大陆'}, {'n': '中国香港', 'v': '中国香港'}, {'n': '中国台湾', 'v': '中国台湾'}, {'n': '美国', 'v': '美国'}, {'n': '法国', 'v': '法国'}, {'n': '英国', 'v': '英国'}, {'n': '日本', 'v': '日本'}, {'n': '韩国', 'v': '韩国'}, {'n': '德国', 'v': '德国'}, {'n': '泰国', 'v': '泰国'}, {'n': '印度', 'v': '印度'}, {'n': '意大利', 'v': '意大利'}, {'n': '西班牙', 'v': '西班牙'}, {'n': '加拿大', 'v': '加拿大'}, {'n': '其他', 'v': '其他'}]}, {'key': 'year', 'name': '年份', 'value': [{'n': '全部年份', 'v': ''}, {'n': '2023', 'v': '2023'}, {'n': '2022', 'v': '2022'}, {'n': '2021', 'v': '2021'}, {'n': '2020', 'v': '2020'}, {'n': '2019', 'v': '2019'}, {'n': '2018', 'v': '2018'}, {'n': '2017', 'v': '2017'}, {'n': '2016', 'v': '2016'}, {'n': '2015', 'v': '2015'}, {'n': '2014', 'v': '2014'}, {'n': '2013', 'v': '2013'}, {'n': '2012', 'v': '2012'}, {'n': '2011', 'v': '2011'}, {'n': '2010', 'v': '2010'}]}, {'key': 'by', 'name': '排序', 'value': [{'n': '时间', 'v': 'time'}, {'n': '人气', 'v': 'hits'}, {'n': '评分', 'v': 'score'}]}], 
        '2': [{'key': 'cateId', 'name': '类型', 'value': [{'n': '全部类型', 'v': '2'}, {'n': '国产剧', 'v': '13'}, {'n': '港台剧', 'v': '14'}, {'n': '日韩剧', 'v': '15'}, {'n': '欧美剧', 'v': '16'}, {'n': '纪录片', 'v': '21'}, {'n': '泰国剧', 'v': '24'}]}, {'key': 'class', 'name': '剧情', 'value': [{'n': '全部剧情', 'v': ''}, {'n': '古装', 'v': '古装'}, {'n': '战争', 'v': '战争'}, {'n': '青春偶像', 'v': '青春偶像'}, {'n': '喜剧', 'v': '喜剧'}, {'n': '家庭', 'v': '家庭'}, {'n': '犯罪', 'v': '犯罪'}, {'n': '动作', 'v': '动作'}, {'n': '奇幻', 'v': '奇幻'}, {'n': '剧情', 'v': '剧情'}, {'n': '历史', 'v': '历史'}, {'n': '经典', 'v': '经典'}, {'n': '乡村', 'v': '乡村'}, {'n': '情景', 'v': '情景'}, {'n': '商战', 'v': '商战'}, {'n': '网剧', 'v': '网剧'}, {'n': '其他', 'v': '其他'}]}, {'key': 'area', 'name': '地区', 'value': [{'n': '全部地区', 'v': ''}, {'n': '中国大陆', 'v': '中国大陆'}, {'n': '中国台湾', 'v': '中国台湾'}, {'n': '中国香港', 'v': '中国香港'}, {'n': '韩国', 'v': '韩国'}, {'n': '日本', 'v': '日本'}, {'n': '美国', 'v': '美国'}, {'n': '泰国', 'v': '泰国'}, {'n': '英国', 'v': '英国'}, {'n': '新加坡', 'v': '新加坡'}, {'n': '其他', 'v': '其他'}]}, {'key': 'year', 'name': '年份', 'value': [{'n': '全部年份', 'v': ''}, {'n': '2023', 'v': '2023'}, {'n': '2022', 'v': '2022'}, {'n': '2021', 'v': '2021'}, {'n': '2020', 'v': '2020'}, {'n': '2019', 'v': '2019'}, {'n': '2018', 'v': '2018'}, {'n': '2017', 'v': '2017'}, {'n': '2016', 'v': '2016'}, {'n': '2015', 'v': '2015'}, {'n': '2014', 'v': '2014'}, {'n': '2013', 'v': '2013'}, {'n': '2012', 'v': '2012'}, {'n': '2011', 'v': '2011'}, {'n': '2010', 'v': '2010'}, {'n': '2009', 'v': '2009'}, {'n': '2008', 'v': '2008'}, {'n': '2006', 'v': '2006'}, {'n': '2005', 'v': '2005'}, {'n': '2004', 'v': '2004'}]}, {'key': 'by', 'name': '排序', 'value': [{'n': '时间', 'v': 'time'}, {'n': '人气', 'v': 'hits'}, {'n': '评分', 'v': 'score'}]}], 
        '4': [{'key': 'class', 'name': '剧情', 'value': [{'n': '全部剧情', 'v': ''}, {'n': '情感', 'v': '情感'}, {'n': '科幻', 'v': '科幻'}, {'n': '热血', 'v': '热血'}, {'n': '推理', 'v': '推理'}, {'n': '搞笑', 'v': '搞笑'}, {'n': '冒险', 'v': '冒险'}, {'n': '萝莉', 'v': '萝莉'}, {'n': '校园', 'v': '校园'}, {'n': '动作', 'v': '动作'}, {'n': '机战', 'v': '机战'}, {'n': '运动', 'v': '运动'}, {'n': '战争', 'v': '战争'}, {'n': '少年', 'v': '少年'}, {'n': '少女', 'v': '少女'}, {'n': '社会', 'v': '社会'}, {'n': '原创', 'v': '原创'}, {'n': '亲子', 'v': '亲子'}, {'n': '益智', 'v': '益智'}, {'n': '励志', 'v': '励志'}, {'n': '其他', 'v': '其他'}]}, {'key': 'area', 'name': '地区', 'value': [{'n': '全部地区', 'v': ''}, {'n': '中国', 'v': '中国'}, {'n': '日本', 'v': '日本'}, {'n': '欧美', 'v': '欧美'}, {'n': '其他', 'v': '其他'}]}, {'key': 'year', 'name': '年份', 'value': [{'n': '全部年份', 'v': ''}, {'n': '2023', 'v': '2023'}, {'n': '2022', 'v': '2022'}, {'n': '2021', 'v': '2021'}, {'n': '2020', 'v': '2020'}, {'n': '2019', 'v': '2019'}, {'n': '2018', 'v': '2018'}, {'n': '2017', 'v': '2017'}, {'n': '2016', 'v': '2016'}, {'n': '2015', 'v': '2015'}, {'n': '2014', 'v': '2014'}, {'n': '2013', 'v': '2013'}, {'n': '2012', 'v': '2012'}, {'n': '2011', 'v': '2011'}, {'n': '2010', 'v': '2010'}, {'n': '2009', 'v': '2009'}, {'n': '2008', 'v': '2008'}, {'n': '2007', 'v': '2007'}, {'n': '2006', 'v': '2006'}, {'n': '2005', 'v': '2005'}, {'n': '2004', 'v': '2004'}]}, {'key': 'by', 'name': '排序', 'value': [{'n': '时间', 'v': 'time'}, {'n': '人气', 'v': 'hits'}, {'n': '评分', 'v': 'score'}]}], 
        '3': [{'key': 'class', 'name': '剧情', 'value': [{'n': '全部剧情', 'v': ''}, {'n': '选秀', 'v': '选秀'}, {'n': '情感', 'v': '情感'}, {'n': '访谈', 'v': '访谈'}, {'n': '播报', 'v': '播报'}, {'n': '旅游', 'v': '旅游'}, {'n': '音乐', 'v': '音乐'}, {'n': '美食', 'v': '美食'}, {'n': '纪实', 'v': '纪实'}, {'n': '曲艺', 'v': '曲艺'}, {'n': '生活', 'v': '生活'}, {'n': '游戏互动', 'v': '游戏互动'}, {'n': '财经', 'v': '财经'}, {'n': '求职', 'v': '求职'}]}, {'key': 'area', 'name': '地区', 'value': [{'n': '全部地区', 'v': ''}, {'n': '内地', 'v': '内地'}, {'n': '港台', 'v': '港台'}, {'n': '日韩', 'v': '日韩'}, {'n': '欧美', 'v': '欧美'}]}, {'key': 'year', 'name': '年份', 'value': [{'n': '全部年份', 'v': ''}, {'n': '2023', 'v': '2023'}, {'n': '2022', 'v': '2022'}, {'n': '2021', 'v': '2021'}, {'n': '2020', 'v': '2020'}, {'n': '2019', 'v': '2019'}, {'n': '2018', 'v': '2018'}, {'n': '2017', 'v': '2017'}, {'n': '2016', 'v': '2016'}, {'n': '2015', 'v': '2015'}, {'n': '2014', 'v': '2014'}, {'n': '2013', 'v': '2013'}, {'n': '2012', 'v': '2012'}, {'n': '2011', 'v': '2011'}, {'n': '2010', 'v': '2010'}, {'n': '2009', 'v': '2009'}, {'n': '2008', 'v': '2008'}, {'n': '2007', 'v': '2007'}, {'n': '2006', 'v': '2006'}, {'n': '2005', 'v': '2005'}, {'n': '2004', 'v': '2004'}]}, {'key': 'by', 'name': '排序', 'value': [{'n': '时间', 'v': 'time'}, {'n': '人气', 'v': 'hits'}, {'n': '评分', 'v': 'score'}]}]
    };
}

async function getVideos(url) {
    const html = await request(url);
    const $ = load(html);
    const cards = $('a.module-poster-item.module-item')
    let videos = _.map(cards, (n) => {
        let id = n.attribs['href'];
        let name = n.attribs['title'];
        let pic = $($(n).find('img')[0]).attr('data-original');
        let remarks = $($(n).find('div.module-item-note')[0]).text().trim();
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