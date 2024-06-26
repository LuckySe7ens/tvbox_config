import {Crypto, dayjs, jinja2, _} from "./lib/cat.js";
let key = "kkys"
  , url = "https://api1.baibaipei.com:8899"
  , device = {}
  , siteKey = ""
  , siteType = 0;
async function request(reqUrl, postData, agentSp, get) {
    let ts = dayjs().valueOf().toString();
    let rand = randStr(32);
    let sign = Crypto.enc.Hex.stringify(Crypto.MD5('H58d2%gLbeingX*%D4Y8!C!!@G_' + ts + '_' + rand))
        .toString()
        .toLowerCase();
    let headers = {
        'user-agent': agentSp || device.ua,
    };
    if (reqUrl.includes('baibaipei')) {
        headers['device-id'] = device.id;
        headers['push-token'] = '';
        headers['sign'] = sign;
        headers['time'] = ts;
        headers['md5'] = rand;
        headers['version'] = '2.1.5';
        headers['system-model'] = device.model;
        headers['system-brand'] = device.brand;
        headers['system-version'] = device.release;
    }
    if (!get) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    let res = await req(reqUrl, {
        method: get ? 'get' : 'post',
        headers: headers,
        data: postData || {},
    });

    let content = res.data;
    // console.log(content);
    if (typeof content === 'string') {
        var key = Crypto.enc.Utf8.parse('IjhHsCB2B5^#%0Ag');
        var iv = Crypto.enc.Utf8.parse('y8_m.3rauW/>j,}.');
        var src = Crypto.enc.Base64.parse(content);
        let dst = Crypto.AES.decrypt({ ciphertext: src }, key, { iv: iv, padding: Crypto.pad.Pkcs7 });
        dst = Crypto.enc.Utf8.stringify(dst);
        // console.log(dst);
        return JSON.parse(dst);
    }
    return content;
}

async function init(cfg) {
    siteKey = cfg.skey,
    siteType = cfg.stype;
    cfg = await local.get(key, "device");
    if (0 < cfg.length)
        try {
            device = JSON.parse(cfg)
        } catch (error) {}
    _.isEmpty(device) && ((device = randDevice()).id = randStr(33).toLowerCase(),
    device.ua = "okhttp/4.1.0",
    await local.set(key, "device", JSON.stringify(device)))
}

async function home(filter) {
    var classes = []
      , filterObj = {};
    for (const type of JSON.parse(await request(url + "/api.php/Index/getTopVideoCategory")).data) {
        //console.log('type', type);
        var typeName = type.nav_name;
        if ("推荐" != typeName) {
            var typeId = type.nav_type_id.toString();
            if (classes.push({
                type_id: typeId,
                type_name: typeName
            }),
            filter)
                try {
                    var key, filterAll = [], filterData = JSON.parse(await request(url + "/api.php/Video/getFilterType", {
                        type: typeId
                    })).data;
                    //console.log('filterData', filterData);
                    for (key of Object.keys(filterData)) {
                        var itemValues = filterData[key];
                        //console.log('key', key);
                        if ("plot" === key) key = "class";
                        let typeExtendName = "";
                        switch (key) {
                        case "class":
                            typeExtendName = "类型";
                            break;
                        case "area":
                            typeExtendName = "地区";
                            break;
                        case "lang":
                            typeExtendName = "语言";
                            break;
                        case "year":
                            typeExtendName = "年代";
                            break;
                        case "sort":
                            typeExtendName = "排序"
                        }
                        if (0 !== typeExtendName.length) {
                            var newTypeExtend = {
                                key: key,
                                name: typeExtendName
                            }
                              , newTypeExtendKV = [];
                            for (let j = 0; j < itemValues.length; j++) {
                                var name = itemValues[j]
                                  , value = "sort" === key ? j + "" : "全部" === name ? "0" : name;
                                newTypeExtendKV.push({
                                    n: name,
                                    v: value
                                })
                            }
                            newTypeExtend.init = "sort" === key ? "1" : newTypeExtendKV[0].v,
                            newTypeExtend.value = newTypeExtendKV,
                            filterAll.push(newTypeExtend)
                        }
                    }
                    _.isEmpty(filterAll) || (filterObj[typeId] = filterAll)
                } catch (e) {
                    console.log(e)
                }
        }
    }
    return JSON.stringify({
        class: classes,
        filters: filterObj
    })
}
async function homeVod() {
    var videos = [];
    for (const item of JSON.parse(await request(url + "/api.php/Index/getHomePage", {
        type: 1,
        p: 1
    })).data.video)
        if (0 === item.title.styleType)
            for (const vObj of item.list)
                videos.push({
                    vod_id: vObj.vod_id,
                    vod_name: vObj.vod_name,
                    vod_pic: vObj.vod_pic,
                    vod_remarks: vObj.vod_remarks || vObj.vod_score || ""
                });
    return JSON.stringify({
        list: videos
    })
}
async function category(tid, pg, filter, extend) {
    0 == pg && (pg = 1);
    var reqUrl = url + "/api.php/Video/getFilterVideoList"
      , extend = JSON.parse(jinja2(`{
        "type": "{{tid}}",
        "p": "{{pg}}",
        "area": "{{ext.area|default(0)}}",
        "year": "{{ext.year|default(0)}}",
        "sort": "{{ext.sort|default(0)}}",
        "class": "{{ext.class|default(0)}}"
    }`, {
        ext: extend,
        tid: tid,
        pg: pg
    }))
      , tid = (console.log(extend),
    JSON.parse(await request(reqUrl, extend)).data)
      , videos = [];
    for (const vod of tid.data)
        videos.push({
            vod_id: vod.vod_id,
            vod_name: vod.vod_name,
            vod_pic: vod.vod_pic,
            vod_remarks: vod.vod_remarks || vod.vod_score || ""
        });
    return JSON.stringify({
        page: parseInt(tid.current_page),
        pagecount: parseInt(tid.last_page),
        limit: parseInt(tid.per_page),
        total: parseInt(tid.total),
        list: videos
    })
}
async function detail(id) {
    var id = JSON.parse(await request(url + "/api.php/Video/getVideoInfo", {
        video_id: id
    })).data.video
      , vod = {
        vod_id: id.vod_id,
        vod_name: id.vod_name,
        vod_pic: id.vod_pic,
        type_name: id.vod_class,
        vod_year: id.vod_year,
        vod_area: id.vod_area,
        vod_remarks: id.vod_remarks || "",
        vod_actor: id.vod_actor,
        vod_director: id.vod_director,
        vod_content: id.vod_content.trim()
    }
      , playlist = {};
    for (const item of id.vod_play) {
        var from = item.playerForm;
        if ("jp" !== from && "xg" !== from) {
            let urls = [];
            for (const u of item.url)
                urls.push(formatPlayUrl(vod.vod_name, u.title) + "$" + u.play_url);
            !playlist.hasOwnProperty(from) && 0 < urls.length && (playlist[from] = urls)
        }
    }
    parse = id.parse || [],
    vod.vod_play_from = _.keys(playlist).join("$$$");
    var vod_play_url = [];
    for (const urlist of _.values(playlist))
        vod_play_url.push(urlist.join("#"));
    return vod.vod_play_url = vod_play_url.join("$$$"),
    JSON.stringify({
        list: [vod]
    })
}
var parse = [];
async function play(flag, id, flags) {
    try {
        if ((0 <= id.indexOf("youku") || 0 <= id.indexOf("iqiyi") || 0 <= id.indexOf("v.qq.com") || 0 <= id.indexOf("pptv") || 0 <= id.indexOf("le.com") || 0 <= id.indexOf("1905.com") || 0 <= id.indexOf("mgtv")) && 0 < parse.length)
            for (let index = 0; index < parse.length; index++)
                try {
                    var p = parse[index];
                    let res = await req(p + id, {
                        headers: {
                            "user-agent": "okhttp/4.1.0"
                        }
                    });
                    if ((result = jsonParse(id, JSON.parse(res.content))).url)
                        return result.parse = 0,
                        JSON.stringify(result)
                } catch (error) {}
        if (0 <= id.indexOf("jqq-")) {
            var jqqHeader = await request(url + "/jqqheader.json", null, null, !0)
              , jqqHeaders = JSON.parse(jqqHeader)
              , ids = id.split("-")
              , jxJqq = await req("https://api.juquanquanapp.com/app/drama/detail?dramaId=" + ids[1] + "&episodeSid=" + ids[2] + "&quality=LD", {
                headers: jqqHeaders
            })
              , jqqInfo = JSON.parse(jxJqq.content);
            if (jqqInfo.data.playInfo.url)
                return JSON.stringify({
                    parse: 0,
                    playUrl: "",
                    url: jqqInfo.data.playInfo.url
                })
        }
        var result, res = await request(url + "/video.php", {
            url: id
        });
        return (result = jsonParse(id, JSON.parse(res).data)).url ? (result.parse = 0,
        JSON.stringify(result)) : JSON.stringify({
            parse: 0,
            playUrl: "",
            url: id
        })
    } catch (e) {
        return console.log(e),
        JSON.stringify({
            parse: 0,
            url: id
        })
    }
}
async function search(wd, quick) {
    var videos = [];
    for (const vod of JSON.parse(await request(url + "/api.php/Search/getSearch", {
        key: wd,
        type_id: 0,
        p: 1
    })).data.data)
        videos.push({
            vod_id: vod.vod_id,
            vod_name: vod.vod_name,
            vod_pic: vod.vod_pic,
            vod_remarks: vod.vod_remarks || vod.vod_score || ""
        });
    return JSON.stringify({
        list: videos
    })
}
const charStr = "abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789";
function randStr(len, withNum) {
    for (var _str = "", containsNum = void 0 === withNum || withNum, i = 0; i < len; i++) {
        var idx = _.random(0, containsNum ? charStr.length - 1 : charStr.length - 11);
        _str += charStr[idx]
    }
    return _str
}
function randDevice() {
    return {
        brand: "Huawei",
        model: "HUAWEI Mate 20",
        release: "10",
        buildId: randStr(3, !1).toUpperCase() + _.random(11, 99) + randStr(1, !1).toUpperCase()
    }
}
function formatPlayUrl(src, name) {
    return name.trim().replaceAll(src, "").replace(/<|>|《|》/g, "").replace(/\$|#/g, " ").trim()
}
function jsonParse(input, json) {
    try {
        let url = json.url ?? "";
        if (!(url = url.startsWith("//") ? "https:" + url : url).startsWith("http"))
            return {};
        let headers = json.headers || {};
        var ua = (json["user-agent"] || "").trim()
          , referer = (0 < ua.length && (headers["User-Agent"] = ua),
        (json.referer || "").trim());
        return 0 < referer.length && (headers.Referer = referer),
        _.keys(headers).forEach(hk=>{
            headers[hk] || delete headers[hk]
        }
        ),
        {
            header: headers,
            url: url
        }
    } catch (error) {
        console.log(error)
    }
    return {}
}
function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        homeVod: homeVod,
        category: category,
        detail: detail,
        play: play,
        search: search
    }
}
export {__jsEvalReturn};
