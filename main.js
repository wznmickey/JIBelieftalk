var messageIterator;
const { Realtime, TextMessage, TypedMessagesPlugin, ImageMessage } = AV;
const realtime = new Realtime({
    appId: '65ITQv1gCBeVOfaB5lY2YsxE-9Nh9j0Va',
    appKey: '5Jg7aEOsyhVt3JLESAH55H8o',
    server: 'https://api.belief.wznmickey.com',
    plugins: [TypedMessagesPlugin],
});
AV.init({
    appId: "65ITQv1gCBeVOfaB5lY2YsxE-9Nh9j0Va",
    appKey: "5Jg7aEOsyhVt3JLESAH55H8o",
    serverURL: "https://api.belief.wznmickey.com"
});
const currentUser = AV.User.current();
var iMClient;
var conversation;
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
function changenickname() {
    var inputbox = document.createElement("input");
    var par = document.getElementById("toppart");
    var son = document.getElementById("mynickname");
    par.insertBefore(inputbox, son);
    par.removeChild(son);
    document.getElementById("submitnickname").innerHTML = "确定";
    document.getElementById("submitnickname").onclick = function () { savenickname(); }
    inputbox.id = "inputbox";
}
function savenickname() {
    var newnickname = document.getElementById("inputbox").value;
    const nicknametempfind = new AV.Query('User_nickname');
    nicknametempfind.equalTo('UserId', iMClient.id);
    nicknametempfind.find().then((user) => {
        temp = user[0].id;
        console.log(user);
        const toSave = AV.Object.createWithoutData('User_nickname', temp);
        toSave.set('nickname', newnickname);
        toSave.save();
        var textbox = document.createElement("text");
        var par = document.getElementById("toppart");
        var son = document.getElementById("inputbox");
        par.insertBefore(textbox, son);
        par.removeChild(son);
        textbox.id = "mynickname";
        getNownickname();
        alert("完成修改");
    })
}
function getHistory() {
    messageIterator.next().then(function (result) {
        var messages = result.value;
        var temp = "";
        for (var i = 0; i < messages.length; i++) {
            temp = temp + "<p>" + messages[i].from + ":" + messages[i].text;
        }
        document.getElementById("received").innerHTML = temp + document.getElementById("received").innerHTML;
        $('html,body').animate({ scrollTop: "100000px" }, 100);
    }).catch(console.error.bind(console));
    $('html,body').animate({ scrollTop: "100000px" }, 100);
}
function setContacterlist(iMClient) {
    var contacterquery = iMClient.getQuery();
    contacterquery.find().then(function (conversations) {
        console.log(conversations);
        var options = {
            valueNames: [{ data: ['Id'] }, 'nickname'],
            item: '<li onclick="setcontacter(this)"><button class="nickname" style="width: 100%;white-space:normal;word-break: break-all; font-size:larger"></button></li>'
        };
        var values = [];
        for (var i = 0; i < conversations.length; i++) {
            var j;
            for (j = 0; j < conversations[i].members.length; j++) {
                if (conversations[i].members[j] != iMClient.id) break;
            }
            var tempvalue;
            (function (i, j) {
                const nicknametempfind = new AV.Query('User_nickname');
                nicknametempfind.equalTo('UserId', conversations[i].members[j]);
                //sleep(20).then(() => {
                nicknametempfind.find().then((tempuser) => {
                    console.log(tempuser);
                    console.log(tempuser.length);
                    if (tempuser.length >= 1) {
                        console.log(tempuser[0].get('nickname'));
                        tempvalue = { nickname: tempuser[0].get('nickname'), Id: conversations[i].members[j] };
                    }
                    else {
                        tempvalue = { nickname: conversations[i].members[j], Id: conversations[i].members[j] };
                    }

                    values[i] = tempvalue;
                    console.log(tempvalue);
                    var list = new List('contacter', options, values);
                    list.clear();
                    List('contacter', options, values);
                });
                //});
            })(i, j);
        }

    }).catch(console.error.bind(console));
}
function switchleftpart() {
    if (document.getElementById("leftpart").hidden == false) {
        document.getElementById("leftpart").hidden = true;
        document.getElementById("rightpart").style.marginLeft="0%";// = "text-align:center;font-size:24px;text-size-adjust: none;";
        document.getElementById("toppart").style.left="50%";// = "position: fixed;left: 50%;white-space: normal;word-wrap: break-word;word-break: break-all;height: 10%;transform: translateX(-50%);width: fit-content;max-width: 60%;";
        document.getElementById("bottompart").style.left="50%";// = "position:fixed;top:90%;left:50%;transform: translateX(-50%);";
    }
    else {
        document.getElementById("leftpart").hidden = false;
        document.getElementById("rightpart").style.marginLeft="30%";// = "margin-left:30%; text-align:center;font-size:24px;text-size-adjust: none;";
        document.getElementById("toppart").style.left="65%"; // = "position: fixed;left: 65%;white-space: normal;word-wrap: break-word;word-break: break-all;height: 10%;transform: translateX(-50%);width: fit-content;max-width: 60%;";
        document.getElementById("bottompart").style.left="65%"; // = "position:fixed;top:90%;left:65%;transform: translateX(-50%);";

    }
}
function setcontacter(event) {
    document.getElementById("inputCertainUser").value = event.dataset.id;
    connect();
}
function getNownickname() {
    var nicknamequery = new AV.Query('User_nickname');
    nicknamequery.equalTo('UserId', iMClient.id);
    nicknamequery.find().then((nickname) => {
        nickname[0].fetch().then((newnickname) => {
            document.getElementById("mynickname").innerHTML = newnickname.get("nickname");
        }
        )
    })
}
realtime.createIMClient(currentUser).then(function (user) {
    iMClient = user;
    console.log(iMClient);
    getNownickname();
    setContacterlist(iMClient);

    iMClient.on('invited', function invitedEventHandler(payload, conversation) {
        console.log(payload.invitedBy, conversation.id);
        setContacterlist(iMClient);
    });

    user.on('message', function (message, conversation) {
        console.log('收到新消息：' + message.text);
        document.getElementById("received").innerHTML = document.getElementById("received").innerHTML + "<p>" + message.from + ":" + message.text;
    });

});
if (!currentUser) {
    window.location.href = "index.html";
}
function logout() {
    AV.User.logOut();
    iMClient.close().then(function () {
        console.log('退出登录');
    }).catch(console.error.bind(console));
    window.location.href = "index.html";
}
function connect() {
    iMClient.createConversation({
        members: [document.getElementById("inputCertainUser").value],
        name: 'testconversation',
        unique: true
    }).then(function (con) {
        conversation = con;
        document.getElementById("partId").innerHTML = document.getElementById("inputCertainUser").value;
        setContacterlist(iMClient);
        document.getElementById("received").innerHTML = "";
        messageIterator = con.createMessagesIterator({ limit: 20 });
        messageIterator.next().then(function (result) {
            var messages = result.value;
            for (var i = 0; i < messages.length; i++) {
                document.getElementById("received").innerHTML = document.getElementById("received").innerHTML + "<p>" + messages[i].from + ":" + messages[i].text;
            }
        }).catch(console.error.bind(console));
        document.getElementById("inputCertainUser").value = "";
    });
}
function send() {
    conversation.send(new TextMessage(document.getElementById("message").value)).then(function (message) {
        console.log('发送成功！');
        document.getElementById("received").innerHTML = document.getElementById("received").innerHTML + "<p>" + iMClient.id + ":" + document.getElementById("message").value;

    }).catch(console.error);

}
//function sendonline() {
//    const message = new TextMessage('OFFLINEofflineOFFLINE_willMessage');
//    conversation.send(message, { will: true });
//}
