import { Crypto,_} from './lib/cat.js';

let siteUrl = 'http://103.88.35.251:8989';
let siteKey = '';
let siteType = 0;
const PC_UA = 'Dalvik/1.6.0 (Linux; U; Android 12; HUAWEI Build/DCO-AL00)';
let headers = {
    'User-Agent': PC_UA,
    'version': '1.6.0',
};
let keyId = 'aaef983207876d9959f11634db4abfff';
let parseMap = {};

async function request(reqUrl, data, header, method) {
    let res = await req(reqUrl, {
        method: method || 'get',
        data: data || '',
        headers: header || headers,
        postType: method === 'post' ? 'form-data' : '',
        timeout: 30000,
    });
    return res.content;
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    if (cfg.ext) siteUrl = cfg.ext;
    let url = `${siteUrl}/shark/api.php?action=configs`;
  try {
      let rets = await request(url,{},'','POST');
      let data = JSON.parse(aesEcbDecode(rets, 'aassddwwxxllsx1x'));
      keyId = data['config']['hulue'].split('&')[0];
      _.forEach(data['playerinfos'], item => {
	 parseMap[item['playername']] = aesEcbDecode(item['playerjiekou'], keyId);
      });
    } catch(e){
      console.log(e);
    }
  	
}

async function home(filter) {
    const classes = [{'type_id':'1','type_name':'电影'},{'type_id':'2','type_name':'连续剧'},{'type_id':'4','type_name':'动漫'},{'type_id':'3','type_name':'综艺'},{'type_id':'20','type_name':'短剧'}];
    return JSON.stringify({
        'class': [{'type_id':'20','type_name':'连续剧'},{'type_id':'21','type_name':'电影'},{'type_id':'22','type_name':'动漫'},{'type_id':'23','type_name':'综艺'},{'type_id':'24','type_name':'短剧'}],
        'filters': {
            "21":[{"name":"分类","key":"type","value":[{"v":"全部类型","n":"全部类型"},{"v":"喜剧","n":"喜剧"},{"v":"动作","n":"动作"},{"v":"爱情","n":"爱情"},{"v":"惊悚","n":"惊悚"},{"v":"犯罪","n":"犯罪"},{"v":"冒险","n":"冒险"},{"v":"科幻","n":"科幻"},{"v":"悬疑","n":"悬疑"},{"v":"剧情","n":"剧情"},{"v":"动画","n":"动画"},{"v":"武侠","n":"武侠"},{"v":"战争","n":"战争"},{"v":"歌舞","n":"歌舞"},{"v":"奇幻","n":"奇幻"},{"v":"传记","n":"传记"},{"v":"警匪","n":"警匪"},{"v":"历史","n":"历史"},{"v":"运动","n":"运动"},{"v":"伦理","n":"伦理"},{"v":"灾难","n":"灾难"},{"v":"西部","n":"西部"},{"v":"魔幻","n":"魔幻"},{"v":"枪战","n":"枪战"},{"v":"恐怖","n":"恐怖"},{"v":"记录","n":"记录"}]},{"name":"区域","key":"area","value":[{"v":"全部地区","n":"全部地区"},{"v":"大陆","n":"大陆"},{"v":"美国","n":"美国"},{"v":"香港","n":"香港"},{"v":"韩国","n":"韩国"},{"v":"英国","n":"英国"},{"v":"台湾","n":"台湾"},{"v":"日本","n":"日本"},{"v":"法国","n":"法国"},{"v":"意大利","n":"意大利"},{"v":"德国","n":"德国"},{"v":"西班牙","n":"西班牙"},{"v":"泰国","n":"泰国"},{"v":"其它","n":"其它"}]},{"name":"年份","key":"year","value":[{"v":"全部年代","n":"全部年代"},{"v":"2025","n":"2025"},{"v":"2024","n":"2024"},{"v":"2023","n":"2023"},{"v":"2022","n":"2022"},{"v":"2021","n":"2021"},{"v":"2020","n":"2020"},{"v":"2019","n":"2019"},{"v":"2018","n":"2018"},{"v":"2017","n":"2017"},{"v":"2016","n":"2016"},{"v":"2015","n":"2015"},{"v":"2014","n":"2014"},{"v":"2013","n":"2013"},{"v":"2012","n":"2012"},{"v":"2011","n":"2011"},{"v":"2010","n":"2010"},{"v":"2009","n":"2009"},{"v":"2008","n":"2008"},{"v":"2007","n":"2007"},{"v":"2006","n":"2006"},{"v":"2005","n":"2005"},{"v":"2004","n":"2004"}]},{"name":"排序","key":"rank","value":[{"v":"全部排序","n":"全部排序"},{"v":"按热度","n":"按热度"},{"v":"按上新","n":"按上新"},{"v":"按评分","n":"按评分"}]}],
            "20":[{"name":"分类","key":"type","value":[{"v":"全部类型","n":"全部类型"},{"v":"古装","n":"古装"},{"v":"喜剧","n":"喜剧"},{"v":"偶像","n":"偶像"},{"v":"家庭","n":"家庭"},{"v":"警匪","n":"警匪"},{"v":"言情","n":"言情"},{"v":"军事","n":"军事"},{"v":"武侠","n":"武侠"},{"v":"悬疑","n":"悬疑"},{"v":"历史","n":"历史"},{"v":"农村","n":"农村"},{"v":"都市","n":"都市"},{"v":"神话","n":"神话"},{"v":"科幻","n":"科幻"},{"v":"少儿","n":"少儿"},{"v":"搞笑","n":"搞笑"},{"v":"谍战","n":"谍战"},{"v":"战争","n":"战争"},{"v":"年代","n":"年代"},{"v":"犯罪","n":"犯罪"},{"v":"恐怖","n":"恐怖"},{"v":"惊悚","n":"惊悚"},{"v":"爱情","n":"爱情"},{"v":"剧情","n":"剧情"},{"v":"奇幻","n":"奇幻"}]},{"name":"区域","key":"area","value":[{"v":"全部地区","n":"全部地区"},{"v":"大陆","n":"大陆"},{"v":"美国","n":"美国"},{"v":"香港","n":"香港"},{"v":"韩国","n":"韩国"},{"v":"英国","n":"英国"},{"v":"台湾","n":"台湾"},{"v":"日本","n":"日本"},{"v":"法国","n":"法国"},{"v":"意大利","n":"意大利"},{"v":"德国","n":"德国"},{"v":"西班牙","n":"西班牙"},{"v":"泰国","n":"泰国"},{"v":"其它","n":"其它"}]},{"name":"年份","key":"year","value":[{"v":"全部年代","n":"全部年代"},{"v":"2025","n":"2025"},{"v":"2024","n":"2024"},{"v":"2023","n":"2023"},{"v":"2022","n":"2022"},{"v":"2021","n":"2021"},{"v":"2020","n":"2020"},{"v":"2019","n":"2019"},{"v":"2018","n":"2018"},{"v":"2017","n":"2017"},{"v":"2016","n":"2016"},{"v":"2015","n":"2015"},{"v":"2014","n":"2014"},{"v":"2013","n":"2013"},{"v":"2012","n":"2012"},{"v":"2011","n":"2011"},{"v":"2010","n":"2010"},{"v":"2009","n":"2009"},{"v":"2008","n":"2008"},{"v":"2007","n":"2007"},{"v":"2006","n":"2006"},{"v":"2005","n":"2005"},{"v":"2004","n":"2004"}]},{"name":"排序","key":"rank","value":[{"v":"全部排序","n":"全部排序"},{"v":"按热度","n":"按热度"},{"v":"按上新","n":"按上新"},{"v":"按评分","n":"按评分"}]}],
            "22":[{"name":"分类","key":"type","value":[{"v":"全部类型","n":"全部类型"},{"v":"热血","n":"热血"},{"v":"科幻","n":"科幻"},{"v":"推理","n":"推理"},{"v":"搞笑","n":"搞笑"},{"v":"冒险","n":"冒险"},{"v":"校园","n":"校园"},{"v":"动作","n":"动作"},{"v":"机战","n":"机战"},{"v":"运动","n":"运动"},{"v":"战争","n":"战争"},{"v":"少年","n":"少年"},{"v":"少女","n":"少女"},{"v":"社会","n":"社会"},{"v":"原创","n":"原创"},{"v":"亲子","n":"亲子"},{"v":"益智","n":"益智"},{"v":"励志","n":"励志"},{"v":"其他","n":"其他"}]},{"name":"区域","key":"area","value":[{"v":"全部地区","n":"全部地区"},{"v":"大陆","n":"大陆"},{"v":"日本","n":"日本"},{"v":"欧美","n":"欧美"},{"v":"其它","n":"其它"}]},{"name":"年份","key":"year","value":[{"v":"全部年代","n":"全部年代"},{"v":"2025","n":"2025"},{"v":"2024","n":"2024"},{"v":"2023","n":"2023"},{"v":"2022","n":"2022"},{"v":"2021","n":"2021"},{"v":"2020","n":"2020"},{"v":"2019","n":"2019"},{"v":"2018","n":"2018"},{"v":"2017","n":"2017"},{"v":"2016","n":"2016"},{"v":"2015","n":"2015"},{"v":"2014","n":"2014"},{"v":"2013","n":"2013"},{"v":"2012","n":"2012"},{"v":"2011","n":"2011"},{"v":"2010","n":"2010"},{"v":"2009","n":"2009"},{"v":"2008","n":"2008"},{"v":"2007","n":"2007"},{"v":"2006","n":"2006"},{"v":"2005","n":"2005"},{"v":"2004","n":"2004"}]},{"name":"排序","key":"rank","value":[{"v":"全部排序","n":"全部排序"},{"v":"按热度","n":"按热度"},{"v":"按上新","n":"按上新"},{"v":"按评分","n":"按评分"}]}],
            "23":[{"name":"分类","key":"type","value":[{"v":"全部类型","n":"全部类型"},{"v":"真人秀","n":"真人秀"},{"v":"访谈","n":"访谈"},{"v":"情感","n":"情感"},{"v":"选秀","n":"选秀"},{"v":"旅游","n":"旅游"},{"v":"美食","n":"美食"},{"v":"口秀","n":"口秀"},{"v":"曲艺","n":"曲艺"},{"v":"搞笑","n":"搞笑"},{"v":"游戏","n":"游戏"},{"v":"歌舞","n":"歌舞"},{"v":"生活","n":"生活"},{"v":"音乐","n":"音乐"},{"v":"时尚","n":"时尚"},{"v":"益智","n":"益智"},{"v":"职场","n":"职场"},{"v":"少儿","n":"少儿"},{"v":"纪实","n":"纪实"},{"v":"盛会","n":"盛会"}]},{"name":"区域","key":"area","value":[{"v":"全部地区","n":"全部地区"},{"v":"大陆","n":"大陆"},{"v":"美国","n":"美国"},{"v":"香港","n":"香港"},{"v":"韩国","n":"韩国"},{"v":"英国","n":"英国"},{"v":"台湾","n":"台湾"},{"v":"日本","n":"日本"},{"v":"法国","n":"法国"},{"v":"意大利","n":"意大利"},{"v":"德国","n":"德国"},{"v":"西班牙","n":"西班牙"},{"v":"泰国","n":"泰国"},{"v":"其它","n":"其它"}]},{"name":"年份","key":"year","value":[{"v":"全部年代","n":"全部年代"},{"v":"2025","n":"2025"},{"v":"2024","n":"2024"},{"v":"2023","n":"2023"},{"v":"2022","n":"2022"},{"v":"2021","n":"2021"},{"v":"2020","n":"2020"},{"v":"2019","n":"2019"},{"v":"2018","n":"2018"},{"v":"2017","n":"2017"},{"v":"2016","n":"2016"},{"v":"2015","n":"2015"},{"v":"2014","n":"2014"},{"v":"2013","n":"2013"},{"v":"2012","n":"2012"},{"v":"2011","n":"2011"},{"v":"2010","n":"2010"},{"v":"2009","n":"2009"},{"v":"2008","n":"2008"},{"v":"2007","n":"2007"},{"v":"2006","n":"2006"},{"v":"2005","n":"2005"},{"v":"2004","n":"2004"}]},{"name":"排序","key":"rank","value":[{"v":"全部排序","n":"全部排序"},{"v":"按热度","n":"按热度"},{"v":"按上新","n":"按上新"},{"v":"按评分","n":"按评分"}]}],
            "24":[{"name":"分类","key":"type","value":[{"v":"全部类型","n":"全部类型"},{"v":"古装","n":"古装"},{"v":"神豪","n":"神豪"},{"v":"穿越","n":"穿越"},{"v":"逆袭","n":"逆袭"},{"v":"虐恋","n":"虐恋"},{"v":"重生","n":"重生"},{"v":"复仇","n":"复仇"},{"v":"甜宠","n":"甜宠"},{"v":"其他","n":"其他"}]},{"name":"排序","key":"rank","value":[{"v":"全部排序","n":"全部排序"},{"v":"按热度","n":"按热度"},{"v":"按上新","n":"按上新"},{"v":"按评分","n":"按评分"}]}],
        }
    });
}

async function homeVod() {
    let data = JSON.parse(aesEcbDecode(await request(siteUrl + '/api.php/v1.home/data?type_id=25'), 'aassddwwxxllsx1x')).data;
    //console.log(data);
    let videos = [];
    videos = videos.concat(data['banners']);
    //console.log(videos);
    _.forEach(data['verLandList'], item => {
        videos = videos.concat(item['vertical_lands']);
    });
    //console.log(videos);
    return JSON.stringify({
        list: videos,
    });

}

async function category(tid, pg, filter, extend) {
	if(pg <= 0) pg = 1;
	let url = `${siteUrl}/api.php/v1.classify/content?page=` + pg;
    let params = {
        "area": extend['area'] || "全部地区",
        "rank": extend['rank'] || "按上新",
        "type": extend['type'] || "全部类型",
        "type_id": tid,
        "year": extend['year'] || "全部年代"
    }
    let encData = await request(url, params, {'Content-Type': 'application/json'}, 'POST');
    //console.log(encData);
    let videos = JSON.parse(aesEcbDecode(encData,'aassddwwxxllsx1x')).data.video_list;

    return JSON.stringify({
        page: pg,
        pagecount: 9999,
        list: videos,
    });
}

async function detail(id) {
    let url = `${siteUrl}/api.php/v1.player/details?vod_id=${id}`;
  	let rets = await request(url,{},'','POST');
	let info = JSON.parse(aesEcbDecode(rets,'aassddwwxxllsx1x'))['data']['detail'];
    let videos = {
        vod_id: info.vod_id,
        vod_name: info.vod_name,
        vod_area: info.vod_area,
        vod_director: info.vod_director,
        vod_actor: info.vod_actor,
        vod_pic: info.vod_pic,
        vod_content: info.vod_content,
        type_name: info.vod_class,
        vod_year: info.vod_year

    }
    let froms = [];
    let urls = [];
    _.forEach(info.play_url_list, item => {
        froms.push(item['show']);
        let nameUrls = [];
        _.forEach(item['urls'], item2 => {
            nameUrls.push(item2['name'] + '$' + item['from']+ '__' + id +'__'+ item2['url']);
        });
        urls.push(nameUrls.join('#'));
    });
    videos.vod_play_from = froms.join('$$$');
    videos.vod_play_url = urls.join('$$$');
    return JSON.stringify({
        list: [videos],
    });
}

async function play(flag, id, flags) {
    let parseData = parseMap[id.split('__')[0]];
    let vid = id.split('__')[1];
    let parseUrl = id.split('__')[2];
    parseUrl = aesEcbDecode(parseUrl, md5(keyId + vid));
    parseUrl = aesEcbDecode(parseUrl.split('data=')[1].split('&')[0], 'bbssqdbbssll25sx');
    if (parseData == '') {
        return JSON.stringify({
            parse: 0,
            url: parseUrl,
        });
    }
    if (parseData.startsWith('http')) {
        parseUrl = JSON.parse(await request(parseData + parseUrl)).url;
        return JSON.stringify({
            parse: 0,
            url: parseUrl,
        });
    }
    let url = `${siteUrl}/shark/api.php?action=parsevod`;
    let param = {
        'parse': parseData,
        'url': parseUrl,
        'matching': ''
    }
    let encData = await request(url, param, {
        'Content-Type': 'application/x-www-form-urlencoded',
      	'User-Agent': PC_UA,
        'version': '1.6.0'
    }, 'post', 'form');
    let playUrl = JSON.parse(aesEcbDecode(encData, 'aassddwwxxllsx1x')).url;

    return JSON.stringify({
        parse: 0,
        url: playUrl,
    });
}

async function search(wd, quick, pg) {
    let url = `${siteUrl}/api.php/v1.search/data?wd=${encodeURIComponent(wd)}&type_id=0&page=1`
    let encData = await request(url);
    let videos = JSON.parse(aesEcbDecode(encData,'aassddwwxxllsx1x')).data.search_data;
    return JSON.stringify({
        list: videos,
    });
} 

function aesEcbDecode(bs64, keyText) {
    // 将Base64编码的密文转换成WordArray
    const ciphertext = Crypto.enc.Base64.parse(bs64);
    const key = Crypto.enc.Utf8.parse(keyText);
    // 使用CryptoJS进行AES ECB模式解密
    const decrypted = Crypto.AES.decrypt(
        { ciphertext },
        key,
        {
            mode: Crypto.mode.ECB,
            padding: Crypto.pad.Pkcs7
        }
    );
    // 转换成UTF-8字符串并打印出来
    return decrypted.toString(Crypto.enc.Utf8);
}

function md5(text) {
    return Crypto.MD5(text).toString();
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
