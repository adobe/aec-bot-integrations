function toggleIFrame(btn, iFrameId) {
    var iframe = document.getElementById(iFrameId);
    if (iframe.style.display == "block") {
        iframe.style.display = "none";
    }
    else {
        iframe.style.display = "block"
    }
    btn.classList.toggle("bot-button-hide");
    btn.classList.toggle("bot-button-show");
}