var setStyle = function (cssArr) {
    document.write('<link href="' + cssArr + '" type="text/css" rel=stylesheet>');
};

function goPAGE() {
    if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
        setStyle(['./css/m-style.css']);
    } else {
        setStyle(['./css/pc-style.css']);
        // window.location.href = "pc.html";
    }
}

goPAGE(); // 调用function