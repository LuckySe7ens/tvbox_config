import { Crypto, _ } from './cat.js';

const PLAY_AUTH_SIGN1 = [52, 58, 53, 121, 116, 102];
const PLAY_AUTH_SIGN2 = [90, 91];

function getAlivcVodInfoUrl(playAuth, videoId) {
    const decodedPlayAuth = decodePlayAuth(playAuth);
    const jsonMap = JSON.parse(decodedPlayAuth);

    const rand = generateUuid();
    const accessKeyId = jsonMap.AccessKeyId;

    const publicParams = {
        AccessKeyId: accessKeyId,
        SignatureMethod: 'HMAC-SHA1',
        SignatureVersion: '1.0',
        SignatureNonce: generateUuid(),
        Format: 'JSON',
        Channel: 'HTML5',
        StreamType: 'video',
        Rand: rand,
        Formats: '',
        Version: '2017-03-21',
    };

    const authInfo = encodeURIComponent(jsonMap.AuthInfo);
    const securityToken = encodeURIComponent(jsonMap.SecurityToken);

    const privateParams = {
        Action: 'GetPlayInfo',
        AuthInfo: authInfo,
        AuthTimeout: '3600',
        PlayConfig: '',
        PlayerVersion: '',
        SecurityToken: securityToken,
        VideoId: videoId,
    };

    const allParams = _.merge(publicParams, privateParams);
    const queryParams = getQueryParams(allParams);
    const stringToSign = 'GET' + '&' + encodeURIComponent('/') + '&' + encodeURIComponent(queryParams);

    const accessKeySecret = jsonMap.AccessKeySecret;
    const signature = hmacSha1Signature(accessKeySecret, stringToSign);

    const queryString = queryParams + '&Signature=' + encodeURIComponent(signature);
    const region = jsonMap.Region || 'cn-shanghai';
    return 'https://vod.' + region + '.aliyuncs.com/?' + queryString;
}

function decodePlayAuth(playAuth) {
    if (isSignedPlayAuth(playAuth)) {
      playAuth = decodeSignedPlayAuth2B64(playAuth);
    }
    return base64Decode(playAuth);
}

function isSignedPlayAuth(playAuth) {
    const signPos1 = new Date().getFullYear() / 100;
    const signPos2 = playAuth.length - 2;
    const sign1 = getSignStr(PLAY_AUTH_SIGN1);
    const sign2 = getSignStr(PLAY_AUTH_SIGN2);
    return playAuth.substring(signPos1, signPos1 + sign1.length) == sign1 &&
        playAuth.substring(signPos2) == sign2;
}

function decodeSignedPlayAuth2B64(playAuth) {
    const sign1 = getSignStr(PLAY_AUTH_SIGN1);
    const sign2 = getSignStr(PLAY_AUTH_SIGN2);
    return playAuth.replace(sign1, '').replace(sign2, '');
}

function base64Decode(text) {
    return Crypto.enc.Utf8.stringify(Crypto.enc.Base64.parse(text));
}

function generateUuid() {
    const chars = '0123456789abcdef';
    const uuid = [];
    for (let i = 0; i < 33; i++) {
        const randomIndex = Math.floor(Math.random() * 16);
        uuid[i] = chars.charAt(randomIndex);
    }
    return uuid.join('');
}

function hmacSha1Signature(accessKeySecret, stringToSign) {
    const key = accessKeySecret + '&';
    const hmacSHA1 = Crypto.HmacSHA1(stringToSign, key).toString(Crypto.enc.Base64);
    return hmacSHA1;
}

function getQueryParams(params) {
    const queryString = _.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join('&');
    return queryString;
}

function getSignStr(sign) {
    const str = _.map(sign, (char, index) => String.fromCharCode(char - index))
        .join('');
    return str;
}

export {
    getAlivcVodInfoUrl,
};