const doc = document;

const plainsvgTextarea = doc.querySelector("#plainsvg");
const downloadLink = doc.querySelector("#downloadlink");
const encodedsvgTextarea = doc.querySelector("#encodedsvg");
const resultCssTextarea = doc.querySelector("#result-css");
const previewArea = doc.querySelector("#preview-img");
const contrastButton = doc.querySelector("#bgcolor");

const expanders = doc.querySelectorAll(".expander");
const expandedClass = "expanded";
const symbols = /[\r\n%#()<>?\[\\\]^`{|}]/g;

const quotesInputs = doc.querySelectorAll(".options__input");
let externalQuotesValue = doc.querySelector(".options__input:checked").value;
let quotes = getQuotes();
const previewBorder = "border: 1px solid green;";
// Textarea Actions
//----------------------------------------
plainsvgTextarea.oninput = function () {
    getResults();
};

doc.querySelector("#copy-plainsvg").addEventListener("click", () => {
    plainsvgTextarea.focus();
    plainsvgTextarea.select();
    try {
        var successful = doc.execCommand("copy");
        var msg = successful ? "successful" : "unsuccessful";
        console.log("Copying text command was " + msg);
    } catch (err) {
        console.log("Oops, unable to copy");
    }
});

encodedsvgTextarea.oninput = function () {
    const value = encodedsvgTextarea.value
        .trim()
        .replace(/background-image:\s{0,}url\(/, ``)
        .replace(/["']{0,}data:image\/svg\+xml,/, ``)
        .replace(/["']\);{0,}$/, ``);
    try {
        plainsvgTextarea.value = decodeURIComponent(value);
        getResults();
    } catch (err) {
        previewArea.setAttribute("src", "");
        plainsvgTextarea.value = "";
        resultCssTextarea.value = "";
        doc.body.style.backgroundImage = "";
        console.log("Bad encoded SVG");
    }
};

doc.querySelector("#copy-encodedsvg").addEventListener("click", () => {
    encodedsvgTextarea.focus();
    encodedsvgTextarea.select();
    try {
        var successful = doc.execCommand("copy");
        var msg = successful ? "successful" : "unsuccessful";
        console.log("Copying text command was " + msg);
    } catch (err) {
        console.log("Oops, unable to copy");
    }
});

doc.querySelector("#copy-resultcss").addEventListener("click", () => {
    resultCssTextarea.focus();
    resultCssTextarea.select();
    try {
        var successful = doc.execCommand("copy");
        var msg = successful ? "successful" : "unsuccessful";
        console.log("Copying text command was " + msg);
    } catch (err) {
        console.log("Oops, unable to copy");
    }
});

function getResults() {
    if (!plainsvgTextarea.value) {
        resultCssTextarea.value = "";
        previewArea.setAttribute(
            "src",
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E"
        );
        previewArea.setAttribute("style", "");
        doc.body.style.backgroundImage = "";
        downloadLink.removeAttribute("href");
        downloadLink.style.cursor = "not-allowed";
        return;
    }

    const namespaced = addNameSpace(plainsvgTextarea.value);
    const escaped = encodeSVG(namespaced);
    encodedsvgTextarea.value = escaped;
    const svgdata = `data:image/svg+xml,${escaped}`;
    const bgurl = `url(${quotes.level1}${svgdata}${quotes.level1})`;
    resultCssTextarea.value = bgurl;
    previewArea.setAttribute("style", previewBorder);
    previewArea.setAttribute("src", svgdata);
    doc.body.style.backgroundImage = bgurl;
    downloadLink.href = makeSvgFile(plainsvgTextarea.value);
    downloadLink.style.cursor = "progress";
}
previewArea.onerror = function () {
    previewArea.setAttribute("style", "");
    downloadLink.removeAttribute("href");
    downloadLink.style.cursor = "not-allowed";
    console.log("Malformed image");
};

var svgFile = null;
function makeSvgFile(text) {
    var data = new Blob([text], { type: "image/svg+xml" });

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (svgFile !== null) {
        window.URL.revokeObjectURL(svgFile);
    }

    svgFile = window.URL.createObjectURL(data);

    return svgFile;
}

// Tabs Actions
//----------------------------------------

for (var i = 0; i < expanders.length; i++) {
    var expander = expanders[i];

    expander.onclick = function () {
        var parent = this.parentNode;
        var expanded = parent.querySelector("." + expandedClass);
        expanded.classList.toggle("hidden");
        this.classList.toggle("opened");
    };
}

// Switch quotes
//----------------------------------------

quotesInputs.forEach((input) => {
    input.addEventListener("input", function () {
        externalQuotesValue = this.value;
        quotes = getQuotes();
        getResults();
    });
});

// Set example
//----------------------------------------
doc.querySelector("#colorcircles").addEventListener("click", () => {
    plainsvgTextarea.value = `<svg width="110" height="110">
  <circle r="50" cx="55" cy="55" fill="tomato"/>
  <circle r="41" cx="52" cy="55" fill="orange"/>
  <circle r="33" cx="53" cy="58" fill="gold"/>
  <circle r="25" cx="52" cy="56" fill="yellowgreen"/>
  <circle r="17" cx="55" cy="55" fill="lightseagreen"/>
  <circle r="9" cx="60" cy="53" fill="teal"/>
</svg>`;
    getResults();
});

doc.querySelector("#greek-waves").addEventListener("click", () => {
    plainsvgTextarea.value = `<svg xmlns="http://www.w3.org/2000/svg" width="90" height="65" viewBox="0 0 26.46 17.2">
  <path d="M0 2.03c1.64-.97 13.22-4.34 14.88 5.58.87 5.2-4.12 7.38-6.94 7.38-5.3 0-8.44-8.72-.51-8.89 0 0-1.38.78-1.1 2.1.4 1.9 2.76 2.44 3.93.74 1.18-1.7-.47-5.85-5.5-4.8-7.67 1.6-4.95 13.64 3.99 13.5 3.89-.07 9.17-1.52 11.9-9.05 1.72-4.7 5.8-6.56 5.8-6.56V-.88H0v2.9z"/>
</svg>`;
    getResults();
});

doc.querySelector("#use").addEventListener("click", () => {
    plainsvgTextarea.value = `<svg width="26" height="26" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <path fill="green" d="M0 0zm24 9.6c1 0 2 1.4 1 2.4L15 22c-.6.5-1.4.5-2 0l-4-4c-1.2-1.3.7-3.2 2-2l3 3 9-9c.4-.3.7-.4 1-.4z"/></svg>`;
    getResults();
});

doc.querySelector("#animate").addEventListener("click", () => {
    plainsvgTextarea.value = `<svg  width="50" height="50"><style type="text/css">  #c {animation: x 5s alternate infinite;}  @keyframes x { from { fill: gold; } to { fill: purple} }</style><circle id="c" cx="30" cy="30" r="20" fill="gold"/><!-- works in chrome ... not in IE and others --></svg>`;
    getResults();
});

doc.querySelector("#trans").addEventListener("click", () => {
    plainsvgTextarea.value = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">    <path fill="#ddd" d="m0 0h16v32h16V16H0z" /></svg>`;
    getResults();
});

doc.querySelector("#zigzag").addEventListener("click", () => {
    plainsvgTextarea.value = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30" viewBox="0 0 20 30">
  <path fill="none" stroke="#6a6" stroke-width="10" d="m-13.6 27 23-20.7 26.5 22"/>
</svg>`;
    getResults();
});

// Preview Background Switch
//----------------------------------------

contrastButton.onchange = function () {
    previewArea.style.background = contrastButton.value;
    doc.body.style.backgroundColor = contrastButton.value;
};

// Namespace
//----------------------------------------

function addNameSpace(data) {
    if (data.indexOf("http://www.w3.org/2000/svg") < 0) {
        data = data.replace(
            /<svg/g,
            `<svg xmlns=${quotes.level2}http://www.w3.org/2000/svg${quotes.level2}`
        );
    }

    return data;
}

// Encoding
//----------------------------------------

function encodeSVG(data) {
    // Use single quotes instead of double to avoid encoding.
    if (externalQuotesValue === "double") {
        data = data.replace(/"/g, "'");
    } else {
        data = data.replace(/'/g, '"');
    }

    data = data.replace(/>\s{1,}</g, "><");
    data = data.replace(/\s{2,}/g, " ");

    return data.replace(symbols, encodeURIComponent);
}

// Get quotes for levels
//----------------------------------------

function getQuotes() {
    const double = `"`;
    const single = `'`;

    return {
        level1: externalQuotesValue === "double" ? double : single,
        level2: externalQuotesValue === "double" ? single : double
    };
}

function dragDropTextLoader(dropTargetTextarea, textHandler, filesHandler) {
    dropTargetTextarea.addEventListener("dragover", function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = "copy";
    });
    dropTargetTextarea.addEventListener("drop", function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var files = evt.dataTransfer.files;
        var count = files.length;
        var filesObj = [];
        function loadEndHandler(i) {
            return function (event) {
                var file = files[i];
                var name = file.name;
                //dropTargetTextarea.value = event.target.result;
                textHandler(event.target.result);
                filesObj.push({ name: name, content: event.target.result });
                if (filesObj.length == count) {
                    if (filesHandler) {
                        filesHandler(filesObj);
                    }
                }
            };
        }
        for (var i = 0; i < files.length; i++) {
            var reader = new FileReader();
            reader.onload = loadEndHandler(i);
            reader.readAsText(files[i], "UTF-8");
        }
    });
}

function putText(txt) {
    plainsvgTextarea.value = txt;
    getResults();
}
function filesReady(files) {
    console.log(files);
}
dragDropTextLoader(plainsvgTextarea, putText, filesReady);
