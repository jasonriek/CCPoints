let search_entry = document.getElementById("search-entry");
let search_button = document.getElementById("search-button");

search_entry.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if(event.key === "Enter") {
        event.preventDefault();
        search_button.click();
    }
});