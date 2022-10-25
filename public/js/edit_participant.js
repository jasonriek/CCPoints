let name_input = document.getElementById('name');
let hidden_name_input = document.getElementById('_name');
let points = 0;
let change_info_box = document.getElementById('changes');

let input_ids = ['name', 'phone_number', 'email'];
let old_values = {};
let change = false;

input_ids.forEach(input_id => {
    old_values[input_id] = document.getElementById(input_id).value;
    document.getElementById(input_id).addEventListener('input', (event) => {
        let input = document.getElementById(input_id);
        let hidden_input = document.getElementById('_'+input_id);
        let value = strip(input.value);
        let change_span = document.getElementById(input_id + '_change');
        let change_br = document.getElementById(input_id + '_br');
        if(value)
        {
            hidden_input.value = value;
            change = (strip(old_values[input_id]) !== value);
            if(change)
            {
                change_span.innerHTML = `${old_values[input_id]} to ${value}`;
                change_br.setAttribute('style', '');

            }
            else
            {
                change_span.innerHTML = "";
                change_br.setAttribute('style', 'display: none;');
            }
        }
    });
});

// Overwrites primary modal onclick listener
modal_button.onclick = function()
{
    if(change)
    {
        modal.style.display = "block";
    }
    else
        alert("An entry is either blank or no changes have been made.");

}