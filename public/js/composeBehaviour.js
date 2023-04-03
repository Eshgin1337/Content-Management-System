function existenceCheck() {
    if (document.getElementById('new').checked) {
        document.getElementById('typetitle').style.display = "block";
        document.getElementById('selecttitle').style.display = "none";
        document.getElementById('subtitleLebel').innerText = "Create subtitle";
    } else if (document.getElementById('existing').checked) {
        document.getElementById('typetitle').style.display = "none";
        document.getElementById('selecttitle').style.display = "block";
    }
}
