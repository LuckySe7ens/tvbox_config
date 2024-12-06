import { Crypto, load, _ } from "assets://js/lib/cat.js";
const _0x28975f = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36";
const _0x2d163d = "Mozilla/5.0";
let _0x3d8a24 = "";
var _0x1cfedb = "abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789";
let _0x4841db = "";
let _0x17ce4d = _0x4841db + "/index.php/verify/index.html?";
let _0x4abae0 = "https://www.hdmyy.com/index.php/ajax/verify_check?type=search&verify=";
let _0x3a769f = "";
let _0x2f5e2e = 0;
let _0x246bf3 = "PHPSESSID=" + _0x15797c(26, true);
let _0x38284c = 0;
var _0x512554 = {};
let _0x4bfed3 = {};
let _0x2b9b12 = [];
let _0x4b7204 = [];
let _0x4263b1 = {};
let _0x1d37b4 = {};
let _0x889276 = 999;
let _0x46feae = 1;
let _0x4d57c2 = "";
let _0x7aed66 = {};
let _0x23b4b0;
let _0x1406b9 = "";
let _0x305f9a = "";
let _0x14cd7b = "";
let _0x213f41 = 10000;
let _0x3ec338 = {
  "User-Agent": _0x28975f,
  Referer: _0x4841db,
  Cookie: _0x246bf3
};
async function _0x2c5ce5(_0x512b39, _0x24c56c, _0x125749, _0x3dccda) {
  let _0x1a1118 = await req(_0x512b39, {
    method: _0x3dccda || "get",
    data: _0x24c56c || "",
    headers: _0x125749 || _0x3ec338,
    postType: _0x3dccda === "post" ? "form-data" : "",
    timeout: _0x213f41
  });
  return _0x1a1118.content;
}
async function _0x26a7e8(_0x2d988e) {
  _0x3a769f = _0x2d988e.skey;
  _0x2f5e2e = _0x2d988e.stype;
  if (_0x2d988e.ext) {
    await _0x3f80fb(_0x2d988e.ext);
    _0x3ec338.Referer = _0x4841db;
  }
  if (_0x512554.initHost) {
    {
      _0x3d8a24 = await _0x2c5ce5(_0x4841db);
      if (_0x3d8a24.indexOf("document.cookie = ") > 0) {
        {
          _0x246bf3 = _0x3d8a24.match(/document.cookie = "(.*?)"/)[1];
          _0x3d8a24 = await _0x2c5ce5(_0x4841db);
        }
      }
    }
  }
}
async function _0x3f80fb(_0xf5dea5) {
  let _0x2f15dd = "";
  if (typeof _0xf5dea5 == "string" && _0xf5dea5.startsWith("http")) {
    _0x2f15dd = await _0x2c5ce5(_0xf5dea5);
    eval(_0x2f15dd);
  } else {
    _0x512554 = _0xf5dea5;
  }
  await _0x1e927a();
}
async function _0x1e927a() {
  if (_0x512554.host) {
    {
      _0x4841db = _0x512554.host;
    }
  }
  if (_0x512554.headers) {
    {
      Object.assign(_0x3ec338, _0x512554.headers);
    }
  }
  if (_0x512554.timeout) {
    _0x213f41 = _0x512554.timeout;
  }
  const _0x4035dc = _0x512554.initJs || _0x512554.hostJs;
  if (_0x4035dc) {
    {
      const _0x406749 = _0x4035dc.split("||");
      for (let _0x2af63f = 0; _0x2af63f < _0x406749.length; _0x2af63f++) {
        if (_0x406749[_0x2af63f].indexOf("request(") >= 0) {
          _0x3d8a24 = await eval(_0x406749[_0x2af63f]);
        } else {
          {
            eval(_0x406749[_0x2af63f]);
          }
        }
      }
    }
  }
}
async function _0x47d07e(_0x3a9344) {
  _0x2b9b12 = [];
  if (_0x512554.class_name) {
    {
      let _0x293870 = _0x512554.class_name.split("&");
      for (let _0x3611a = 0; _0x3611a < _0x293870.length; _0x3611a++) {
        {
          let _0xe3b93f = _0x512554.class_url.split("&")[_0x3611a];
          const _0x746ab0 = {
            type_id: _0xe3b93f,
            type_name: _0x293870[_0x3611a]
          };
          _0x2b9b12.push(_0x746ab0);
        }
      }
    }
  } else {
    if (_0x512554.class_parse) {
      let _0x2688ab = _0x512554.homeUrl;
      if (_0x2688ab) {
        if (_0x2688ab.startsWith("/")) {
          _0x2688ab = _0x4841db + _0x2688ab;
        }
        _0x3d8a24 = await _0x2c5ce5(_0x2688ab);
      }
      const _0x3eafc8 = load(_0x3d8a24);
      const _0x3e783a = _0x512554.class_parse.split(";");
      _.forEach(_0x3eafc8(_0x3e783a[0]), _0x1af379 => {
        let _0x658b6c = _0x52e994(_0x3eafc8, _0x1af379, _0x3e783a[2]);
        let _0x3c445f = _0x52e994(_0x3eafc8, _0x1af379, _0x3e783a[1]);
        const _0x696340 = {
          type_id: _0x658b6c,
          type_name: _0x3c445f
        };
        _0x2b9b12.push(_0x696340);
      });
    }
  }
  if (_0x512554.filter) {
    _0x1d37b4 = _0x512554.filter;
  }
  if (_0x512554.homeJS) {
    await _0x33282f(_0x512554.homeJS);
  }
  const _0x4df486 = {
    class: _0x2b9b12,
    filters: _0x1d37b4
  };
  return JSON.stringify(_0x4df486);
}
function _0x52e994(_0x2acabd, _0x34150e, _0x406722) {
  if (!_0x406722) {
    return "";
  }
  let _0x41adef = _0x406722.split("&&");
  if (!_0x41adef || _0x41adef.length < 2) {
    return "";
  }
  let _0x26b712;
  if (_0x34150e) {
    {
      if (_0x41adef[0]) {
        _0x26b712 = _0x2acabd(_0x34150e).find(_0x41adef[0]);
      } else {
        _0x26b712 = _0x2acabd(_0x34150e);
      }
    }
  } else {
    {
      _0x26b712 = _0x2acabd(_0x41adef[0]);
    }
  }
  let _0x5e5bd8 = "";
  if (_0x41adef[1].indexOf("||") > 0) {
    {
      const _0x1a4017 = _0x41adef[1].split("||");
      _0x5e5bd8 = _0x2acabd(_0x26b712).attr(_0x1a4017[0]) || _0x2acabd(_0x26b712).attr(_0x1a4017[1]);
    }
  } else {
    if (_0x41adef[1] == "Text") {
      {
        _0x5e5bd8 = _0x2acabd(_0x26b712).text().trim();
      }
    } else {
      _0x5e5bd8 = _0x2acabd(_0x26b712).attr(_0x41adef[1]);
    }
  }
  if (_0x41adef[2]) {
    const _0xd16066 = _0x5e5bd8.match(new RegExp(_0x41adef[2]));
    if (_0xd16066) {
      _0x5e5bd8 = _0xd16066[1];
    }
  }
  return _0x5e5bd8;
}
function _0x468b4a(_0x18b0db, _0x1fa402, _0x1ef249) {
  if (!_0x1ef249) {
    return "";
  }
  let _0x4bf190 = _0x1ef249.split("&&");
  if (!_0x4bf190 || _0x4bf190.length < 2) {
    return "";
  }
  let _0x1736fd = [];
  let _0x18c39a;
  if (_0x1fa402) {
    if (_0x4bf190[0]) {
      _0x18c39a = _0x18b0db(_0x1fa402).find(_0x4bf190[0]);
    } else {
      {
        _0x18c39a = _0x18b0db(_0x1fa402);
      }
    }
  } else {
    _0x18c39a = _0x18b0db(_0x4bf190[0]);
  }
  _.forEach(_0x18c39a, _0x215ce7 => {
    {
      let _0x439014 = "";
      if (_0x4bf190[1].indexOf("||") > 0) {
        const _0x3c0a46 = _0x4bf190[1].split("||");
        _0x439014 = _0x18b0db(_0x215ce7).attr(_0x3c0a46[0]) || _0x18b0db(_0x215ce7).attr(_0x3c0a46[0]);
      } else {
        if (_0x4bf190[1] == "Text") {
          {
            _0x439014 = _0x18b0db(_0x215ce7).text().trim();
          }
        } else {
          {
            _0x439014 = _0x18b0db(_0x215ce7).attr(_0x4bf190[1]);
          }
        }
      }
      if (_0x4bf190[2]) {
        {
          const _0xcd97e = _0x439014.match(new RegExp(_0x4bf190[2]));
          if (_0xcd97e) {
            _0x439014 = _0xcd97e[1];
          }
        }
      }
      if (_0x439014) {
        _0x1736fd.push(_0x439014);
      }
    }
  });
  return _0x1736fd;
}
async function _0x218831() {
  _0x4b7204 = [];
  const _0x3250b6 = _0x512554.homeVod || _0x512554["推荐"];
  const _0x502da5 = _0x512554.homeVodJS || _0x512554["推荐JS"];
  if (_0x3250b6) {
    {
      let _0x28b44 = _0x4841db;
      if (_0x512554.homeUrl && _0x512554.homeUrl.startsWith("/")) {
        {
          _0x28b44 = _0x4841db + _0x512554.homeUrl;
        }
      } else {
        if (_0x512554.homeUrl && _0x512554.homeUrl.startsWith("http")) {
          {
            _0x28b44 = _0x512554.homeUrl;
          }
        }
      }
      const _0x54529f = load(await _0x2c5ce5(_0x28b44));
      _0x4b7204 = _0x4ec925(_0x54529f, _0x3250b6);
      const _0xd46b38 = {
        list: _0x4b7204
      };
      return JSON.stringify(_0xd46b38);
    }
  } else {
    if (_0x502da5) {
      await _0x33282f(_0x502da5);
      const _0x2ddf52 = {
        list: _0x4b7204
      };
      return JSON.stringify(_0x2ddf52);
    }
  }
}
function _0x4ec925(_0x3375f3, _0x4fc4ba) {
  let _0x3d935f = [];
  const _0x2ba93a = _0x4fc4ba.split(";");
  _.forEach(_0x3375f3(_0x2ba93a[0]), _0x2dae61 => {
    {
      let _0x16e025 = _0x52e994(_0x3375f3, _0x2dae61, _0x2ba93a[2]);
      if (_0x16e025) {
        let _0x13a19d = _0x52e994(_0x3375f3, _0x2dae61, _0x2ba93a[3]);
        if (_0x512554.picHost) {
          _0x13a19d = _0x512554.picHost + _0x13a19d;
        }
        if (_0x13a19d.startsWith("/")) {
          _0x13a19d = _0x4841db + _0x13a19d;
        }
        const _0x4761b1 = {
          vod_id: _0x16e025,
          vod_name: _0x52e994(_0x3375f3, _0x2dae61, _0x2ba93a[1]),
          vod_pic: _0x13a19d,
          vod_remarks: _0x52e994(_0x3375f3, _0x2dae61, _0x2ba93a[4])
        };
        _0x3d935f.push(_0x4761b1);
      }
    }
  });
  return _0x3d935f;
}
async function _0x2eb517(_0x19c773, _0x203c72, _0x5db3a2, _0x4caf30) {
  _0x4b7204 = [];
  if (_0x203c72 <= 0) {
    _0x203c72 = 1;
  }
  _0x4d57c2 = _0x19c773;
  _0x4bfed3 = _0x4caf30;
  _0x46feae = _0x203c72;
  if (_0x512554.url) {
    let _0x4b4266 = _0x512554.url.replaceAll("fypage", _0x46feae).replaceAll("fyclass", _0x19c773);
    if (!_0x4b4266.startsWith("http")) {
      {
        _0x4b4266 = _0x4841db + _0x4b4266;
      }
    }
    const _0x20d5a8 = /\{\{(.*?)\}\}/g;
    const _0x2611dc = _0x4b4266.match(_0x20d5a8);
    if (_0x2611dc) {
      _.forEach(_0x2611dc, _0x3cfe2e => {
        let _0x69e81c = _0x3cfe2e.replace(/\{\{(.*?)\}\}/, "$1").trim();
        _0x4b4266 = _0x4b4266.replace(_0x3cfe2e, _0x4caf30[_0x69e81c] || "");
      });
    }
    _0x3d8a24 = await _0x2c5ce5(_0x4b4266);
    const _0x3e32be = _0x512554["一级"] || _0x512554.categoryVod;
    if (_0x3e32be) {
      const _0x5c8dcb = load(_0x3d8a24);
      _0x4b7204 = _0x4ec925(_0x5c8dcb, _0x3e32be);
      const _0x25e9e0 = {
        list: _0x4b7204,
        filters: _0x1d37b4,
        page: _0x46feae,
        pagecount: _0x889276
      };
      return JSON.stringify(_0x25e9e0);
    }
  }
  const _0x573be3 = _0x512554["一级JS"] || _0x512554.categoryVodJS;
  if (_0x573be3) {
    {
      await _0x33282f(_0x573be3);
      const _0x55e868 = {
        list: _0x4b7204,
        filters: _0x1d37b4,
        page: _0x46feae,
        pagecount: _0x889276
      };
      return JSON.stringify(_0x55e868);
    }
  }
  return "{}";
}
async function _0x26fbff(_0x41b675) {
  _0x4b7204 = [];
  _0x14cd7b = _0x41b675;
  let _0x44303b = _0x41b675;
  if (_0x512554.detailUrl) {
    _0x44303b = _0x512554.detailUrl;
  }
  if (_0x44303b.startsWith("/")) {
    _0x44303b = _0x4841db + _0x44303b;
  }
  _0x44303b = _0x44303b.replace("fyid", _0x41b675);
  const _0x3bc40c = {};
  const _0x1c2f4a = _0x512554["二级"] || _0x512554.detailVod;
  const _0x388ab5 = _0x512554["二级JS"] || _0x512554.detailVodJS;
  if (_0x1c2f4a) {
    _0x3d8a24 = await _0x2c5ce5(_0x44303b);
    const _0x380aa0 = load(_0x3d8a24);
    if ("object" === typeof _0x1c2f4a) {
      if (_0x1c2f4a.director) {
        _0x3bc40c.vod_director = _0x468b4a(_0x380aa0, "", _0x1c2f4a.director).join(" ");
      }
      if (_0x1c2f4a.actor) {
        {
          _0x3bc40c.vod_actor = _0x468b4a(_0x380aa0, "", _0x1c2f4a.actor).join(" ");
        }
      }
      if (_0x1c2f4a.area) {
        _0x3bc40c.vod_area = _0x52e994(_0x380aa0, "", _0x1c2f4a.area);
      }
      if (_0x1c2f4a.year) {
        {
          _0x3bc40c.vod_year = _0x52e994(_0x380aa0, "", _0x1c2f4a.year);
        }
      }
      if (_0x1c2f4a.remarks) {
        _0x3bc40c.vod_remarks = _0x52e994(_0x380aa0, "", _0x1c2f4a.remarks);
      }
      if (_0x1c2f4a.content) {
        {
          _0x3bc40c.vod_content = "关注公众号【蹲街捏蚂蚁】\r\n" + _0x52e994(_0x380aa0, "", _0x1c2f4a.content);
        }
      }
      if (_0x1c2f4a.type_name) {
        _0x3bc40c.type_name = _0x468b4a(_0x380aa0, "", _0x1c2f4a.type_name).join("/");
      }
      if (_0x1c2f4a.playFrom && _0x1c2f4a.playUrl) {
        {
          const _0x3de96d = {};
          const _0x16b5ea = _0x468b4a(_0x380aa0, "", _0x1c2f4a.playFrom);
          const _0x4bd385 = _0x1c2f4a.playUrl.split(";");
          const _0x546609 = _0x380aa0(_0x4bd385[0]);
          _.each(_0x546609, (_0x21e418, _0x438154) => {
            if (_0x512554.tab_exclude && _0x512554.tab_exclude.indexOf(_0x16b5ea[_0x438154]) > -1) {
              return;
            }
            _.each(_0x380aa0(_0x21e418).find(_0x4bd385[1] || "a"), _0x549bc5 => {
              {
                const _0x5b1815 = _0x52e994(_0x380aa0, _0x549bc5, _0x4bd385[2]);
                const _0x22e457 = _0x52e994(_0x380aa0, _0x549bc5, _0x4bd385[3]);
                if (!_0x3de96d.hasOwnProperty(_0x16b5ea[_0x438154])) {
                  {
                    _0x3de96d[_0x16b5ea[_0x438154]] = [];
                  }
                }
                _0x3de96d[_0x16b5ea[_0x438154]].push(_0x5b1815 + "$" + _0x22e457);
              }
            });
          });
          _0x3bc40c.vod_play_from = _.keys(_0x3de96d).join("$$$");
          let _0xfd6b3d = _0x3bc40c.vod_play_from.indexOf("$$$");
          if (_0xfd6b3d == -1) {
            _0x3bc40c.vod_play_from = "公众号【蹲街捏蚂蚁】";
          } else {
            {
              _0x3bc40c.vod_play_from = "公众号【蹲街捏蚂蚁】" + _0x3bc40c.vod_play_from.substr(_0xfd6b3d);
            }
          }
          const _0x30908c = _.values(_0x3de96d);
          const _0x23729c = _.map(_0x30908c, _0x18a52a => {
            return _0x18a52a.join("#");
          });
          _0x3bc40c.vod_play_url = _0x23729c.join("$$$");
        }
      }
    }
    const _0x3b1e5b = {
      list: [_0x3bc40c]
    };
    return JSON.stringify(_0x3b1e5b);
  } else {
    if (_0x388ab5) {
      _0x4263b1 = {};
      await _0x33282f(_0x388ab5);
    }
  }
  const _0x2cdfe2 = {
    list: _0x4b7204
  };
  return JSON.stringify(_0x2cdfe2);
}
async function _0x10ac8e(_0x49b5e7, _0x135079, _0x1def51) {
  let _0x4760e6 = _0x135079;
  _0x23b4b0 = _0x49b5e7;
  _0x14cd7b = _0x135079;
  if (_0x4760e6.startsWith("magnet:")) {
    {
      const _0x2d5a62 = {
        parse: 0,
        url: _0x4760e6
      };
      return JSON.stringify(_0x2d5a62);
    }
  }
  if (_0x4760e6.startsWith("/")) {
    {
      _0x4760e6 = _0x4841db + _0x4760e6;
    }
  }
  _0x1406b9 = _0x4760e6;
  if (_0x512554.lazy) {
    try {
      {
        await _0x33282f(_0x512554.lazy);
        const _0x129811 = {
          parse: 0,
          url: _0x1406b9,
          header: _0x3ec338
        };
        return JSON.stringify(_0x129811);
      }
    } catch (_0x5b835b) {
      {
        console.log(_0x5b835b);
      }
    }
  }
  if (/\.(m3u8|mp4|mkv|flv|mp3|m4a|aac)$/.test(_0x1406b9.split("?")[0])) {
    const _0x5bdea5 = {
      parse: 0,
      url: _0x1406b9,
      header: _0x3ec338
    };
    return JSON.stringify(_0x5bdea5);
  }
  try {
    {
      _0x3d8a24 = await _0x2c5ce5(_0x4760e6);
      const _0x534d5b = _0x43076(_0x3d8a24);
      if (_0x534d5b) {
        {
          let _0x688e75 = JSON.parse(_0x534d5b);
          _0x1406b9 = _0x688e75.url;
          if (_0x688e75.encrypt == 1) {
            {
              _0x1406b9 = unescape(_0x1406b9);
            }
          } else {
            if (_0x688e75.encrypt == 2) {
              _0x1406b9 = unescape(_0x194123(_0x1406b9));
            }
          }
        }
      }
      if (/\.(m3u8|mp4|mkv|flv|mp3|m4a|aac)$/.test(_0x1406b9.split("?")[0])) {
        const _0x4f49b4 = {
          parse: 0,
          url: _0x1406b9,
          header: _0x3ec338
        };
        return JSON.stringify(_0x4f49b4);
      }
    }
  } catch (_0xf20ff) {
    {
      console.log(_0xf20ff);
    }
  }
  const _0x37bb56 = {
    parse: 1,
    url: _0x1406b9
  };
  return JSON.stringify(_0x37bb56);
}
function _0x43076(_0x57a3d6) {
  let _0x52a7b1 = load(_0x57a3d6);
  return _0x52a7b1("script:contains(player_aaaa)").text().replace("var player_aaaa=", "");
}
function _0x194123(_0x26acbc) {
  return Crypto.enc.Utf8.stringify(Crypto.enc.Base64.parse(_0x26acbc));
}
function _0x42634a(_0x2a742b, _0x574749, _0x5693b3, _0x1106e5) {
  const _0x5269f6 = Crypto.enc.Utf8.parse(_0x574749);
  let _0x2db540 = Crypto.AES.encrypt(_0x2a742b, _0x5269f6, {
    iv: Crypto.enc.Utf8.parse(_0x5693b3),
    mode: Crypto.mode.CBC,
    padding: Crypto.pad.Pkcs7
  });
  if (_0x1106e5 === "hex") {
    return _0x2db540.ciphertext.toString(Crypto.enc.Hex);
  }
  return _0x2db540.toString(Crypto.enc.Utf8);
}
function _0x39b74e(_0x21bcd9, _0x143d75, _0x546f99, _0x2ef2a1) {
  const _0xd8c178 = Crypto.enc.Utf8.parse(_0x143d75);
  if (_0x2ef2a1 === "hex") {
    _0x21bcd9 = Crypto.enc.Hex.parse(_0x21bcd9);
    const _0x5e0652 = {
      ciphertext: _0x21bcd9
    };
    return Crypto.AES.decrypt(_0x5e0652, _0xd8c178, {
      iv: Crypto.enc.Utf8.parse(_0x546f99),
      mode: Crypto.mode.CBC,
      padding: Crypto.pad.Pkcs7
    }).toString(Crypto.enc.Utf8);
  } else {
    {
      return Crypto.AES.decrypt(_0x21bcd9, _0xd8c178, {
        iv: Crypto.enc.Utf8.parse(_0x546f99),
        mode: Crypto.mode.CBC,
        padding: Crypto.pad.Pkcs7
      }).toString(Crypto.enc.Utf8);
    }
  }
}
function _0x2dddcf(_0xbe4996) {
  return Crypto.MD5(_0xbe4996).toString();
}
function _0xab15e8(_0x37f181) {
  return Crypto.SHA1(_0x37f181).toString();
}
async function _0x57b087(_0x24c783, _0x18309c, _0x4a3db2) {
  try {
    _0x4b7204 = [];
    _0x14cd7b = _0x24c783;
    if (!_0x4a3db2) {
      _0x4a3db2 = "";
    }
    let _0x3fa430 = "/search.php?searchword=" + _0x24c783;
    if (_0x512554.searchUrl) {
      _0x3fa430 = _0x512554.searchUrl;
    }
    _0x3fa430 = _0x3fa430.replace("**", _0x24c783).replace("fypage", _0x46feae);
    if (!_0x3fa430.startsWith("http")) {
      _0x3fa430 = _0x4841db + _0x3fa430;
    }
    _0x305f9a = _0x3fa430;
    if (_0x512554.searchVodJS) {
      await _0x33282f(_0x512554.searchVodJS);
    } else {
      if (_0x512554.searchVod) {
        {
          let _0x4a24fd = await _0x2c5ce5(_0x3fa430);
          const _0x52a0f5 = load(_0x4a24fd);
          _0x4b7204 = _0x4ec925(_0x52a0f5, _0x512554.searchVod);
        }
      }
    }
    const _0x1d20b3 = {
      list: _0x4b7204
    };
    return JSON.stringify(_0x1d20b3);
    _0x38284c = 0;
  } catch (_0x329600) {
    {
      console.log(_0x329600);
      _0x38284c = 0;
      return "{}";
    }
  }
}
async function _0x17ad7c(_0x2f0d18) {
  try {
    const _0x15eeb6 = {
      "User-Agent": _0x2d163d,
      Referer: _0x4841db,
      Cookie: _0x246bf3
    };
    const _0xe50ceb = {
      buffer: 2,
      headers: _0x15eeb6
    };
    const _0x3e0334 = await req(_0x2f0d18, _0xe50ceb);
    const _0x21a88a = {
      "Content-Type": "text/plain"
    };
    const _0x44caf6 = {
      method: "post",
      data: _0x3e0334.content,
      headers: _0x21a88a
    };
    const _0x5a6aa9 = await req("https://api.nn.ci/ocr/b64/text", _0x44caf6);
    if (_0x5a6aa9.code === 200) {
      {
        let _0x1feacc = await _0x2c5ce5(_0x4abae0 + _0x5a6aa9.content);
      }
    }
  } catch (_0x155dc9) {
    console.error(_0x155dc9);
  }
}
function _0x15797c(_0x5b9301, _0x3e38ed) {
  var _0x37d51d = "";
  let _0x3bf116 = _0x3e38ed === undefined ? true : _0x3e38ed;
  for (var _0x41d4c9 = 0; _0x41d4c9 < _0x5b9301; _0x41d4c9++) {
    {
      let _0x6a27fc = _.random(0, _0x3bf116 ? _0x1cfedb.length - 1 : _0x1cfedb.length - 11);
      _0x37d51d += _0x1cfedb[_0x6a27fc];
    }
  }
  return _0x37d51d;
}
function _0x3a35b6(_0x3833f2) {
  let _0x378563 = new Date();
  const _0x45ccd2 = _0x378563.getTime() + _0x3833f2;
  while (true) {
    _0x378563 = new Date();
    if (_0x378563.getTime() > _0x45ccd2) {
      return;
    }
  }
}
async function _0x33282f(_0x4fd49b) {
  const _0x4ae3bf = _0x4fd49b.split("|||");
  for (let _0x3522c7 = 0; _0x3522c7 < _0x4ae3bf.length; _0x3522c7++) {
    if (_0x4ae3bf[_0x3522c7].indexOf("request(") >= 0) {
      {
        _0x3d8a24 = await eval(_0x4ae3bf[_0x3522c7]);
      }
    } else {
      eval(_0x4ae3bf[_0x3522c7]);
    }
  }
}
export function __jsEvalReturn() {
  const _0x4f1b1f = {
    init: _0x26a7e8,
    home: _0x47d07e,
    homeVod: _0x218831,
    category: _0x2eb517,
    detail: _0x26fbff,
    play: _0x10ac8e,
    search: _0x57b087,
    validCode: _0x17ad7c
  };
  return _0x4f1b1f;
}
