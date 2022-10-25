let points_input = document.getElementById('points');
let hidden_points_input = document.getElementById('_points');
let points_span = document.getElementById('points_text');
let points = 0;

points_input.addEventListener("input", (event) => {
        hidden_points_input.value = points_input.value;
        points = parseFloat(points_input.value);
})

// Overwrites primary modal onclick listener
modal_button.onclick = function()
{
    if(points > 0)
    {
        points_input.innerText = points_input.value;
        hidden_points_input.value = points_input.value;
        points_span.innerHTML = points_input.value;
        modal.style.display = "block";
    }
    else
        alert("The points entry is either blank or zero.");

}