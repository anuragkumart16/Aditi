
'https://zdisk.pages.dev/s?=/1878365517/p/868213406/onepagelink.in/ba811197217054ace79cb24b1139a86745a58ce4/u/GXz3P5'
'http://127.0.0.1:3000/s.html?=https://zdisk.pages.dev/s?=/1878365517/p/868213406/onepagelink.in/ba811197217054ace79cb24b1139a86745a58ce4/u/GXz3P5'

// below variable stroes the current loctaion in form of string
const loc = document.location + '';
// below variable is array object which breaks the initial link into parts separating / and then takes the last part of the string
// This results in uid being the last segment of the URL path. For example, if loc is "https://example.com/user/12345", then uid will be "12345".
const uid = loc.split("/").slice(-1)[0];
// the below variable strores the cookies and uses a custom javascript function maybe defined below
// it return a object which contains data from cookies 
const cookies = getCok()
// printing the cookies object
console.log(cookies)
// calling the main function
main()



async function main() {
    const ip_address = await getIp()
    var paramv = parseParam(loc)
    const botid = paramv.botid
    const chat = paramv.chat
    const user = paramv.user
    var sdom = paramv.sdom
    var sapi = paramv.sapi
    var uid_type = paramv.uid_type
    var uid = paramv.uid
    if ([botid, chat, user, sdom, sapi].indexOf(undefined) != -1) { loadError(); return }
    print(paramv)
    //if (![6425035802,5329960030].includes(parseInt(botid))) {createPop()}
    var count = parseInt(cookies.count) || 0;
    var link = zdiskLink(botid, chat, uid_type, uid)
    var direct = false
    if (sdom.toLowerCase() == 'tnshort.net') { document.querySelector('.howto').style.display = "block" }
    //if (sdom.toLowerCase() == 'earnwithlink.in' || sdom.toLowerCase() == 'earnwithlink.com') {sdom= 'www.earnwithlink.com'}
    if (count >= 2 || sdom == 'X' || direct) {
        assignBtn(link)
        return
    }
    const suid = generateUID();

    try { setCok(suid, link) }
    catch (e) { loadError(cok = true); return }
    try { var slink = await makeShort(sdom, sapi, suid) }
    catch (e) { loadError(); return }
    print(slink)
    assignBtn(slink)
}
function loadError(cok = false) {
    var error = eget('error')

    const wrapper = eget('.get-link')
    wrapper.style.animation = 'zoomOut'
    wrapper.style.animationDuration = '1.5s'
    var errloc = (document.location + '').replaceAll("https://").replaceAll("http://", "").split("zdisk.fun").slice(-1)[0].replaceAll("/", "<br>")
    error.innerHTML = error.innerHTML + `<br><br><p class='errorloc'>ERROR:<br>${errloc}</p>`
    setTimeout(() => {
        if (cok) { error = eget('cokerror') }
        wrapper.style.display = 'none';
        error.style.display = 'block';
        error.style.animation = 'shakeX'
        error.style.animationDuration = '1s'
    }, 800)


}
function assignBtn(slink) {
    setTimeout(() => {
        var getLinkBtn = eget('.get-link')
        var text = eget('.text')
        var text2 = eget('.text2')
        var loader = eget('.loader')
        text.style.fontSize = '0px'
        loader.style.display = 'none'
        text2.style.fontSize = '20px'
        text2.style.animation = 'fadeInLeft'
        text2.style.animationDuration = '0.5s'
        getLinkBtn.addEventListener('click', () => { cloc(slink) })
    }, 2000);
}
async function makeShort(sdom, sapi, suid) {
    slink = await slinkParser(sdom, sapi, suid)
    var res = await fetch(slink)
    if (sdom.indexOf("shareus") != -1) {
        res = await res.text()
    }
    else {
        res = await res.json();
        res = res['shortenedUrl']
    }
    return res
}
function slinkParser(sdom, sapi, suid) {
    if (sdom.indexOf("shareus") != -1) {
        sdom = "api.shareus.in"
        main_path = 'easy_api'
        api_path = 'key'
        link_path = 'link'
    } else {
        var main_path = "api"
        var api_path = 'api'
        var link_path = 'url'
    }
    // https://zdisk.fun
    link = `https://zdisk.fun/u?=${suid}`
    return `https://${sdom}/${main_path}?${api_path}=${sapi}&${link_path}=${link}`
}
function zdiskLink(botid, chat, uid_type, uid) {
    if (chat == "b") {
        chat = botid
        chat_type = "b"
    } else
        chat_type = 'g'
    link = `https://zdisk.fun/m?=${chat_type}${chat}/${uid_type}/${uid}`;
    return link
}


async function getIp() {
    res = await fetch("https://zkbots.onrender.com/ip")
    res = await res.json()
    res = res.ip
    if (res) { return res }
    return "111.22.33.44"
}

function parseParam(loc) {
    var paramv = loc.split("/")
    paramv = paramv.slice(-7)
    var botid = parseInt(paramv[0])
    var chat = paramv[1]
    var user = paramv[2]
    var sdom = paramv[3]
    var sapi = paramv[4]
    var uid_type = paramv[5]
    var uid = paramv[6]
    return { botid, chat, user, sdom, sapi, uid_type, uid }
}
function eget(e) {
    var k = document.querySelector(e)
    return k
}
function get_data(uid) {
    data = cookies[uid]
}

function setCok(uid, zlink) {
    const sdata = zlink.split('?=')[1]
    var date = new Date();
    var midnight = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    midnight.setHours(24, 0, 0, 0);
    document.cookie = `uid=${uid}#${sdata}; expires=${midnight.toGMTString()}; path=/;`
    document.cookie = `uid=${uid}#${sdata}; expires=${midnight.toGMTString()}; domain=zdisk.fun; ;path=/;`
    // document.cookie = `ip_address=hi; expires=${midnight.toGMTString()}; path=/;`
    // document.cookie = `ip_address=hi; expires=${midnight.toGMTString()}; domain=zdisk.fun; path=/;`
    // document.cookie = `count=hi; expires=${midnight.toGMTString()}; path=/;`
    // document.cookie = `count=hi; expires=${midnight.toGMTString()}; domain=zdisk.fun; path=/;`
    console.log("Cookies Set To: " + document.cookie)
}

function getCok() {
    // below variable gets cookie from document in form a single string
    var cookies = document.cookie
    // below if statement returns a empty obejct if there is no cookies
    if (!cookies) {
        return {}
    }
    // below variable stores a array where the inital string is splitted using ; 
    cookies = cookies.split("; ")
    // initialise an empty object (dictionary) to strore data
    cok = {}
    // below is a for loop which stores the data in the previous cok dictionary
    //     If document.cookie contains "username=JohnDoe; sessionToken=abc123", the function will return the object:
    // {
    //     username: "JohnDoe",
    //     sessionToken: "abc123"
    // }
    for (i = 0; i < cookies.length; i++) {
        temp = cookies[i].split("=")
        cok[temp[0]] = temp[1]
    }
    return cok
}
function generateUID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let uid = '';
    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        uid += characters.charAt(randomIndex);
    }
    return uid;
}

function encrypt(text) {
    var encryptedText = "";
    for (var i = 0; i < text.length; i++) {
        var charCode = text.charCodeAt(i);
        if (charCode >= 97 && charCode <= 122) { // lowercase letters
            encryptedText += String.fromCharCode(((charCode - 97 + 2) % 26) + 97);
        } else if (charCode >= 65 && charCode <= 90) { // uppercase letters
            encryptedText += String.fromCharCode(((charCode - 65 + 2) % 26) + 65);
        } else {
            encryptedText += text.charAt(i); // non-alphabetic characters
        }
    }
    return encryptedText;
}

function cloc(des) { window.location = des }
function print(t) { console.log(t) }
function createPop() {
    var scriptTag = document.createElement('script');
    scriptTag.src = '//hoddlegamey.com/r1zPavS8kJbbtU/70047';
    scriptTag.setAttribute('data-cfasync', 'false');
    scriptTag.async = true;
    scriptTag.type = 'text/javascript';
    document.head.appendChild(scriptTag);
}
