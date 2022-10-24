let print_button = document.getElementById('print-button');
let download_report_button = document.getElementById('download-report-button');

function strip(string) {
    return string.replace(/^\s+|\s+$/g, '');
}

print_button.onclick = function(){
    window.print();
};

download_report_button.onclick = function()
{
    window.open('/download_report');
}



