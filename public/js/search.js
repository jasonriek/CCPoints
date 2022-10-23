let search_entry = document.getElementById("search-entry");
let search_button = document.getElementById("search-button");
let search_form = document.getElementById('search-form');

search_entry.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if(event.key === "Enter") {
        //search_form.setAttribute('action', `/participants/${this.value}`);
        event.preventDefault();
        search_button.click();
    }
});

if(search_entry.value)
    document.getElementsByName('h').forEach(h_input => {h_input.value = search_entry.value});
            