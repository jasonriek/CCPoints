let print_button = document.getElementById('print-button');
let download_report_button = document.getElementById('download-report-button');

function strip(string) {
    return string.replace(/^\s+|\s+$/g, '');
}

// Sorting Buttons

let sorting_columns_ids = ['n', 'pn', 'p'];
let sorting_colums = {};
for(let column of sorting_columns_ids)
{
    sorting_colums[column] = document.getElementById(`${column}-desc`);
    if(sorting_colums[column]) // desc order
    {
        sorting_colums[column].onclick = function(){document.getElementById(`${column}-desc-button`).click();};
    }
    else // asc
    {
        sorting_colums[column] = document.getElementById(`${column}-asc`);
        sorting_colums[column].onclick = function(){document.getElementById(`${column}-asc-button`).click();};
    }

}


print_button.onclick = function(){
    window.print();
};

download_report_button.onclick = function()
{
    window.open('/download_report');
}



